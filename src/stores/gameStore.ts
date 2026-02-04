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
import { getDiatonicChord, getSimpleVoicing, getSimpleVoicingWithBass } from '@/lib/music';
import { useSettingsStore } from './settingsStore';
import { useProgressStore } from './progressStore';
import { useSessionPersistenceStore } from './sessionPersistenceStore';

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
  isSessionComplete: boolean;

  // Actions
  startNewRound: () => void;
  selectChord: (chord: Chord) => void;
  clearSlot: (slot: 'ii' | 'V' | 'I') => void;
  submitAnswer: () => void;
  skipRound: () => void;
  nextRound: () => void;
  resetSession: () => void;
  playTonic: () => void;
  playTarget: () => void;
  playUserAnswer: () => void;
  playCorrectAnswer: () => void;

  // Session persistence
  pauseSession: () => void;
  restoreSession: () => boolean;
  hasPausedSession: () => boolean;
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
  isSessionComplete: false,
  
  // Actions
  startNewRound: () => {
    const settings = useSettingsStore.getState().tonicTarget;
    const newRound = generateRound(settings);

    if (
      settings.sessionMode === 'time' &&
      Date.now() - get().session.startTime.getTime() >= settings.timeLimitSeconds * 1000
    ) {
      set({ isSessionComplete: true });
      return;
    }
    
    set({
      round: newRound,
      answer: { ii: null, V: null, I: null },
      feedback: null,
      showFeedback: false,
      theoryCard: null,
    });
    
    // Auto-play tonic if enabled
    if (settings.autoPlayTonic) {
      const tonicChord = getDiatonicChord(newRound.key.tonic, 1);
      const voicing = settings.includeBassNote
        ? getSimpleVoicingWithBass(tonicChord)
        : getSimpleVoicing(tonicChord, 4);
      set({ isPlaying: true });
      playChord(voicing, '2n').finally(() => {
        setTimeout(() => set({ isPlaying: false }), 1500);
      });
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
    const settings = useSettingsStore.getState().tonicTarget;
    const timeExpired = settings.sessionMode === 'time'
      && Date.now() - session.startTime.getTime() >= settings.timeLimitSeconds * 1000;

    // Record result in progress store
    useProgressStore.getState().recordRoundResult(round.key.tonic, result.isCorrect);

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
      isSessionComplete: timeExpired ? true : get().isSessionComplete,
    });

    // Play the user's answer
    get().playUserAnswer();
  },

  skipRound: () => {
    const { session } = get();
    const settings = useSettingsStore.getState().tonicTarget;

    // Check if session should end
    if (
      settings.sessionMode === 'time' &&
      Date.now() - session.startTime.getTime() >= settings.timeLimitSeconds * 1000
    ) {
      set({ isSessionComplete: true });
      return;
    }
    if (settings.sessionMode === 'rounds' && session.currentRound >= settings.roundsPerSession) {
      set({ isSessionComplete: true });
      return;
    }

    // Move to next round without recording progress
    set({
      session: { ...session, currentRound: session.currentRound + 1 },
    });
    get().startNewRound();
  },
  
  nextRound: () => {
    const { session } = get();
    const settings = useSettingsStore.getState().tonicTarget;

    // Check if session should end
    if (
      settings.sessionMode === 'time' &&
      Date.now() - session.startTime.getTime() >= settings.timeLimitSeconds * 1000
    ) {
      set({ isSessionComplete: true });
      return;
    }
    if (settings.sessionMode === 'rounds' && session.currentRound >= settings.roundsPerSession) {
      set({ isSessionComplete: true });
      return;
    }

    // Move to next round and start it
    set({
      session: { ...session, currentRound: session.currentRound + 1 },
    });
    get().startNewRound();
  },
  
  resetSession: () => {
    const { session } = get();

    // Save the current session to progress store if there are completed rounds
    if (session.roundsCompleted > 0) {
      useProgressStore.getState().saveSession(
        session.roundsCompleted,
        session.roundsCorrect,
        session.startTime
      );
    }

    set({
      session: createInitialSession(),
      round: null,
      answer: { ii: null, V: null, I: null },
      feedback: null,
      showFeedback: false,
      theoryCard: null,
      isSessionComplete: false,
    });
    get().startNewRound();
  },
  
  playTonic: async () => {
    const { round, isPlaying } = get();
    if (!round || isPlaying) return;

    set({ isPlaying: true });

    try {
      const settings = useSettingsStore.getState().tonicTarget;
      const tonicChord = getDiatonicChord(round.key.tonic, 1);
      const voicing = settings.includeBassNote
        ? getSimpleVoicingWithBass(tonicChord)
        : getSimpleVoicing(tonicChord, 4);
      await playChord(voicing, '2n');
    } finally {
      // Reset after a short delay
      setTimeout(() => set({ isPlaying: false }), 1500);
    }
  },

  playTarget: async () => {
    const { round, isPlaying } = get();
    if (!round || isPlaying) return;

    set({ isPlaying: true });

    try {
      const settings = useSettingsStore.getState().tonicTarget;
      const targetChord = getDiatonicChord(round.key.tonic, round.targetDegree);
      const voicing = settings.includeBassNote
        ? getSimpleVoicingWithBass(targetChord)
        : getSimpleVoicing(targetChord, 4);
      await playChord(voicing, '2n');
    } finally {
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

  pauseSession: () => {
    const { round, answer, session, showFeedback, isSessionComplete } = get();

    // Don't save if showing feedback, session is complete, or no round
    if (!round || showFeedback || isSessionComplete) return;

    useSessionPersistenceStore.getState().saveTonicTargetSession(round, answer, session);
  },

  restoreSession: () => {
    const savedSession = useSessionPersistenceStore.getState().getTonicTargetSession();
    if (!savedSession) return false;

    set({
      round: savedSession.round,
      answer: savedSession.answer,
      session: savedSession.session,
      feedback: null,
      showFeedback: false,
      theoryCard: null,
      isSessionComplete: false,
    });

    useSessionPersistenceStore.getState().clearTonicTargetSession();
    return true;
  },

  hasPausedSession: () => {
    return useSessionPersistenceStore.getState().hasTonicTargetSession();
  },
}));
