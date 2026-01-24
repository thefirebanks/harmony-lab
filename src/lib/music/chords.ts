/**
 * Chord Construction Utilities
 * Functions for building and working with chords
 */

import type { NoteName, Chord, ChordQuality, ScaleDegree, Pitch } from './types';
import { CHORD_INTERVALS, CHORD_QUALITY_DISPLAY, MAJOR_KEY_CHORD_QUALITIES } from './constants';
import { getNoteIndex, getNoteAtIndex, getMajorScale } from './scales';

/**
 * Get the notes that make up a chord
 * @param root - The root note
 * @param quality - The chord quality
 * @returns Array of note names in the chord
 */
export function getChordNotes(root: NoteName, quality: ChordQuality): NoteName[] {
  const rootIndex = getNoteIndex(root);
  const intervals = CHORD_INTERVALS[quality];
  return intervals.map(interval => getNoteAtIndex(rootIndex + interval));
}

/**
 * Create a chord object from its components
 */
export function createChord(root: NoteName, quality: ChordQuality, degree: ScaleDegree): Chord {
  return { root, quality, degree };
}

/**
 * Build the diatonic chord for a scale degree in a major key
 * @param tonic - The tonic of the key
 * @param degree - The scale degree (1-7)
 * @returns The diatonic chord for that degree
 */
export function getDiatonicChord(tonic: NoteName, degree: ScaleDegree): Chord {
  const scale = getMajorScale(tonic);
  const root = scale[degree - 1];
  const quality = MAJOR_KEY_CHORD_QUALITIES[degree];

  const chord = createChord(root, quality, degree);

  // Debug logging for A# major I chord
  if (tonic === 'A#' && degree === 1) {
    console.log('[A# Debug] Key:', tonic, 'Degree:', degree);
    console.log('[A# Debug] Scale:', scale);
    console.log('[A# Debug] Root:', root, 'Quality:', quality);
    const chordNotes = getChordNotes(root, quality);
    console.log('[A# Debug] Chord notes:', chordNotes);
  }

  return chord;
}

/**
 * Get all 7 diatonic chords for a major key
 * @param tonic - The tonic of the key
 * @returns Array of all 7 diatonic chords
 */
export function getAllDiatonicChords(tonic: NoteName): Chord[] {
  const degrees: ScaleDegree[] = [1, 2, 3, 4, 5, 6, 7];
  return degrees.map(degree => getDiatonicChord(tonic, degree));
}

/**
 * Get the display name for a chord (e.g., "Dm7", "Cmaj7", "G7")
 * @param chord - The chord to display
 * @returns Human-readable chord name
 */
export function getChordDisplayName(chord: Chord): string {
  return `${chord.root}${CHORD_QUALITY_DISPLAY[chord.quality]}`;
}

/**
 * Check if two chords are equal (same root and quality)
 */
export function chordsAreEqual(a: Chord, b: Chord): boolean {
  return a.root === b.root && a.quality === b.quality;
}

/**
 * Convert a note name to MIDI number
 * @param note - The note name
 * @param octave - The octave (4 = middle C octave)
 * @returns MIDI note number (0-127)
 */
export function noteToMidi(note: NoteName, octave: number): number {
  const noteIndex = getNoteIndex(note);
  // C4 (middle C) is MIDI note 60
  return 12 + (octave * 12) + noteIndex;
}

/**
 * Convert a MIDI note number to a Pitch
 * @param midi - MIDI note number (0-127)
 * @returns Pitch object with note name and octave
 */
export function midiToPitch(midi: number): Pitch {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return {
    note: getNoteAtIndex(noteIndex),
    octave,
  };
}

/**
 * Convert a Pitch to a string for Tone.js (e.g., "C4", "F#3")
 */
export function pitchToString(pitch: Pitch): string {
  return `${pitch.note}${pitch.octave}`;
}
