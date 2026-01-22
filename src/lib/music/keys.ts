/**
 * Key Utilities
 * Functions for working with musical keys
 */

import type { NoteName, Key } from './types';
import { CHROMATIC_NOTES } from './constants';

/**
 * Create a Key object
 */
export function createKey(tonic: NoteName, mode: 'major' = 'major'): Key {
  return { tonic, mode };
}

/**
 * Get a random key from all 12 major keys
 */
export function getRandomKey(): Key {
  const randomIndex = Math.floor(Math.random() * CHROMATIC_NOTES.length);
  const tonic = CHROMATIC_NOTES[randomIndex];
  return createKey(tonic, 'major');
}

/**
 * Get all 12 major keys
 */
export function getAllMajorKeys(): Key[] {
  return CHROMATIC_NOTES.map(tonic => createKey(tonic, 'major'));
}

/**
 * Get the display name for a key (e.g., "C Major", "F# Major")
 */
export function getKeyDisplayName(key: Key): string {
  const modeDisplay = key.mode.charAt(0).toUpperCase() + key.mode.slice(1);
  return `${key.tonic} ${modeDisplay}`;
}

/**
 * Get the relative minor of a major key
 * (the relative minor is built on the 6th degree)
 */
export function getRelativeMinor(majorKey: Key): NoteName {
  const majorIndex = CHROMATIC_NOTES.indexOf(majorKey.tonic);
  // Relative minor is 3 semitones below (or 9 above)
  const minorIndex = (majorIndex + 9) % 12;
  return CHROMATIC_NOTES[minorIndex];
}

/**
 * Get the parallel minor of a major key
 * (same tonic, different mode)
 */
export function getParallelMinor(majorKey: Key): Key {
  return { tonic: majorKey.tonic, mode: 'major' }; // Would be 'minor' when we add minor mode
}

/**
 * Check if two keys are equal
 */
export function keysAreEqual(a: Key, b: Key): boolean {
  return a.tonic === b.tonic && a.mode === b.mode;
}
