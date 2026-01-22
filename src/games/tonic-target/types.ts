/**
 * Tonic Target Game Types
 * Types specific to the Tonic Target Practice game
 */

import type { Key, Progression, Answer, Chord } from '@/lib/music/types';
import type { DifficultyLevel } from '@/lib/game-engine/types';

/**
 * Round state for Tonic Target
 */
export interface TonicTargetRound {
  key: Key;
  correctProgression: Progression;
  availableChords: Chord[];
}

/**
 * User's answer (same as the base Answer type)
 */
export type TonicTargetAnswer = Answer;

/**
 * Game settings
 */
export interface TonicTargetSettings {
  difficulty: DifficultyLevel;
  showChordNames: boolean;      // false = degrees only (ii7 vs Dm7)
  showColors: boolean;          // Scale degree colors
  includeBassNote: boolean;     // Fuller voicings
  playbackTempo: number;        // BPM for progression playback
  autoPlayTonic: boolean;       // Play I chord automatically each round
}

/**
 * Default settings
 */
export const defaultTonicTargetSettings: TonicTargetSettings = {
  difficulty: 1,
  showChordNames: true,
  showColors: true,
  includeBassNote: true,
  playbackTempo: 100,
  autoPlayTonic: true,
};

/**
 * Difficulty presets
 * Level 1: Full training wheels
 * Level 2: Start associating
 * Level 3: Names hidden
 * Level 4: Pure function
 * Level 5: Derive key from ear
 */
export const difficultyPresets: Record<DifficultyLevel, Partial<TonicTargetSettings>> = {
  1: { showChordNames: true, showColors: true, autoPlayTonic: true },
  2: { showChordNames: true, showColors: true, autoPlayTonic: true },
  3: { showChordNames: false, showColors: true, autoPlayTonic: true },
  4: { showChordNames: false, showColors: false, autoPlayTonic: true },
  5: { showChordNames: false, showColors: false, autoPlayTonic: false },
};
