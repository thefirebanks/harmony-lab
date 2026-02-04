/**
 * Chord Tone Utilities
 * Functions for getting chord tones and analyzing chord/scale relationships for soloing
 */

import type { NoteName, Chord, ChordQuality, ScaleDegree } from './types';
import { getChordNotes, getDiatonicChord } from './chords';
import { getMajorScale, getMinorScale, getNoteIndex } from './scales';
import type { FretboardNote } from './fretboard';
import { getNoteFretboardPositions } from './fretboard';

/**
 * Chord tone type - categorizes a note's role relative to a chord
 */
export type ChordToneType = 'root' | 'third' | 'fifth' | 'seventh' | 'extension';

/**
 * Note category for visualization
 */
export type NoteCategory = 'chord-tone' | 'scale-tone' | 'avoid-tone' | 'outside';

/**
 * Enhanced note info with chord relationship
 */
export interface ChordToneInfo {
  note: NoteName;
  type: ChordToneType;
  intervalFromRoot: number; // Semitones from root
  label: string; // "R", "3", "b3", "5", "7", "b7", etc.
}

/**
 * Get chord tones with their roles for a given chord
 * @param chord - The chord to analyze
 * @returns Array of chord tone info
 */
export function getChordTonesWithRoles(chord: Chord): ChordToneInfo[] {
  const notes = getChordNotes(chord.root, chord.quality);
  const rootIndex = getNoteIndex(chord.root);
  
  return notes.map((note, i) => {
    const interval = (getNoteIndex(note) - rootIndex + 12) % 12;
    
    let type: ChordToneType;
    let label: string;
    
    if (i === 0) {
      type = 'root';
      label = 'R';
    } else if (i === 1) {
      type = 'third';
      label = interval === 3 ? 'b3' : '3';
    } else if (i === 2) {
      type = 'fifth';
      label = interval === 6 ? 'b5' : (interval === 8 ? '#5' : '5');
    } else {
      type = 'seventh';
      label = interval === 10 ? 'b7' : (interval === 9 ? 'bb7' : '7');
    }
    
    return {
      note,
      type,
      intervalFromRoot: interval,
      label,
    };
  });
}

/**
 * Get all chord tones for a chord (just the note names)
 */
export function getChordTones(chord: Chord): NoteName[] {
  return getChordNotes(chord.root, chord.quality);
}

/**
 * Get the avoid notes for a chord in a given key
 * Avoid notes are scale tones that clash with chord tones (typically a half step above a chord tone)
 * @param chord - The chord to analyze
 * @param keyTonic - The tonic of the key
 * @param mode - 'major' or 'minor'
 * @returns Array of note names to avoid
 */
export function getAvoidNotes(
  chord: Chord,
  keyTonic: NoteName,
  mode: 'major' | 'minor' = 'major'
): NoteName[] {
  const scale = mode === 'major' ? getMajorScale(keyTonic) : getMinorScale(keyTonic);
  const chordTones = getChordTones(chord);
  const avoidNotes: NoteName[] = [];
  
  // For each scale tone, check if it's a half step above a chord tone
  for (const scaleTone of scale) {
    if (chordTones.includes(scaleTone)) continue;
    
    const scaleToneIndex = getNoteIndex(scaleTone);
    
    for (const chordTone of chordTones) {
      const chordToneIndex = getNoteIndex(chordTone);
      const interval = (scaleToneIndex - chordToneIndex + 12) % 12;
      
      // A note is typically "avoid" if it's a half step above a chord tone
      // Exception: the 4th over a major chord is often considered avoid
      if (interval === 1) {
        avoidNotes.push(scaleTone);
        break;
      }
    }
  }
  
  return avoidNotes;
}

/**
 * Categorize a note relative to a chord and key
 * @param note - The note to categorize
 * @param chord - The current chord
 * @param keyTonic - The tonic of the key
 * @param mode - 'major' or 'minor'
 * @returns The category of the note
 */
export function categorizeNote(
  note: NoteName,
  chord: Chord,
  keyTonic: NoteName,
  mode: 'major' | 'minor' = 'major'
): NoteCategory {
  const chordTones = getChordTones(chord);
  const scale = mode === 'major' ? getMajorScale(keyTonic) : getMinorScale(keyTonic);
  const avoidNotes = getAvoidNotes(chord, keyTonic, mode);
  
  if (chordTones.includes(note)) {
    return 'chord-tone';
  }
  
  if (avoidNotes.includes(note)) {
    return 'avoid-tone';
  }
  
  if (scale.includes(note)) {
    return 'scale-tone';
  }
  
  return 'outside';
}

/**
 * Get all notes on the fretboard categorized for a chord progression
 * @param chords - Array of chords in the progression
 * @param keyTonic - The tonic of the key
 * @param mode - 'major' or 'minor'
 * @param minFret - Minimum fret to include
 * @param maxFret - Maximum fret to include
 * @returns Array of fretboard notes with category info for each chord
 */
