/**
 * Progression Utilities
 * Functions for building and working with chord progressions
 */

import type { Key, Progression, Chord, Answer, NoteName } from './types';
import { getDiatonicChord } from './chords';
import { getMajorScale } from './scales';

/**
 * Build a ii-V-I progression in a given key
 * @param key - The key for the progression
 * @returns Progression object with ii, V, and I chords
 */
export function buildTwoFiveOne(key: Key): Progression {
  return {
    ii: getDiatonicChord(key.tonic, 2),
    V: getDiatonicChord(key.tonic, 5),
    I: getDiatonicChord(key.tonic, 1),
  };
}

/**
 * Validate a user's answer against the correct progression
 * @param correctProgression - The correct ii-V-I progression
 * @param answer - The user's answer
 * @returns boolean indicating if the answer is correct
 */
export function validateProgression(correctProgression: Progression, answer: Answer): boolean {
  // All three chords must be selected
  if (!answer.ii || !answer.V || !answer.I) {
    return false;
  }

  // Check each chord matches (root and quality)
  const iiCorrect = 
    answer.ii.root === correctProgression.ii.root &&
    answer.ii.quality === correctProgression.ii.quality;
    
  const VCorrect = 
    answer.V.root === correctProgression.V.root &&
    answer.V.quality === correctProgression.V.quality;
    
  const ICorrect = 
    answer.I.root === correctProgression.I.root &&
    answer.I.quality === correctProgression.I.quality;

  return iiCorrect && VCorrect && ICorrect;
}

/**
 * Get the progression display string (e.g., "Dm7 → G7 → Cmaj7")
 */
export function getProgressionDisplayString(progression: Progression): string {
  const chordNames = [
    `${progression.ii.root}m7`,
    `${progression.V.root}7`,
    `${progression.I.root}maj7`,
  ];
  return chordNames.join(' → ');
}

/**
 * Get progression for display from an Answer (handling null values)
 */
export function getAnswerDisplayString(answer: Answer): string {
  const ii = answer.ii ? `${answer.ii.root}m7` : '___';
  const V = answer.V ? `${answer.V.root}7` : '___';
  const I = answer.I ? `${answer.I.root}maj7` : '___';
  return `${ii} → ${V} → ${I}`;
}

/**
 * Check if an answer is complete (all three chords selected)
 */
export function isAnswerComplete(answer: Answer): boolean {
  return answer.ii !== null && answer.V !== null && answer.I !== null;
}

/**
 * Create an empty answer
 */
export function createEmptyAnswer(): Answer {
  return { ii: null, V: null, I: null };
}

/**
 * Get all 12 possible ii-V-I progressions (one for each major key)
 */
export function getAllTwoFiveOneProgressions(): { key: Key; progression: Progression }[] {
  const keys: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  return keys.map(tonic => {
    const key: Key = { tonic, mode: 'major' };
    return {
      key,
      progression: buildTwoFiveOne(key),
    };
  });
}
