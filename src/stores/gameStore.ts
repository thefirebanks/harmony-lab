/**
 * Tonic Target Game Store
 * State management for the Tonic Target Practice game
 */

import { create } from 'zustand';
import type { Chord } from '@/lib/music/types';
import type { TonicTargetRound, TonicTargetAnswer } from '@/games/tonic-target/types';
import type { SessionStats, ValidationResult, TheoryCard } from '@/lib/game-engine/types';
import { 
  generateRound, 
  validateAnswer, 
  getNextSlot,
  isAnswerComplete as checkAnswerComplete,
} from '@/games/tonic-target/logic';
import { tonicTargetConfig } from '@/games/tonic-target/config';
import { createInitialSession } from '@/lib/game-engine/types';
import { playChord, playProgression, playVoicingSequence } from '@/lib/audio';
import { getSimpleVoicing, getSimpleVoicingWithBass } from '@/lib/music';
import { useSettingsStore } from './settingsStore';

interface TonicTargetGameState {
  // Game state
  round: TonicTargetRound | null;
  answer: TonicTargetAnswer;
  feedback: ValidationResult | null;
  session: SessionStats;
  theoryCard: TheoryCard | null;
  
  // UI state
  isPlaying: boolean;
  showFeedback: boolean;
  
  // Actions
  startNewRound: () => void;
  selectChord: (chord: Chord) => void;
  clearSlot: (slot: 'ii' | 'V' | 'I') => void;
  submitAnswer: () => void;
  nextRound: () => void;
  resetSession: () => void;
  playTonic: () => void;
  playUserAnswer: () => void;
  playCorrectAnswer: () => void;
}

export const useTonicTargetStore = create<TonicTargetGameState>((set, get) => ({
  // Initial state
  round: null,
  answer: { ii: null, V: null, I: null },
  feedback: null,
  session: createInitialSession(),
  theoryCard: null,
  isPlaying: false,
  showFeedback: false,
  
  // Actions
  startNewRound: () => {
    const settings = useSettingsStore.getState().tonicTarget;
    const newRound = generateRound(settings);
    
    set({
      round: newRound,
      answer: { ii: null, V: null, I: null },
      feedback: null,
      showFeedback: false,
      theoryCard: null,
    });
    
    // Auto-play tonic if enabled
    if (settings.autoPlayTonic) {
      get().playTonic();
    }
  },
  
  selectChord: (chord) => {
    const { answer, showFeedback } = get();
    if (showFeedback) return; // Don't allow changes during feedback
    
    const nextSlot = getNextSlot(answer);
    if (!nextSlot) return; // All slots filled
    
    set({
      answer: { ...answer, [nextSlot]: chord },
    });
  },
  
  clearSlot: (slot) => {
    const { answer, showFeedback } = get();
    if (showFeedback) return;
    
    set({
      answer: { ...answer, [slot]: null },
    });
  },
  
  submitAnswer: () => {
    const { round, answer, session } = get();
    if (!round) return;
    if (!checkAnswerComplete(answer)) return;
    
    const result = validateAnswer(round, answer);
    const theoryCards = tonicTargetConfig.getTheoryCards(round, result.isCorrect);
    
    set({
      feedback: result,
      showFeedback: true,
      theoryCard: theoryCards.length > 0 ? theoryCards[0] : null,
      session: {
        ...session,
        roundsCompleted: session.roundsCompleted + 1,
        roundsCorrect: session.roundsCorrect + (result.isCorrect ? 1 : 0),
        currentStreak: result.isCorrect ? session.currentStreak + 1 : 0,
      },
    });
    
    // Play the user's answer
    get().playUserAnswer();
  },
  
  nextRound: () => {
    get().startNewRound();
  },
  
  resetSession: () => {
    set({
      session: createInitialSession(),
      round: null,
      answer: { ii: null, V: null, I: null },
      feedback: null,
      showFeedback: false,
      theoryCard: null,
    });
    get().startNewRound();
  },
  
  playTonic: async () => {
    const { round, isPlaying } = get();
    if (!round || isPlaying) return;

    set({ isPlaying: true });

    try {
      const settings = useSettingsStore.getState().tonicTarget;
      const voicing = settings.includeBassNote
        ? getSimpleVoicingWithBass(round.correctProgression.I)
        : getSimpleVoicing(round.correctProgression.I, 4);
      await playChord(voicing, '2n');
    } finally {
      // Reset after a short delay
      setTimeout(() => set({ isPlaying: false }), 1500);
    }
  },
  
  playUserAnswer: async () => {
    const { answer, isPlaying } = get();
    if (isPlaying) return;
    if (!answer.ii || !answer.V || !answer.I) return;

    set({ isPlaying: true });

    try {
      const settings = useSettingsStore.getState().tonicTarget;
      const buildVoicing = (chord: Chord) =>
        settings.includeBassNote ? getSimpleVoicingWithBass(chord) : getSimpleVoicing(chord, 4);
      const voicings = [
        buildVoicing(answer.ii),
        buildVoicing(answer.V),
        buildVoicing(answer.I),
      ];
      await playVoicingSequence(voicings, settings.playbackTempo, 2);
    } finally {
      setTimeout(() => set({ isPlaying: false }), 4000);
    }
  },
  
  playCorrectAnswer: async () => {
    const { round, isPlaying } = get();
    if (!round || isPlaying) return;
    
    set({ isPlaying: true });
    
    try {
      const settings = useSettingsStore.getState().tonicTarget;
      await playProgression(round.correctProgression, settings.playbackTempo, settings.includeBassNote);
    } finally {
      setTimeout(() => set({ isPlaying: false }), 4000);
    }
  },
}));
