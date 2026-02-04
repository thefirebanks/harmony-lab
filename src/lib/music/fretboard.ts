/**
 * Fretboard Math Utilities
 * Functions for mapping notes to guitar fretboard positions and scale visualization
 */

import type { NoteName, Pitch, ScaleDegree } from './types';
import { getNoteIndex, getNoteAtIndex, getMajorScale, getMinorScale } from './scales';
import { GUITAR_TUNING, GUITAR_RANGE } from '@/games/interval-games/types';
import { noteToMidi } from './chords';

/**
 * A note on the fretboard with position and display info
 */
export interface FretboardNote {
  string: 1 | 2 | 3 | 4 | 5 | 6;
  fret: number;
  note: NoteName;
  octave: number;

  // Display options
  label?: string; // What to show on the dot ("R", "3", "5", note name, degree)
  color?: string; // Override color
  size?: 'small' | 'normal' | 'large';
  opacity?: number; // 0-1 for highlighting levels
  isChordTone?: boolean;
  isRoot?: boolean;
  scaleDegree?: ScaleDegree;
}

/**
 * Scale position system type
 */
export type PositionSystem = 'caged' | '3nps';

/**
 * Fret pattern for a scale position (relative frets per string from position root)
 */
export interface FretPattern {
  string6: number[];
  string5: number[];
  string4: number[];
  string3: number[];
  string2: number[];
  string1: number[];
}

/**
 * A scale position definition
 */
export interface ScalePosition {
  system: PositionSystem;
  name: string;
  rootString: 1 | 2 | 3 | 4 | 5 | 6;
  startFretOffset: number; // Where the position starts relative to the root note fret
  pattern: FretPattern;
}

/**
 * Custom progression type for the progression builder
 */
export interface CustomProgression {
  key: NoteName;
  mode: 'major' | 'minor';
  chords: {
    degree: ScaleDegree;
    beats: number; // How many beats this chord lasts
  }[];
}

/**
 * Get the note at a specific fretboard position
 * @param stringNum - String number (1-6, where 1 is high E, 6 is low E)
 * @param fret - Fret number (0 = open string)
 * @returns Pitch object with note name and octave
 */
export function getNoteAtPosition(
  stringNum: 1 | 2 | 3 | 4 | 5 | 6,
  fret: number
): Pitch {
  const openString = GUITAR_TUNING[stringNum];
  const openMidi = noteToMidi(openString.note, openString.octave);
  const targetMidi = openMidi + fret;
  
  const noteIndex = targetMidi % 12;
  const octave = Math.floor(targetMidi / 12) - 1;
  
  return {
    note: getNoteAtIndex(noteIndex),
    octave,
  };
}

/**
 * Get all fretboard positions where a specific note can be played
 * @param targetNote - The note to find
 * @param minFret - Minimum fret to search (default 0)
 * @param maxFret - Maximum fret to search (default from GUITAR_RANGE)
 * @returns Array of FretboardNote objects
 */
export function getNoteFretboardPositions(
  targetNote: NoteName,
  minFret: number = 0,
  maxFret: number = GUITAR_RANGE.frets
): FretboardNote[] {
  const positions: FretboardNote[] = [];
  const targetIndex = getNoteIndex(targetNote);

  for (let stringNum = 1; stringNum <= 6; stringNum++) {
    const str = stringNum as 1 | 2 | 3 | 4 | 5 | 6;
    const openString = GUITAR_TUNING[str];
    const openIndex = getNoteIndex(openString.note);

    for (let fret = minFret; fret <= maxFret; fret++) {
      const noteAtFret = (openIndex + fret) % 12;
      if (noteAtFret === targetIndex) {
        const pitch = getNoteAtPosition(str, fret);
        positions.push({
          string: str,
          fret,
          note: pitch.note,
          octave: pitch.octave,
        });
      }
    }
  }

  return positions;
}

/**
 * Get all positions for multiple notes (e.g., a chord or scale)
 * @param notes - Array of note names
 * @param minFret - Minimum fret
 * @param maxFret - Maximum fret
 * @returns Array of FretboardNote objects
 */
export function getMultipleNotesPositions(
  notes: NoteName[],
  minFret: number = 0,
  maxFret: number = GUITAR_RANGE.frets
): FretboardNote[] {
  const allPositions: FretboardNote[] = [];
  
  for (const note of notes) {
    const positions = getNoteFretboardPositions(note, minFret, maxFret);
    allPositions.push(...positions);
  }

  return allPositions;
}

