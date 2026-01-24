/**
 * Settings Store
 * User preferences persisted to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DifficultyLevel } from '@/lib/game-engine/types';
import type { TonicTargetSettings } from '@/games/tonic-target/types';
import { defaultTonicTargetSettings, difficultyPresets } from '@/games/tonic-target/types';

interface SettingsState {
  // Global settings
  masterVolume: number;
  
  // Tonic Target settings
  tonicTarget: TonicTargetSettings;
  
  // Actions
  setMasterVolume: (volume: number) => void;
  setTonicTargetSetting: <K extends keyof TonicTargetSettings>(
    key: K,
    value: TonicTargetSettings[K]
  ) => void;
  setDifficulty: (level: DifficultyLevel) => void;
  resetTonicTargetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      masterVolume: 0.8,
      tonicTarget: defaultTonicTargetSettings,
      
      // Actions
      setMasterVolume: (volume) => set({ masterVolume: volume }),
      
      setTonicTargetSetting: (key, value) => set((state) => ({
        tonicTarget: {
          ...state.tonicTarget,
          [key]: value,
        },
      })),
      
      setDifficulty: (level) => {
        const preset = difficultyPresets[level];
        set((state) => ({
          tonicTarget: {
            ...state.tonicTarget,
            ...preset,
            difficulty: level,
          },
        }));
      },
      
      resetTonicTargetSettings: () => set({
        tonicTarget: defaultTonicTargetSettings,
      }),
    }),
    {
      name: 'harmony-lab-settings',
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<SettingsState> | undefined;
        const merged = {
          ...current,
          ...persistedState,
        } as SettingsState;
        const tonicTarget = {
          ...current.tonicTarget,
          ...(persistedState?.tonicTarget ?? {}),
        };
        if (tonicTarget.roundsPerSession === ('infinite' as never) || !Number.isFinite(tonicTarget.roundsPerSession)) {
          tonicTarget.roundsPerSession = current.tonicTarget.roundsPerSession;
        }
        if (!tonicTarget.sessionMode) {
          tonicTarget.sessionMode = current.tonicTarget.sessionMode;
        }
        if (!tonicTarget.timeLimitSeconds) {
          tonicTarget.timeLimitSeconds = current.tonicTarget.timeLimitSeconds;
        }
        if (tonicTarget.showRomanNumerals === undefined) {
          tonicTarget.showRomanNumerals = current.tonicTarget.showRomanNumerals;
        }
        merged.tonicTarget = tonicTarget;
        return merged;
      },
      partialize: (state) => ({
        masterVolume: state.masterVolume,
        tonicTarget: state.tonicTarget,
      }),
    }
  )
);
