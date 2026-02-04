/**
 * Interval Flash Game Store
 * State management for the Interval Flash game
 */

import { create } from 'zustand';
import type { SessionStats, ValidationResult, TheoryCard } from '@/lib/game-engine/types';
import type { IntervalFlashRound, IntervalFlashAnswer, IntervalName } from '@/games/interval-games/types';
import {
  generateFlashRound,
  validateFlashAnswer,
  pitchToNoteString,
} from '@/games/interval-games/logic';
import { intervalFlashConfig } from '@/games/interval-games/config';
import { createInitialSession } from '@/lib/game-engine/types';
import { playNote } from '@/lib/audio';
import { useSettingsStore } from './settingsStore';
import { useSessionPersistenceStore } from './sessionPersistenceStore';

interface IntervalFlashGameState {
  // Game state
  round: IntervalFlashRound | null;
  answer: IntervalFlashAnswer;
  feedback: ValidationResult | null;
  session: SessionStats;
  theoryCard: TheoryCard | null;

  // Timer state
  timeRemaining: number; // milliseconds
  timerActive: boolean;
  timerIntervalId: NodeJS.Timeout | null;

  // UI state
  isPlaying: boolean;
  showFeedback: boolean;
  isSessionComplete: boolean;

  // Actions
  startNewRound: () => void;
  selectAnswer: (interval: IntervalName) => void;
  submitAnswer: () => void;
  handleTimeout: () => void;
  nextRound: () => void;
  resetSession: () => void;
  playInterval: () => void;

  // Timer actions
  startTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;

  // Session persistence
  pauseSession: () => void;
  restoreSession: () => boolean;
  hasPausedSession: () => boolean;
}