export function getProgressionNotesOnFretboard(
  chords: Chord[],
  keyTonic: NoteName,
  mode: 'major' | 'minor' = 'major',
  minFret: number = 0,
  maxFret: number = 15
): Map<Chord, FretboardNote[]> {
  const scale = mode === 'major' ? getMajorScale(keyTonic) : getMinorScale(keyTonic);
  const result = new Map<Chord, FretboardNote[]>();
  
  for (const chord of chords) {
    const chordTones = getChordTonesWithRoles(chord);
    const avoidNotes = getAvoidNotes(chord, keyTonic, mode);
    const notes: FretboardNote[] = [];
    
    // Add all scale notes to the fretboard
    for (const scaleTone of scale) {
      const positions = getNoteFretboardPositions(scaleTone, minFret, maxFret);
      const isChordTone = chordTones.some(ct => ct.note === scaleTone);
      const isAvoid = avoidNotes.includes(scaleTone);
      const chordToneInfo = chordTones.find(ct => ct.note === scaleTone);
      
      for (const pos of positions) {
        notes.push({
          ...pos,
          isChordTone,
          isRoot: chordToneInfo?.type === 'root',
          label: isChordTone ? chordToneInfo?.label : undefined,
          opacity: isChordTone ? 1 : (isAvoid ? 0.3 : 0.6),
        });
      }
    }
    
    result.set(chord, notes);
  }
  
  return result;
}

/**
 * Get chord tones for a diatonic chord by degree
 * @param keyTonic - The tonic of the key
 * @param degree - Scale degree (1-7)
 * @returns Array of note names
 */
export function getDiatonicChordTones(
  keyTonic: NoteName,
  degree: ScaleDegree
): NoteName[] {
  const chord = getDiatonicChord(keyTonic, degree);
  return getChordTones(chord);
}

/**
 * Get chord tones on the fretboard for a specific chord
 * Useful for highlighting where to play chord tones when soloing
 */
export function getChordTonesOnFretboard(
  chord: Chord,
  minFret: number = 0,
  maxFret: number = 15
): FretboardNote[] {
  const chordTones = getChordTonesWithRoles(chord);
  const notes: FretboardNote[] = [];
  
  for (const toneInfo of chordTones) {
    const positions = getNoteFretboardPositions(toneInfo.note, minFret, maxFret);
    
    for (const pos of positions) {
      notes.push({
        ...pos,
        isChordTone: true,
        isRoot: toneInfo.type === 'root',
        label: toneInfo.label,
        opacity: 1,
      });
    }
  }
  
  return notes;
}

/**
 * Select a random subset of notes for "focus mode"
 * Picks notes that are musically interesting to practice
 * @param notes - Available notes
 * @param count - How many notes to select
 * @param preferChordTones - Whether to favor chord tones
 * @returns Selected subset of notes
 */
export function selectFocusNotes(
  notes: FretboardNote[],
  count: number = 4,
  preferChordTones: boolean = true
): FretboardNote[] {
  if (notes.length <= count) return notes;
  
  // Get unique note names
  const uniqueNoteNames = [...new Set(notes.map(n => n.note))];
  
  // Separate chord tones and scale tones
  const chordToneNames = uniqueNoteNames.filter(name => 
    notes.some(n => n.note === name && n.isChordTone)
  );
  const scaleToneNames = uniqueNoteNames.filter(name => 
    !chordToneNames.includes(name)
  );
  
  // Select notes
  const selectedNames: NoteName[] = [];
  
  if (preferChordTones) {
    // Start with 2-3 chord tones
    const chordToneCount = Math.min(Math.ceil(count * 0.6), chordToneNames.length);
    const shuffledChordTones = [...chordToneNames].sort(() => Math.random() - 0.5);
    selectedNames.push(...shuffledChordTones.slice(0, chordToneCount));
    
    // Fill rest with scale tones
    const remaining = count - selectedNames.length;
    const shuffledScaleTones = [...scaleToneNames].sort(() => Math.random() - 0.5);
    selectedNames.push(...shuffledScaleTones.slice(0, remaining));
  } else {
    // Random selection
    const shuffled = [...uniqueNoteNames].sort(() => Math.random() - 0.5);
    selectedNames.push(...shuffled.slice(0, count));
  }
  
  // Return all positions for selected notes
  return notes.filter(n => selectedNames.includes(n.note));
}

/**
 * Get safe landing notes for transitioning between two chords
 * These are notes that work well over both chords
 * @param fromChord - The chord we're coming from
 * @param toChord - The chord we're going to
 * @returns Array of notes that work over both chords
 */
export function getSafeLandingNotes(
  fromChord: Chord,
  toChord: Chord
): NoteName[] {
  const fromTones = getChordTones(fromChord);
  const toTones = getChordTones(toChord);
  
  // Find common tones
  const commonTones = fromTones.filter(note => toTones.includes(note));
  
  // If no common tones, return the chord tones of the target chord
  // (landing on chord tones of the new chord is always safe)
  if (commonTones.length === 0) {
    return toTones;
  }
  
  return commonTones;
}

/**
 * Get the voice leading suggestion between two chords
 * For a given starting note, suggest the closest chord tone of the next chord
 * @param startNote - The note we're starting from
 * @param toChord - The chord we're moving to
 * @returns The suggested target note
 */
export function getSuggestedTarget(
  startNote: NoteName,
  toChord: Chord
): NoteName {
  const toTones = getChordTones(toChord);
  const startIndex = getNoteIndex(startNote);
  
  // Find the closest chord tone
  let closestNote = toTones[0];
  let closestDistance = 12;
  
  for (const tone of toTones) {
    const toneIndex = getNoteIndex(tone);
    const distance = Math.min(
      Math.abs(toneIndex - startIndex),
      12 - Math.abs(toneIndex - startIndex)
    );
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestNote = tone;
    }
  }
  
  return closestNote;
}
