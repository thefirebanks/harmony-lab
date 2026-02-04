/**
 * Session Persistence Store
 * Handles saving and restoring in-progress game sessions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionStats } from '@/lib/game-engine/types';
import type { TonicTargetRound, TonicTargetAnswer } from '@/games/tonic-target/types';
import type { NoteIdentificationRound, NoteIdentificationAnswer } from '@/games/note-identification/types';

/**
 * Serializable session stats (Date converted to ISO string)
 */
interface SerializableSessionStats {
  startTime: string; // ISO string
  currentRound: number;
  roundsCompleted: number;
  roundsCorrect: number;
  currentStreak: number;
}

/**
 * Paused Tonic Target session
 */
export interface PausedTonicTargetSession {
  round: TonicTargetRound;
  answer: TonicTargetAnswer;
  session: SerializableSessionStats;
  pausedAt: string; // ISO string
}

/**
 * Paused Note Identification session
 */
export interface PausedNoteIdentificationSession {
  round: NoteIdentificationRound;
  answer: NoteIdentificationAnswer;
  session: SerializableSessionStats;
  pausedAt: string; // ISO string
}

interface SessionPersistenceState {
  pausedTonicTarget: PausedTonicTargetSession | null;
  pausedNoteIdentification: PausedNoteIdentificationSession | null;

  // Actions
  saveTonicTargetSession: (
    round: TonicTargetRound,
    answer: TonicTargetAnswer,
    session: SessionStats
  ) => void;
  saveNoteIdentificationSession: (
    round: NoteIdentificationRound,
    answer: NoteIdentificationAnswer,
    session: SessionStats
  ) => void;
  clearTonicTargetSession: () => void;
  clearNoteIdentificationSession: () => void;

  // Helpers
  hasTonicTargetSession: () => boolean;
  hasNoteIdentificationSession: () => boolean;
  getTonicTargetSession: () => {
    round: TonicTargetRound;
    answer: TonicTargetAnswer;
    session: SessionStats;
  } | null;
  getNoteIdentificationSession: () => {
    round: NoteIdentificationRound;
    answer: NoteIdentificationAnswer;
    session: SessionStats;
  } | null;
}

function serializeSession(session: SessionStats): SerializableSessionStats {
  return {
    startTime: session.startTime.toISOString(),
    currentRound: session.currentRound,
    roundsCompleted: session.roundsCompleted,
    roundsCorrect: session.roundsCorrect,
    currentStreak: session.currentStreak,
  };
}

function deserializeSession(serialized: SerializableSessionStats): SessionStats {
  return {
    startTime: new Date(serialized.startTime),
    currentRound: serialized.currentRound,
    roundsCompleted: serialized.roundsCompleted,
    roundsCorrect: serialized.roundsCorrect,
    currentStreak: serialized.currentStreak,
  };
}

// Sessions older than 24 hours are considered stale
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

function isSessionExpired(pausedAt: string): boolean {
  const pausedTime = new Date(pausedAt).getTime();
  return Date.now() - pausedTime > SESSION_EXPIRY_MS;
}

export const useSessionPersistenceStore = create<SessionPersistenceState>()(
  persist(
    (set, get) => ({
      pausedTonicTarget: null,
      pausedNoteIdentification: null,

      saveTonicTargetSession: (round, answer, session) => {
        // Only save if there's meaningful progress
        if (session.roundsCompleted === 0 && !answer.ii && !answer.V && !answer.I) {
          return;
        }

        set({
          pausedTonicTarget: {
            round,
            answer,
            session: serializeSession(session),
            pausedAt: new Date().toISOString(),
          },
        });
      },

      saveNoteIdentificationSession: (round, answer, session) => {
        // Only save if there's meaningful progress
        if (session.roundsCompleted === 0) {
          return;
        }

        set({
          pausedNoteIdentification: {
            round,
            answer,
            session: serializeSession(session),
            pausedAt: new Date().toISOString(),
          },
        });
      },

      clearTonicTargetSession: () => {
        set({ pausedTonicTarget: null });
      },

      clearNoteIdentificationSession: () => {
        set({ pausedNoteIdentification: null });
      },

      hasTonicTargetSession: () => {
        const paused = get().pausedTonicTarget;
        if (!paused) return false;
        if (isSessionExpired(paused.pausedAt)) {
          set({ pausedTonicTarget: null });
          return false;
        }
        return true;
      },

      hasNoteIdentificationSession: () => {
        const paused = get().pausedNoteIdentification;
        if (!paused) return false;
        if (isSessionExpired(paused.pausedAt)) {
          set({ pausedNoteIdentification: null });
          return false;
        }
        return true;
      },

      getTonicTargetSession: () => {
        const paused = get().pausedTonicTarget;
        if (!paused || isSessionExpired(paused.pausedAt)) {
          return null;
        }
        return {
          round: paused.round,
          answer: paused.answer,
          session: deserializeSession(paused.session),
        };
      },

      getNoteIdentificationSession: () => {
        const paused = get().pausedNoteIdentification;
        if (!paused || isSessionExpired(paused.pausedAt)) {
          return null;
        }
        return {
          round: paused.round,
          answer: paused.answer,
          session: deserializeSession(paused.session),
        };
      },
    }),
    {
      name: 'harmony-lab-paused-sessions',
    }
  )
);