/**
 * Get all scale notes on the fretboard with scale degree information
 * @param tonic - Root note of the scale
 * @param mode - 'major' or 'minor'
 * @param minFret - Minimum fret
 * @param maxFret - Maximum fret
 * @returns Array of FretboardNote objects with scale degree info
 */
export function getScaleOnFretboard(
  tonic: NoteName,
  mode: 'major' | 'minor' = 'major',
  minFret: number = 0,
  maxFret: number = GUITAR_RANGE.frets
): FretboardNote[] {
  const scale = mode === 'major' ? getMajorScale(tonic) : getMinorScale(tonic);
  const positions: FretboardNote[] = [];

  for (let degree = 0; degree < scale.length; degree++) {
    const note = scale[degree];
    const notePositions = getNoteFretboardPositions(note, minFret, maxFret);
    
    for (const pos of notePositions) {
      positions.push({
        ...pos,
        scaleDegree: (degree + 1) as ScaleDegree,
        isRoot: degree === 0,
        label: String(degree + 1),
      });
    }
  }

  return positions;
}

/**
 * Get the scale degree of a note within a key
 * @param note - The note to check
 * @param tonic - The tonic of the key
 * @param mode - 'major' or 'minor'
 * @returns Scale degree (1-7) or null if not in scale
 */
export function getScaleDegreeOfNote(
  note: NoteName,
  tonic: NoteName,
  mode: 'major' | 'minor' = 'major'
): ScaleDegree | null {
  const scale = mode === 'major' ? getMajorScale(tonic) : getMinorScale(tonic);
  const index = scale.indexOf(note);
  return index >= 0 ? ((index + 1) as ScaleDegree) : null;
}

/**
 * Check if a note is in a given scale
 */
export function isNoteInScale(
  note: NoteName,
  tonic: NoteName,
  mode: 'major' | 'minor' = 'major'
): boolean {
  return getScaleDegreeOfNote(note, tonic, mode) !== null;
}

/**
 * Get the fret number for a note on a specific string
 * Returns the lowest fret where the note can be played on that string
 * @param note - Target note
 * @param stringNum - String number
 * @param minFret - Minimum fret to return (default 0)
 * @param maxFret - Maximum fret to search
 * @returns Fret number or null if not found in range
 */
export function getFretForNoteOnString(
  note: NoteName,
  stringNum: 1 | 2 | 3 | 4 | 5 | 6,
  minFret: number = 0,
  maxFret: number = GUITAR_RANGE.frets
): number | null {
  const openString = GUITAR_TUNING[stringNum];
  const openIndex = getNoteIndex(openString.note);
  const targetIndex = getNoteIndex(note);

  // Calculate the interval from open string to target note
  let interval = (targetIndex - openIndex + 12) % 12;
  
  // If interval is 0 and minFret > 0, we need to go up an octave
  if (interval < minFret) {
    interval += 12;
  }

  while (interval <= maxFret) {
    if (interval >= minFret) {
      return interval;
    }
    interval += 12;
  }

  return null;
}

/**
 * Filter fretboard notes to a specific fret range (for position-based practice)
 */
export function filterNotesToFretRange(
  notes: FretboardNote[],
  minFret: number,
  maxFret: number
): FretboardNote[] {
  return notes.filter(n => n.fret >= minFret && n.fret <= maxFret);
}

/**
 * Sort fretboard notes by string (low to high) then by fret
 */
export function sortFretboardNotes(notes: FretboardNote[]): FretboardNote[] {
  return [...notes].sort((a, b) => {
    // Sort by string first (6 to 1, low E to high E)
    if (a.string !== b.string) {
      return b.string - a.string;
    }
    // Then by fret
    return a.fret - b.fret;
  });
}

/**
 * Get unique notes from fretboard positions (by pitch)
 */
