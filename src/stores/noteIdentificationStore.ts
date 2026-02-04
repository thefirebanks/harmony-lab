/**
 * Note Identification Game Store
 */

import { create } from 'zustand';
import type { NoteName } from '@/lib/music/types';
import type { SessionStats, ValidationResult } from '@/lib/game-engine/types';
import { createInitialSession } from '@/lib/game-engine/types';
import { playNote } from '@/lib/audio';
import type { NoteIdentificationRound, NoteIdentificationAnswer } from '@/games/note-identification/types';
import { generateRound, validateAnswer } from '@/games/note-identification/logic';
import { useSettingsStore } from './settingsStore';
import { useProgressStore } from './progressStore';
import { useSessionPersistenceStore } from './sessionPersistenceStore';

interface NoteIdentificationGameState {
  round: NoteIdentificationRound | null;
  answer: NoteIdentificationAnswer;
  feedback: ValidationResult | null;
  session: SessionStats;
  isPlaying: boolean;
  showFeedback: boolean;
  isSessionComplete: boolean;

  startNewRound: () => void;
  submitAnswer: (note: NoteName) => void;
  nextRound: () => void;
  resetSession: () => void;
  playTarget: () => void;

  // Session persistence
  pauseSession: () => void;
  restoreSession: () => boolean;
  hasPausedSession: () => boolean;
}

export const useNoteIdentificationStore = create<NoteIdentificationGameState>((set, get) => ({
  round: null,
  answer: null,
  feedback: null,
  session: createInitialSession(),
  isPlaying: false,
  showFeedback: false,
  isSessionComplete: false,

  startNewRound: () => {
    const settings = useSettingsStore.getState().noteIdentification;

    if (
      settings.sessionMode === 'time' &&
      Date.now() - get().session.startTime.getTime() >= settings.timeLimitSeconds * 1000
    ) {
      set({ isSessionComplete: true });
      return;
    }

    const newRound = generateRound(settings);
    set({
      round: newRound,
      answer: null,
      feedback: null,
      showFeedback: false,
    });

    if (settings.autoPlayNote) {
      get().playTarget();
    }
  },

  submitAnswer: (note) => {
    const { round, session, showFeedback } = get();
    if (!round || showFeedback) return;

    const result = validateAnswer(round, note);
    const settings = useSettingsStore.getState().noteIdentification;
    const timeExpired = settings.sessionMode === 'time'
      && Date.now() - session.startTime.getTime() >= settings.timeLimitSeconds * 1000;

    useProgressStore.getState().recordRoundResult(round.targetNote, result.isCorrect);

    set({
      answer: note,
      feedback: result,
      showFeedback: true,
      session: {
        ...session,
        roundsCompleted: session.roundsCompleted + 1,
        roundsCorrect: session.roundsCorrect + (result.isCorrect ? 1 : 0),
        currentStreak: result.isCorrect ? session.currentStreak + 1 : 0,
      },
      isSessionComplete: timeExpired ? true : get().isSessionComplete,
    });
  },

  nextRound: () => {
    const { session } = get();
    const settings = useSettingsStore.getState().noteIdentification;

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

    set({
      session: { ...session, currentRound: session.currentRound + 1 },
    });
    get().startNewRound();
  },

  resetSession: () => {
    const { session } = get();

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
      answer: null,
      feedback: null,
      showFeedback: false,
      isSessionComplete: false,
    });
    get().startNewRound();
  },

  playTarget: async () => {
    const { round, isPlaying } = get();
    if (!round || isPlaying) return;

    set({ isPlaying: true });

    try {
      await playNote(round.targetPitch, '2n');
    } finally {
      setTimeout(() => set({ isPlaying: false }), 1200);
    }
  },

  pauseSession: () => {
    const { round, answer, session, showFeedback, isSessionComplete } = get();

    // Don't save if showing feedback, session is complete, or no round
    if (!round || showFeedback || isSessionComplete) return;

    useSessionPersistenceStore.getState().saveNoteIdentificationSession(round, answer, session);
  },

  restoreSession: () => {
    const savedSession = useSessionPersistenceStore.getState().getNoteIdentificationSession();
    if (!savedSession) return false;

    set({
      round: savedSession.round,
      answer: savedSession.answer,
      session: savedSession.session,
      feedback: null,
      showFeedback: false,
      isSessionComplete: false,
    });

    useSessionPersistenceStore.getState().clearNoteIdentificationSession();
    return true;
  },

  hasPausedSession: () => {
    return useSessionPersistenceStore.getState().hasNoteIdentificationSession();
  },
}));