export const useIntervalFlashStore = create<IntervalFlashGameState>((set, get) => ({
  // Initial state
  round: null,
  answer: null,
  feedback: null,
  session: createInitialSession(),
  theoryCard: null,
  timeRemaining: 0,
  timerActive: false,
  timerIntervalId: null,
  isPlaying: false,
  showFeedback: false,
  isSessionComplete: false,

  // Actions
  startNewRound: () => {
    const settings = useSettingsStore.getState().intervalFlash;

    // Check if session is complete (time mode)
    if (
      settings.sessionMode === 'time' &&
      Date.now() - get().session.startTime.getTime() >= settings.timeLimitSeconds * 1000
    ) {
      set({ isSessionComplete: true });
      return;
    }

    // Check if session is complete (rounds mode)
    const { session } = get();
    if (
      settings.sessionMode === 'rounds' &&
      session.currentRound > settings.roundsPerSession
    ) {
      set({ isSessionComplete: true });
      return;
    }

    // Generate new round
    const newRound = generateFlashRound(settings);

    set({
      round: newRound,
      answer: null,
      feedback: null,
      showFeedback: false,
      theoryCard: null,
      timeRemaining: newRound.timeLimit,
      timerActive: false,
    });

    // Auto-play interval after short delay
    setTimeout(() => {
      get().playInterval();
      // Start timer after playing interval
      setTimeout(() => {
        get().startTimer();
      }, 800); // Start timer after both notes have played
    }, 300);
  },

  selectAnswer: (interval) => {
    const { showFeedback } = get();
    if (showFeedback) return; // Don't allow changes during feedback

    // Stop the timer
    get().stopTimer();

    // Set the answer
    set({ answer: interval });

    // Auto-submit
    get().submitAnswer();
  },

  submitAnswer: () => {
    const { round, answer, session } = get();
    if (!round) return;

    // Stop timer if running
    get().stopTimer();

    const result = validateFlashAnswer(round, answer);
    const theoryCards = intervalFlashConfig.getTheoryCards(round, result.isCorrect);
    const settings = useSettingsStore.getState().intervalFlash;

    // Check if session should end (time mode)
    const timeExpired =
      settings.sessionMode === 'time' &&
      Date.now() - session.startTime.getTime() >= settings.timeLimitSeconds * 1000;

    // Check if session should end (rounds mode)
    const roundsComplete =
      settings.sessionMode === 'rounds' &&
      session.currentRound >= settings.roundsPerSession;

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
      isSessionComplete: timeExpired || roundsComplete,
    });
  },

  handleTimeout: () => {
    const { round, showFeedback } = get();
    if (!round || showFeedback) return;

    // Stop timer
    get().stopTimer();

    // Submit with null answer (timeout)
    set({ answer: null });
    get().submitAnswer();
  },

  nextRound: () => {
    const { session } = get();
    const settings = useSettingsStore.getState().intervalFlash;

    // Check session limits
    if (
      settings.sessionMode === 'time' &&
      Date.now() - session.startTime.getTime() >= settings.timeLimitSeconds * 1000
    ) {
      set({ isSessionComplete: true });
      return;
    }
    if (
      settings.sessionMode === 'rounds' &&
      session.currentRound >= settings.roundsPerSession
    ) {
      set({ isSessionComplete: true });
      return;
    }

    // Move to next round
    set({
      session: { ...session, currentRound: session.currentRound + 1 },
    });
    get().startNewRound();
  },

  resetSession: () => {
    // Stop any running timer
    get().stopTimer();

    set({
      session: createInitialSession(),
      round: null,
      answer: null,
      feedback: null,
      showFeedback: false,
      theoryCard: null,
      isSessionComplete: false,
      timeRemaining: 0,
      timerActive: false,
    });
    get().startNewRound();
  },

  playInterval: async () => {
    const { round, isPlaying } = get();
    if (!round || isPlaying) return;

    set({ isPlaying: true });

    try {
      // Play root note
      const rootNoteString = pitchToNoteString(round.rootNote);
      await playNote(rootNoteString, '4n');

      // Wait then play target note
      await new Promise((resolve) => setTimeout(resolve, 400));
      const targetNoteString = pitchToNoteString(round.targetNote);
      await playNote(targetNoteString, '4n');
    } finally {
      setTimeout(() => set({ isPlaying: false }), 500);
    }
  },

  // Timer actions
  startTimer: () => {
    const { timerIntervalId, showFeedback } = get();
    if (timerIntervalId || showFeedback) return;

    const intervalId = setInterval(() => {
      get().tickTimer();
    }, 100); // Update every 100ms for smooth countdown

    set({ timerActive: true, timerIntervalId: intervalId });
  },

  stopTimer: () => {
    const { timerIntervalId } = get();
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      set({ timerActive: false, timerIntervalId: null });
    }
  },

  tickTimer: () => {
    const { timeRemaining, showFeedback } = get();

    if (showFeedback) {
      get().stopTimer();
      return;
    }

    const newTime = timeRemaining - 100;

    if (newTime <= 0) {
      set({ timeRemaining: 0 });
      get().handleTimeout();
    } else {
      set({ timeRemaining: newTime });
    }
  },

  // Session persistence
  pauseSession: () => {
    const { round, answer, session, showFeedback, isSessionComplete } = get();

    // Don't save if showing feedback, session is complete, or no round
    if (!round || showFeedback || isSessionComplete) return;

    // Stop timer before saving
    get().stopTimer();

    useSessionPersistenceStore.getState().saveIntervalFlashSession(round, answer, session);
  },

  restoreSession: () => {
    const savedSession = useSessionPersistenceStore.getState().getIntervalFlashSession();
    if (!savedSession) return false;

    set({
      round: savedSession.round,
      answer: savedSession.answer,
      session: savedSession.session,
      feedback: null,
      showFeedback: false,
      theoryCard: null,
      isSessionComplete: false,
      timeRemaining: savedSession.round.timeLimit,
      timerActive: false,
    });

    useSessionPersistenceStore.getState().clearIntervalFlashSession();

    // Play the interval and start timer after restoring
    setTimeout(() => {
      get().playInterval();
      setTimeout(() => {
        get().startTimer();
      }, 800);
    }, 300);

    return true;
  },

  hasPausedSession: () => {
    return useSessionPersistenceStore.getState().hasIntervalFlashSession();
  },
}));