export function getUniquePitches(notes: FretboardNote[]): FretboardNote[] {
  const seen = new Set<string>();
  return notes.filter(n => {
    const key = `${n.note}${n.octave}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ============================================================================
// CAGED Position Definitions
// ============================================================================

/**
 * CAGED major scale positions
 * Each position is named after the chord shape it's based on
 * Patterns are relative fret numbers from the position's root
 */
export const CAGED_MAJOR_POSITIONS: Record<string, ScalePosition> = {
  // E shape - root on 6th string
  E: {
    system: 'caged',
    name: 'E Shape',
    rootString: 6,
    startFretOffset: 0,
    pattern: {
      string6: [0, 2, 4],      // R, 2, 3
      string5: [0, 2, 4],      // 4, 5, 6
      string4: [1, 2, 4],      // 7, R, 2
      string3: [1, 2, 4],      // 3, 4, 5
      string2: [0, 2, 4],      // 6, 7, R
      string1: [0, 2, 4],      // 2, 3, 4
    },
  },
  // D shape - root on 4th string
  D: {
    system: 'caged',
    name: 'D Shape',
    rootString: 4,
    startFretOffset: 0,
    pattern: {
      string6: [-1, 1, 2],     // 6, 7, R (below position)
      string5: [-1, 1, 2],     // 2, 3, 4
      string4: [0, 2, 4],      // R, 2, 3
      string3: [0, 1, 4],      // 4, 5, 6
      string2: [0, 2, 3],      // 7, R, 2
      string1: [0, 2, 4],      // 3, 4, 5
    },
  },
  // C shape - root on 5th string
  C: {
    system: 'caged',
    name: 'C Shape',
    rootString: 5,
    startFretOffset: 0,
    pattern: {
      string6: [-2, -1, 1],    // 5, 6, 7
      string5: [0, 2, 3],      // R, 2, 3
      string4: [0, 2, 3],      // 4, 5, 6
      string3: [0, 2],         // 7, R
      string2: [1, 3],         // 2, 3
      string1: [0, 1, 3],      // 4, 5, 6
    },
  },
  // A shape - root on 5th string
  A: {
    system: 'caged',
    name: 'A Shape',
    rootString: 5,
    startFretOffset: 0,
    pattern: {
      string6: [-1, 1, 2],     // 7, R, 2
      string5: [0, 2, 4],      // R, 2, 3 (note: this overlaps with above when position shifts)
      string4: [1, 2, 4],      // 4, 5, 6
      string3: [1, 2, 4],      // 7, R, 2
      string2: [2, 4, 5],      // 3, 4, 5
      string1: [2, 4],         // 6, 7
    },
  },
  // G shape - root on 6th string (4 frets up from E shape)
  G: {
    system: 'caged',
    name: 'G Shape',
    rootString: 6,
    startFretOffset: -3, // Position starts 3 frets below root
    pattern: {
      string6: [0, 2, 3],      // R, 2, 3
      string5: [-1, 0, 2],     // 5, 6, 7
      string4: [-1, 1, 2],     // R, 2, 3
      string3: [-1, 1, 2],     // 4, 5, 6
      string2: [0, 2],         // 7, R
      string1: [0, 2, 3],      // 2, 3, 4
    },
  },
};

// ============================================================================
// 3-Notes-Per-String Position Definitions
// ============================================================================

/**
 * 3NPS major scale positions
 * Each position corresponds to a mode starting from that scale degree
 */
export const THREE_NPS_MAJOR_POSITIONS: Record<string, ScalePosition> = {
  // Position 1 - Ionian (starts from root)
  '1': {
    system: '3nps',
    name: 'Position 1 (Ionian)',
    rootString: 6,
    startFretOffset: 0,
    pattern: {
      string6: [0, 2, 4],      // R, 2, 3
      string5: [0, 2, 4],      // 4, 5, 6
      string4: [1, 2, 4],      // 7, R, 2
      string3: [1, 2, 4],      // 3, 4, 5
      string2: [0, 2, 4],      // 6, 7, R
      string1: [0, 2, 4],      // 2, 3, 4
    },
  },
  // Position 2 - Dorian
  '2': {
    system: '3nps',
    name: 'Position 2 (Dorian)',
    rootString: 6,
    startFretOffset: 2,
    pattern: {
      string6: [0, 2, 3],      // 2, 3, 4
      string5: [0, 2, 4],      // 5, 6, 7
      string4: [0, 2, 4],      // R, 2, 3
      string3: [0, 2, 4],      // 4, 5, 6
      string2: [0, 2, 3],      // 7, R, 2
      string1: [0, 2, 4],      // 3, 4, 5
    },
  },
  // Position 3 - Phrygian
  '3': {
    system: '3nps',
    name: 'Position 3 (Phrygian)',
    rootString: 6,
    startFretOffset: 4,
    pattern: {
      string6: [0, 1, 3],      // 3, 4, 5
      string5: [0, 2, 3],      // 6, 7, R
      string4: [0, 2, 4],      // 2, 3, 4
      string3: [0, 2, 4],      // 5, 6, 7
      string2: [0, 1, 3],      // R, 2, 3
      string1: [0, 2, 4],      // 4, 5, 6
    },
  },
  // Position 4 - Lydian
  '4': {
    system: '3nps',
    name: 'Position 4 (Lydian)',
    rootString: 6,
    startFretOffset: 5,
    pattern: {
      string6: [0, 2, 4],      // 4, 5, 6
      string5: [0, 1, 3],      // 7, R, 2
      string4: [0, 2, 4],      // 3, 4, 5
      string3: [0, 2, 4],      // 6, 7, R
      string2: [0, 2, 4],      // 2, 3, 4
      string1: [0, 2, 4],      // 5, 6, 7
    },
  },
  // Position 5 - Mixolydian
  '5': {
    system: '3nps',
    name: 'Position 5 (Mixolydian)',
    rootString: 6,
    startFretOffset: 7,
    pattern: {
      string6: [0, 2, 4],      // 5, 6, 7
      string5: [0, 2, 4],      // R, 2, 3
      string4: [0, 2, 4],      // 4, 5, 6
      string3: [0, 1, 3],      // 7, R, 2
      string2: [0, 2, 4],      // 3, 4, 5
      string1: [0, 2, 3],      // 6, 7, R
    },
  },
  // Position 6 - Aeolian (natural minor)
  '6': {
    system: '3nps',
    name: 'Position 6 (Aeolian)',
    rootString: 6,
    startFretOffset: 9,
    pattern: {
      string6: [0, 2, 3],      // 6, 7, R
      string5: [0, 2, 4],      // 2, 3, 4
      string4: [0, 2, 4],      // 5, 6, 7
      string3: [0, 2, 4],      // R, 2, 3
      string2: [0, 2, 3],      // 4, 5, 6
      string1: [0, 1, 3],      // 7, R, 2
    },
  },
  // Position 7 - Locrian
  '7': {
    system: '3nps',
    name: 'Position 7 (Locrian)',
    rootString: 6,
    startFretOffset: 11,
    pattern: {
      string6: [0, 1, 3],      // 7, R, 2
      string5: [0, 2, 4],      // 3, 4, 5
      string4: [0, 2, 3],      // 6, 7, R
      string3: [0, 2, 4],      // 2, 3, 4
      string2: [0, 1, 3],      // 5, 6, 7
      string1: [0, 2, 4],      // R, 2, 3
    },
  },
};

/**
 * Get a scale position applied to a specific root note
 * @param position - The scale position definition
 * @param tonic - The root note of the scale
 * @param mode - 'major' or 'minor'
 * @returns Array of FretboardNote objects for this position
 */
export function getScalePositionNotes(
  position: ScalePosition,
  tonic: NoteName,
  mode: 'major' | 'minor' = 'major'
): FretboardNote[] {
  // Find the root fret on the root string
  const rootFret = getFretForNoteOnString(tonic, position.rootString, 0, 12);
  if (rootFret === null) return [];

  const baseFret = rootFret + position.startFretOffset;
  const notes: FretboardNote[] = [];

  // Process each string
  const stringKeys = ['string6', 'string5', 'string4', 'string3', 'string2', 'string1'] as const;
  
  for (let i = 0; i < stringKeys.length; i++) {
    const stringKey = stringKeys[i];
    const stringNum = (6 - i) as 1 | 2 | 3 | 4 | 5 | 6;
    const frets = position.pattern[stringKey];

    for (const relativeFret of frets) {
      const actualFret = baseFret + relativeFret;
      
      // Skip if fret is negative or too high
      if (actualFret < 0 || actualFret > GUITAR_RANGE.frets) continue;

      const pitch = getNoteAtPosition(stringNum, actualFret);
      const degree = getScaleDegreeOfNote(pitch.note, tonic, mode);

      if (degree !== null) {
        notes.push({
          string: stringNum,
          fret: actualFret,
          note: pitch.note,
          octave: pitch.octave,
          scaleDegree: degree,
          isRoot: degree === 1,
          label: String(degree),
        });
      }
    }
  }

  return notes;
}

/**
 * Get all positions for a scale (CAGED or 3NPS)
 */
export function getAllScalePositions(
  system: PositionSystem
): Record<string, ScalePosition> {
  return system === 'caged' ? CAGED_MAJOR_POSITIONS : THREE_NPS_MAJOR_POSITIONS;
}

/**
 * Get position names for a system
 */
export function getPositionNames(system: PositionSystem): string[] {
  return Object.keys(getAllScalePositions(system));
}
