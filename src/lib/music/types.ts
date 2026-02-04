/**
 * Music Theory Type Definitions
 * Core types for representing musical concepts
 */

// Chromatic note names (using sharps for simplicity)
export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

// A specific pitch (note + octave)
export interface Pitch {
  note: NoteName;
  octave: number; // e.g., 4 for middle C
}

// Chord quality
export type ChordQuality = 'maj7' | 'min7' | '7' | 'min7b5' | 'dim7' | 'maj' | 'min' | 'dim';

// Chord extension level - determines whether to use triads or 7th chords
export type ChordExtensionLevel = 'triads' | '7ths';

// Scale degrees (1-indexed to match music theory convention)
export type ScaleDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Roman numeral representation
export type RomanNumeral = 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'vii°';

// A chord defined by root + quality
export interface Chord {
  root: NoteName;
  quality: ChordQuality;
  degree: ScaleDegree; // What function does this serve in the current key?
}

// A key (tonic + mode, though MVP is major only)
export interface Key {
  tonic: NoteName;
  mode: 'major'; // Expand later: 'minor' | 'dorian' | etc.
}

// The three chords in a ii-V-I
export interface Progression {
  ii: Chord;
  V: Chord;
  I: Chord;
}

// A voicing is the specific pitches to play
export interface Voicing {
  chord: Chord;
  pitches: Pitch[]; // Ordered from bass to soprano
}

// User's answer
export interface Answer {
  ii: Chord | null;
  V: Chord | null;
  I: Chord | null;
}

// Round state
export interface Round {
  key: Key;
  correctProgression: Progression;
  userAnswer: Answer;
  isComplete: boolean;
  isCorrect: boolean | null;
}

// Session stats
export interface SessionStats {
  startTime: Date;
  roundsCompleted: number;
  roundsCorrect: number;
  currentStreak: number;
}

// Diatonic chord info for the chord grid
export interface DiatonicChord {
  degree: ScaleDegree;
  quality: ChordQuality;
  roman: RomanNumeral;
}
