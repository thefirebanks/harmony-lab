/**
 * Interval Games Types
 * Types specific to the Interval Games (Interval Flash, etc.)
 */

import type { Pitch, NoteName } from '@/lib/music/types';
import type { DifficultyLevel } from '@/lib/game-engine/types';

/**
 * Interval names using standard abbreviations
 * Covers all intervals within an octave
 */
export type IntervalName =
  | 'unison'
  | 'm2'
  | 'M2'
  | 'm3'
  | 'M3'
  | 'P4'
  | 'TT'
  | 'P5'
  | 'm6'
  | 'M6'
  | 'm7'
  | 'M7'
  | 'octave';

/**
 * Direction of the interval (ascending or descending)
 */
export type IntervalDirection = 'ascending' | 'descending';

/**
 * Mapping from interval name to semitones
 */
export const INTERVAL_SEMITONES: Record<IntervalName, number> = {
  unison: 0,
  m2: 1,
  M2: 2,
  m3: 3,
  M3: 4,
  P4: 5,
  TT: 6,
  P5: 7,
  m6: 8,
  M6: 9,
  m7: 10,
  M7: 11,
  octave: 12,
};

/**
 * Display names for intervals
 */
export const INTERVAL_DISPLAY_NAMES: Record<IntervalName, string> = {
  unison: 'Unison',
  m2: 'Minor 2nd',
  M2: 'Major 2nd',
  m3: 'Minor 3rd',
  M3: 'Major 3rd',
  P4: 'Perfect 4th',
  TT: 'Tritone',
  P5: 'Perfect 5th',
  m6: 'Minor 6th',
  M6: 'Major 6th',
  m7: 'Minor 7th',
  M7: 'Major 7th',
  octave: 'Octave',
};

/**
 * Semitones to interval name mapping
 */
export const SEMITONES_TO_INTERVAL: Record<number, IntervalName> = {
  0: 'unison',
  1: 'm2',
  2: 'M2',
  3: 'm3',
  4: 'M3',
  5: 'P4',
  6: 'TT',
  7: 'P5',
  8: 'm6',
  9: 'M6',
  10: 'm7',
  11: 'M7',
  12: 'octave',
};

/**
 * Interval groups for difficulty progression
 */
export const INTERVAL_GROUPS = {
  // Level 1: Perfect intervals (easiest to hear)
  foundations: ['unison', 'P5', 'P4', 'octave'] as IntervalName[],
  // Level 2: Add thirds
  thirds: ['m3', 'M3'] as IntervalName[],
  // Level 3: Add seconds
  seconds: ['m2', 'M2'] as IntervalName[],
  // Level 4: Add tritone and sixths
  extended: ['TT', 'm6', 'M6'] as IntervalName[],
  // Level 5: Add sevenths
  sevenths: ['m7', 'M7'] as IntervalName[],
  // All intervals
  all: [
    'unison',
    'm2',
    'M2',
    'm3',
    'M3',
    'P4',
    'TT',
    'P5',
    'm6',
    'M6',
    'm7',
    'M7',
    'octave',
  ] as IntervalName[],
};

/**
 * Guitar fretboard position
 */
export interface FretboardPosition {
  string: 1 | 2 | 3 | 4 | 5 | 6;
  fret: number; // 0-24
}

/**
 * Round state for Interval Flash game
 */
export interface IntervalFlashRound {
  rootNote: Pitch;
  targetNote: Pitch;
  interval: IntervalName;
  direction: IntervalDirection;
  semitones: number;
  timeLimit: number; // milliseconds
  options: IntervalName[]; // Available answer choices
}

/**
 * User's answer for Interval Flash
 */
export type IntervalFlashAnswer = IntervalName | null;

/**
 * Game settings for Interval Flash
 */
export interface IntervalFlashSettings {
  // Difficulty
  difficulty: DifficultyLevel;

  // Interval selection
  enabledIntervals: IntervalName[];
  includeDescending: boolean;

  // Timing
  timeLimit: number; // seconds (will be converted to ms)

  // Audio
  soundSource: 'piano' | 'guitar';
  playbackStyle: 'melodic' | 'harmonic' | 'melodic-then-harmonic' | 'harmonic-then-melodic';

  // Display
  showFretboardOnFeedback: boolean;
  showIntervalSemitones: boolean;

  // Session
  sessionMode: 'rounds' | 'time';
  roundsPerSession: number;
  timeLimitSeconds: number; // Total session time

  // Answer options
  optionsCount: 4 | 5 | 6;
}

/**
 * Default settings for Interval Flash
 */
export const defaultIntervalFlashSettings: IntervalFlashSettings = {
  difficulty: 1,
  enabledIntervals: [...INTERVAL_GROUPS.foundations],
  includeDescending: false,
  timeLimit: 5, // seconds
  soundSource: 'piano',
  playbackStyle: 'melodic',
  showFretboardOnFeedback: true,
  showIntervalSemitones: true,
  sessionMode: 'rounds',
  roundsPerSession: 20,
  timeLimitSeconds: 600,
  optionsCount: 4,
};

/**
 * Difficulty presets for Interval Flash
 * Level 1: Foundations - Perfect intervals, ascending, 5s
 * Level 2: Thirds - Add M3, m3, 4s
 * Level 3: Seconds - Add M2, m2, 4s
 * Level 4: Extended - Add TT, sixths, both directions, 3.5s
 * Level 5: Sevenths - Add M7, m7, both directions, 3s
 */
export const intervalFlashDifficultyPresets: Record<
  DifficultyLevel,
  Partial<IntervalFlashSettings>
> = {
  1: {
    enabledIntervals: [...INTERVAL_GROUPS.foundations],
    includeDescending: false,
    timeLimit: 5,
    optionsCount: 4,
  },
  2: {
    enabledIntervals: [...INTERVAL_GROUPS.foundations, ...INTERVAL_GROUPS.thirds],
    includeDescending: false,
    timeLimit: 4,
    optionsCount: 5,
  },
  3: {
    enabledIntervals: [
      ...INTERVAL_GROUPS.foundations,
      ...INTERVAL_GROUPS.thirds,
      ...INTERVAL_GROUPS.seconds,
    ],
    includeDescending: false,
    timeLimit: 4,
    optionsCount: 5,
  },
  4: {
    enabledIntervals: [
      ...INTERVAL_GROUPS.foundations,
      ...INTERVAL_GROUPS.thirds,
      ...INTERVAL_GROUPS.seconds,
      ...INTERVAL_GROUPS.extended,
    ],
    includeDescending: true,
    timeLimit: 3.5,
    optionsCount: 6,
  },
  5: {
    enabledIntervals: [...INTERVAL_GROUPS.all],
    includeDescending: true,
    timeLimit: 3,
    optionsCount: 6,
  },
};

/**
 * Guitar string tuning (standard tuning)
 * String 6 (low E) to String 1 (high E)
 */
export const GUITAR_TUNING: Record<1 | 2 | 3 | 4 | 5 | 6, { note: NoteName; octave: number }> = {
  6: { note: 'E', octave: 2 },
  5: { note: 'A', octave: 2 },
  4: { note: 'D', octave: 3 },
  3: { note: 'G', octave: 3 },
  2: { note: 'B', octave: 3 },
  1: { note: 'E', octave: 4 },
};

/**
 * Guitar range limits
 */
export const GUITAR_RANGE = {
  lowest: { note: 'E' as NoteName, octave: 2 }, // Open low E string
  highest: { note: 'E' as NoteName, octave: 5 }, // 24th fret high E string
  frets: 24,
};
