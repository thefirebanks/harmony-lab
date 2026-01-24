/**
 * Progress Store
 * Tracks session history and per-key accuracy with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NoteName } from '@/lib/music/types';

/**
 * A completed session record
 */
export interface SessionRecord {
  id: string;
  date: string; // ISO string
  roundsCompleted: number;
  roundsCorrect: number;
  accuracy: number; // 0-100
  durationMinutes: number;
  keysPlayed: NoteName[];
}

/**
 * Per-key statistics
 */
export interface KeyStats {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number; // 0-100
  lastPlayed: string | null; // ISO string
}

/**
 * Progress tracking state
 */
interface ProgressState {
  // Session history (most recent first)
  sessions: SessionRecord[];

  // Per-key accuracy
  keyStats: Record<NoteName, KeyStats>;

  // Current session tracking (for live updates)
  currentSessionKeys: NoteName[];

  // Actions
  recordRoundResult: (key: NoteName, isCorrect: boolean) => void;
  saveSession: (roundsCompleted: number, roundsCorrect: number, startTime: Date) => void;
  clearCurrentSession: () => void;
  clearAllProgress: () => void;

  // Computed getters
  getTotalRounds: () => number;
  getOverallAccuracy: () => number;
  getWeakestKeys: (count?: number) => NoteName[];
  getStrongestKeys: (count?: number) => NoteName[];
  getRecentSessions: (count?: number) => SessionRecord[];
}

const ALL_KEYS: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function createEmptyKeyStats(): KeyStats {
  return {
    totalAttempts: 0,
    correctAttempts: 0,
    accuracy: 0,
    lastPlayed: null,
  };
}

function createInitialKeyStats(): Record<NoteName, KeyStats> {
  const stats = {} as Record<NoteName, KeyStats>;
  for (const key of ALL_KEYS) {
    stats[key] = createEmptyKeyStats();
  }
  return stats;
}

function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      sessions: [],
      keyStats: createInitialKeyStats(),
      currentSessionKeys: [],

      recordRoundResult: (key: NoteName, isCorrect: boolean) => {
        set((state) => {
          const currentStats = state.keyStats[key] || createEmptyKeyStats();
          const newTotalAttempts = currentStats.totalAttempts + 1;
          const newCorrectAttempts = currentStats.correctAttempts + (isCorrect ? 1 : 0);
          const newAccuracy = Math.round((newCorrectAttempts / newTotalAttempts) * 100);

          return {
            keyStats: {
              ...state.keyStats,
              [key]: {
                totalAttempts: newTotalAttempts,
                correctAttempts: newCorrectAttempts,
                accuracy: newAccuracy,
                lastPlayed: new Date().toISOString(),
              },
            },
            currentSessionKeys: state.currentSessionKeys.includes(key)
              ? state.currentSessionKeys
              : [...state.currentSessionKeys, key],
          };
        });
      },

      saveSession: (roundsCompleted: number, roundsCorrect: number, startTime: Date) => {
        if (roundsCompleted === 0) return;

        const endTime = new Date();
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationMinutes = Math.round(durationMs / 60000);

        const session: SessionRecord = {
          id: generateSessionId(),
          date: endTime.toISOString(),
          roundsCompleted,
          roundsCorrect,
          accuracy: Math.round((roundsCorrect / roundsCompleted) * 100),
          durationMinutes: Math.max(1, durationMinutes), // At least 1 minute
          keysPlayed: get().currentSessionKeys,
        };

        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 100), // Keep last 100 sessions
          currentSessionKeys: [],
        }));
      },

      clearCurrentSession: () => {
        set({ currentSessionKeys: [] });
      },

      clearAllProgress: () => {
        set({
          sessions: [],
          keyStats: createInitialKeyStats(),
          currentSessionKeys: [],
        });
      },

      getTotalRounds: () => {
        const { keyStats } = get();
        return ALL_KEYS.reduce((sum, key) => sum + keyStats[key].totalAttempts, 0);
      },

      getOverallAccuracy: () => {
        const { keyStats } = get();
        const totalRounds = ALL_KEYS.reduce((sum, key) => sum + keyStats[key].totalAttempts, 0);
        const totalCorrect = ALL_KEYS.reduce((sum, key) => sum + keyStats[key].correctAttempts, 0);
        return totalRounds > 0 ? Math.round((totalCorrect / totalRounds) * 100) : 0;
      },

      getWeakestKeys: (count = 3) => {
        const { keyStats } = get();
        return ALL_KEYS
          .filter((key) => keyStats[key].totalAttempts >= 3) // Need at least 3 attempts
          .sort((a, b) => keyStats[a].accuracy - keyStats[b].accuracy)
          .slice(0, count);
      },

      getStrongestKeys: (count = 3) => {
        const { keyStats } = get();
        return ALL_KEYS
          .filter((key) => keyStats[key].totalAttempts >= 3)
          .sort((a, b) => keyStats[b].accuracy - keyStats[a].accuracy)
          .slice(0, count);
      },

      getRecentSessions: (count = 10) => {
        return get().sessions.slice(0, count);
      },
    }),
    {
      name: 'harmony-lab-progress',
      partialize: (state) => ({
        sessions: state.sessions,
        keyStats: state.keyStats,
      }),
    }
  )
);
