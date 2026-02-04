/**
 * Music Theory Constants
 * Static data for music theory calculations
 */

import type { NoteName, DiatonicChord, ScaleDegree, ChordQuality, RomanNumeral, ChordExtensionLevel } from './types';

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

// Map from scale degree to triad quality in major (no 7ths)
export const MAJOR_KEY_TRIAD_QUALITIES: Record<ScaleDegree, ChordQuality> = {
  1: 'maj',
  2: 'min',
  3: 'min',
  4: 'maj',
  5: 'maj',  // V as major triad (not dominant 7)
  6: 'min',
  7: 'dim',  // vii° is diminished triad
};

// Map from scale degree to its chord quality in natural minor (7th chords)
// Natural minor: i - ii° - III - iv - v - VI - VII
export const MINOR_KEY_CHORD_QUALITIES: Record<ScaleDegree, ChordQuality> = {
  1: 'min7',      // i7
  2: 'min7b5',    // ii°7 (half-diminished)
  3: 'maj7',      // IIImaj7
  4: 'min7',      // iv7
  5: 'min7',      // v7 (natural minor has minor v, not dominant V)
  6: 'maj7',      // VImaj7
  7: '7',         // VII7 (dominant)
};

// Map from scale degree to triad quality in natural minor (no 7ths)
export const MINOR_KEY_TRIAD_QUALITIES: Record<ScaleDegree, ChordQuality> = {
  1: 'min',
  2: 'dim',
  3: 'maj',
  4: 'min',
  5: 'min',  // Natural minor has minor v
  6: 'maj',
  7: 'maj',
};

// Get chord qualities based on extension level and mode
export function getChordQualitiesForLevel(
  level: ChordExtensionLevel,
  mode: 'major' | 'minor' = 'major'
): Record<ScaleDegree, ChordQuality> {
  if (mode === 'minor') {
    return level === 'triads' ? MINOR_KEY_TRIAD_QUALITIES : MINOR_KEY_CHORD_QUALITIES;
  }
  return level === 'triads' ? MAJOR_KEY_TRIAD_QUALITIES : MAJOR_KEY_CHORD_QUALITIES;
}

// Roman numerals for minor keys
export const MINOR_DEGREE_TO_ROMAN: Record<ScaleDegree, string> = {
  1: 'i',
  2: 'ii°',
  3: 'III',
  4: 'iv',
  5: 'v',
  6: 'VI',
  7: 'VII',
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
  'dim': [0, 3, 6],           // 1, b3, b5 (diminished triad)
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
  'dim': 'dim',
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
