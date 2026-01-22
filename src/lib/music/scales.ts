/**
 * Scale Generation Utilities
 * Functions for building scales from any tonic
 */

import type { NoteName } from './types';
import { CHROMATIC_NOTES, MAJOR_SCALE_INTERVALS, MINOR_SCALE_INTERVALS } from './constants';

/**
 * Get the index of a note in the chromatic scale
 */
export function getNoteIndex(note: NoteName): number {
  const index = CHROMATIC_NOTES.indexOf(note);
  if (index === -1) {
    throw new Error(`Invalid note name: ${note}`);
  }
  return index;
}

/**
 * Get a note by its chromatic index (wraps around)
 */
export function getNoteAtIndex(index: number): NoteName {
  // Handle negative indices and wrap around
  const normalizedIndex = ((index % 12) + 12) % 12;
  return CHROMATIC_NOTES[normalizedIndex];
}

/**
 * Generate a major scale from a given tonic
 * @param tonic - The root note of the scale
 * @returns Array of 7 note names forming the major scale
 */
export function getMajorScale(tonic: NoteName): NoteName[] {
  const tonicIndex = getNoteIndex(tonic);
  return MAJOR_SCALE_INTERVALS.map(interval => 
    getNoteAtIndex(tonicIndex + interval)
  );
}

/**
 * Generate a natural minor scale from a given tonic
 * @param tonic - The root note of the scale
 * @returns Array of 7 note names forming the natural minor scale
 */
export function getMinorScale(tonic: NoteName): NoteName[] {
  const tonicIndex = getNoteIndex(tonic);
  return MINOR_SCALE_INTERVALS.map(interval => 
    getNoteAtIndex(tonicIndex + interval)
  );
}

/**
 * Get a specific scale degree from a major scale
 * @param tonic - The tonic of the key
 * @param degree - Scale degree (1-7)
 * @returns The note at that scale degree
 */
export function getScaleDegree(tonic: NoteName, degree: 1 | 2 | 3 | 4 | 5 | 6 | 7): NoteName {
  const scale = getMajorScale(tonic);
  return scale[degree - 1]; // Convert from 1-indexed to 0-indexed
}

/**
 * Calculate the interval in semitones between two notes
 * @param from - Starting note
 * @param to - Ending note
 * @returns Number of semitones (0-11)
 */
export function getInterval(from: NoteName, to: NoteName): number {
  const fromIndex = getNoteIndex(from);
  const toIndex = getNoteIndex(to);
  return ((toIndex - fromIndex) + 12) % 12;
}

/**
 * Transpose a note by a number of semitones
 * @param note - The note to transpose
 * @param semitones - Number of semitones (positive = up, negative = down)
 * @returns The transposed note
 */
export function transposeNote(note: NoteName, semitones: number): NoteName {
  const noteIndex = getNoteIndex(note);
  return getNoteAtIndex(noteIndex + semitones);
}
