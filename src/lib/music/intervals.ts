/**
 * Interval Utilities
 * Functions for working with musical intervals
 */

import type { NoteName, Pitch } from './types';
import { getNoteIndex, getNoteAtIndex } from './scales';

// Common interval names by semitone count
export const INTERVAL_NAMES: Record<number, string> = {
  0: 'unison',
  1: 'minor 2nd',
  2: 'major 2nd',
  3: 'minor 3rd',
  4: 'major 3rd',
  5: 'perfect 4th',
  6: 'tritone',
  7: 'perfect 5th',
  8: 'minor 6th',
  9: 'major 6th',
  10: 'minor 7th',
  11: 'major 7th',
  12: 'octave',
};

/**
 * Calculate the interval in semitones between two notes (ascending)
 * @param from - Starting note
 * @param to - Ending note
 * @returns Number of semitones (0-11)
 */
export function getIntervalInSemitones(from: NoteName, to: NoteName): number {
  const fromIndex = getNoteIndex(from);
  const toIndex = getNoteIndex(to);
  return ((toIndex - fromIndex) + 12) % 12;
}

/**
 * Get the interval name from semitone count
 */
export function getIntervalName(semitones: number): string {
  const normalizedSemitones = ((semitones % 12) + 12) % 12;
  return INTERVAL_NAMES[normalizedSemitones] || 'unknown';
}

/**
 * Apply an interval to a note
 * @param note - Starting note
 * @param semitones - Interval in semitones
 * @returns Resulting note
 */
export function applyInterval(note: NoteName, semitones: number): NoteName {
  const noteIndex = getNoteIndex(note);
  return getNoteAtIndex(noteIndex + semitones);
}

/**
 * Calculate the distance in semitones between two pitches (including octave)
 * @param from - Starting pitch
 * @param to - Ending pitch
 * @returns Number of semitones (can be negative)
 */
export function getPitchDistance(from: Pitch, to: Pitch): number {
  const fromMidi = getNoteIndex(from.note) + (from.octave + 1) * 12;
  const toMidi = getNoteIndex(to.note) + (to.octave + 1) * 12;
  return toMidi - fromMidi;
}
