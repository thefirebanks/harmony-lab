/**
 * Voicing Algorithms
 * Functions for generating piano voicings for chords
 */

import type { Chord, Voicing, Pitch, ChordQuality } from './types';
import { noteToMidi, midiToPitch } from './chords';

/**
 * Voicing intervals from root (in semitones) for jazz piano voicings
 * These are "rootless" voicings in the Bill Evans style - 
 * left hand voicings that omit the root (bass player handles it)
 */
const JAZZ_VOICING_INTERVALS: Record<ChordQuality, number[]> = {
  // Type A voicings (3-5-7-9 structure)
  'maj7': [4, 7, 11, 14],      // 3-5-7-9
  'min7': [3, 7, 10, 14],      // b3-5-b7-9
  '7': [4, 10, 14, 17],        // 3-b7-9-11 (or 3-7-9-13 for fuller sound)
  'min7b5': [3, 6, 10, 15],    // b3-b5-b7-11
  'dim7': [3, 6, 9, 12],       // b3-b5-bb7-root
  'dim': [3, 6, 12],           // b3-b5-root octave (diminished triad)
  'maj': [4, 7, 12],           // 3-5-root octave
  'min': [3, 7, 12],           // b3-5-root octave
};

/**
 * Simple closed voicing intervals - just the basic chord tones
 */
const SIMPLE_VOICING_INTERVALS: Record<ChordQuality, number[]> = {
  'maj7': [0, 4, 7, 11],       // 1-3-5-7
  'min7': [0, 3, 7, 10],       // 1-b3-5-b7
  '7': [0, 4, 7, 10],          // 1-3-5-b7
  'min7b5': [0, 3, 6, 10],     // 1-b3-b5-b7
  'dim7': [0, 3, 6, 9],        // 1-b3-b5-bb7
  'dim': [0, 3, 6],            // 1-b3-b5 (diminished triad)
  'maj': [0, 4, 7],            // 1-3-5
  'min': [0, 3, 7],            // 1-b3-5
};

/**
 * Generate a jazz-appropriate piano voicing for a chord
 * Using "rootless" voicings in the left hand range (C3-C4)
 * 
 * @param chord - The chord to voice
 * @returns Voicing with specific pitches
 */
export function getVoicing(chord: Chord): Voicing {
  const { root, quality } = chord;
  const rootMidi = noteToMidi(root, 3); // Start from octave 3
  
  const intervals = JAZZ_VOICING_INTERVALS[quality] || SIMPLE_VOICING_INTERVALS[quality];
  const pitches = intervals.map(interval => midiToPitch(rootMidi + interval));
  
  return { chord, pitches };
}

/**
 * Generate a simple closed voicing (with root)
 * Good for clearer, more straightforward sound
 * 
 * @param chord - The chord to voice
 * @param octave - Base octave (default 3)
 * @returns Voicing with specific pitches
 */
export function getSimpleVoicing(chord: Chord, octave: number = 3): Voicing {
  const { root, quality } = chord;
  const rootMidi = noteToMidi(root, octave);
  
  const intervals = SIMPLE_VOICING_INTERVALS[quality];
  const pitches = intervals.map(interval => midiToPitch(rootMidi + interval));
  
  return { chord, pitches };
}

/**
 * Include root in bass for clearer sound (optional, toggle in settings)
 * Adds a bass note an octave below the voicing
 * 
 * @param chord - The chord to voice
 * @returns Voicing with bass note + upper structure
 */
export function getVoicingWithBass(chord: Chord): Voicing {
  const baseVoicing = getVoicing(chord);
  const bassNote: Pitch = { note: chord.root, octave: 2 };
  
  return {
    ...baseVoicing,
    pitches: [bassNote, ...baseVoicing.pitches],
  };
}

/**
 * Get a simple voicing with bass note
 * Better for beginners - clearer sound
 */
export function getSimpleVoicingWithBass(chord: Chord): Voicing {
  const baseVoicing = getSimpleVoicing(chord, 4);
  const bassNote: Pitch = { note: chord.root, octave: 2 };
  
  return {
    ...baseVoicing,
    pitches: [bassNote, ...baseVoicing.pitches],
  };
}

/**
 * Convert a voicing to an array of note strings for Tone.js
 * e.g., ["C3", "E3", "G3", "B3"]
 */
export function voicingToNoteStrings(voicing: Voicing): string[] {
  return voicing.pitches.map(p => `${p.note}${p.octave}`);
}

/**
 * Check if a voicing is within a reasonable piano range
 * (roughly A0 to C8, MIDI 21-108)
 */
export function isVoicingInRange(voicing: Voicing): boolean {
  return voicing.pitches.every(pitch => {
    const midi = noteToMidi(pitch.note, pitch.octave);
    return midi >= 21 && midi <= 108;
  });
}

/**
 * Get the lowest pitch in a voicing
 */
export function getLowestPitch(voicing: Voicing): Pitch {
  return voicing.pitches.reduce((lowest, current) => {
    const lowestMidi = noteToMidi(lowest.note, lowest.octave);
    const currentMidi = noteToMidi(current.note, current.octave);
    return currentMidi < lowestMidi ? current : lowest;
  });
}

/**
 * Get the highest pitch in a voicing
 */
export function getHighestPitch(voicing: Voicing): Pitch {
  return voicing.pitches.reduce((highest, current) => {
    const highestMidi = noteToMidi(highest.note, highest.octave);
    const currentMidi = noteToMidi(current.note, current.octave);
    return currentMidi > highestMidi ? current : highest;
  });
}
