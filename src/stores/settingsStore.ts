/**
 * Settings Store
 * User preferences persisted to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DifficultyLevel } from '@/lib/game-engine/types';
import type { TonicTargetSettings } from '@/games/tonic-target/types';
import { defaultTonicTargetSettings, difficultyPresets as tonicDifficultyPresets } from '@/games/tonic-target/types';
import type { NoteIdentificationSettings } from '@/games/note-identification/types';
import { defaultNoteIdentificationSettings, difficultyPresets as noteDifficultyPresets } from '@/games/note-identification/types';

interface SettingsState {
  // Global settings
  masterVolume: number;
  
  // Tonic Target settings
  tonicTarget: TonicTargetSettings;
  noteIdentification: NoteIdentificationSettings;
  
  // Actions
  setMasterVolume: (volume: number) => void;
  setTonicTargetSetting: <K extends keyof TonicTargetSettings>(
    key: K,
    value: TonicTargetSettings[K]
  ) => void;
  setDifficulty: (level: DifficultyLevel) => void;
  resetTonicTargetSettings: () => void;
  setNoteIdentificationSetting: <K extends keyof NoteIdentificationSettings>(
    key: K,
    value: NoteIdentificationSettings[K]
  ) => void;
  setNoteIdentificationDifficulty: (level: DifficultyLevel) => void;
  resetNoteIdentificationSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      masterVolume: 0.8,
      tonicTarget: defaultTonicTargetSettings,
      noteIdentification: defaultNoteIdentificationSettings,
      
      // Actions
      setMasterVolume: (volume) => set({ masterVolume: volume }),
      
      setTonicTargetSetting: (key, value) => set((state) => ({
        tonicTarget: {
          ...state.tonicTarget,
          [key]: value,
        },
      })),
      
      setDifficulty: (level) => {
        const preset = tonicDifficultyPresets[level];
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

      setNoteIdentificationSetting: (key, value) => set((state) => ({
        noteIdentification: {
          ...state.noteIdentification,
          [key]: value,
        },
      })),

      setNoteIdentificationDifficulty: (level) => {
        const preset = noteDifficultyPresets[level];
        set((state) => ({
          noteIdentification: {
            ...state.noteIdentification,
            ...preset,
            difficulty: level,
          },
        }));
      },

      resetNoteIdentificationSettings: () => set({
        noteIdentification: defaultNoteIdentificationSettings,
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
        const noteIdentification = {
          ...current.noteIdentification,
          ...(persistedState?.noteIdentification ?? {}),
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
        if (!noteIdentification.sessionMode) {
          noteIdentification.sessionMode = current.noteIdentification.sessionMode;
        }
        if (!noteIdentification.timeLimitSeconds) {
          noteIdentification.timeLimitSeconds = current.noteIdentification.timeLimitSeconds;
        }
        if (!Number.isFinite(noteIdentification.roundsPerSession)) {
          noteIdentification.roundsPerSession = current.noteIdentification.roundsPerSession;
        }
        merged.tonicTarget = tonicTarget;
        merged.noteIdentification = noteIdentification;
        return merged;
      },
      partialize: (state) => ({
        masterVolume: state.masterVolume,
        tonicTarget: state.tonicTarget,
        noteIdentification: state.noteIdentification,
      }),
    }
  )
);
