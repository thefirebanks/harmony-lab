/**
 * Music Theory Constants
 * Static data for music theory calculations
 */

import type { NoteName, DiatonicChord, ScaleDegree, ChordQuality, RomanNumeral } from './types';

// All 12 chromatic notes in order
export const CHROMATIC_NOTES: NoteName[] = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

// Semitone intervals from the root for a major scale (W-W-H-W-W-W-H)
export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11] as const;

// Semitone intervals from the root for a natural minor scale (W-H-W-W-H-W-W)
export const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10] as const;

// The 7 diatonic chords in a major key with their qualities and roman numerals
export const DIATONIC_CHORDS: DiatonicChord[] = [
  { degree: 1, quality: 'maj7', roman: 'I' },
  { degree: 2, quality: 'min7', roman: 'ii' },
  { degree: 3, quality: 'min7', roman: 'iii' },
  { degree: 4, quality: 'maj7', roman: 'IV' },
  { degree: 5, quality: '7', roman: 'V' },
  { degree: 6, quality: 'min7', roman: 'vi' },
  { degree: 7, quality: 'min7b5', roman: 'vii°' },
];

// Map from scale degree to its chord quality in major
export const MAJOR_KEY_CHORD_QUALITIES: Record<ScaleDegree, ChordQuality> = {
  1: 'maj7',
  2: 'min7',
  3: 'min7',
  4: 'maj7',
  5: '7',
  6: 'min7',
  7: 'min7b5',
};

// Map from scale degree to roman numeral
export const DEGREE_TO_ROMAN: Record<ScaleDegree, RomanNumeral> = {
  1: 'I',
  2: 'ii',
  3: 'iii',
  4: 'IV',
  5: 'V',
  6: 'vi',
  7: 'vii°',
};

// Chord intervals from root (in semitones)
export const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  'maj7': [0, 4, 7, 11],      // 1, 3, 5, 7
  'min7': [0, 3, 7, 10],      // 1, b3, 5, b7
  '7': [0, 4, 7, 10],         // 1, 3, 5, b7 (dominant 7th)
  'min7b5': [0, 3, 6, 10],    // 1, b3, b5, b7 (half-diminished)
  'dim7': [0, 3, 6, 9],       // 1, b3, b5, bb7 (fully diminished)
  'maj': [0, 4, 7],           // 1, 3, 5
  'min': [0, 3, 7],           // 1, b3, 5
};

// Display names for chord qualities
export const CHORD_QUALITY_DISPLAY: Record<ChordQuality, string> = {
  'maj7': 'maj7',
  'min7': 'm7',
  '7': '7',
  'min7b5': 'm7b5',
  'dim7': 'dim7',
  'maj': '',
  'min': 'm',
};

// CSS color variables for scale degrees
export const DEGREE_COLORS: Record<ScaleDegree, string> = {
  1: 'var(--degree-1)', // Warm white/yellow - home
  2: 'var(--degree-2)', // Soft purple - preparation
  3: 'var(--degree-3)', // Pale green - bittersweet
  4: 'var(--degree-4)', // Orange - hopeful
  5: 'var(--degree-5)', // Red - tension
  6: 'var(--degree-6)', // Blue - melancholy
  7: 'var(--degree-7)', // Grey - unstable
};
