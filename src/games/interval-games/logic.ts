/**
 * Interval Games Logic
 * Core game mechanics for Interval Flash and related games
 */

import type {
  IntervalFlashRound,
  IntervalFlashAnswer,
  IntervalFlashSettings,
  IntervalName,
  IntervalDirection,
  FretboardPosition,
} from './types';
import type { ValidationResult } from '@/lib/game-engine/types';
import type { Pitch } from '@/lib/music/types';
import { getNoteIndex, getNoteAtIndex } from '@/lib/music';
import {
  INTERVAL_SEMITONES,
  INTERVAL_DISPLAY_NAMES,
  SEMITONES_TO_INTERVAL,
  GUITAR_TUNING,
  GUITAR_RANGE,
} from './types';


/**
 * Get a random element from an array
 */
function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffle an array (Fisher-Yates)
 */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Convert pitch to MIDI note number
 */
function pitchToMidi(pitch: Pitch): number {
  return getNoteIndex(pitch.note) + (pitch.octave + 1) * 12;
}

/**
 * Convert MIDI note number to pitch
 */
function midiToPitch(midi: number): Pitch {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return {
    note: getNoteAtIndex(noteIndex),
    octave,
  };
}

/**
 * Get guitar range in MIDI notes
 */
function getGuitarMidiRange(): { min: number; max: number } {
  const min = pitchToMidi(GUITAR_RANGE.lowest);
  const max = pitchToMidi(GUITAR_RANGE.highest);
  return { min, max };
}

/**
 * Generate a random root note within guitar range
 * Leaves room for the interval in the specified direction
 */
function generateRootNote(
  maxSemitones: number,
  direction: IntervalDirection
): Pitch {
  const range = getGuitarMidiRange();

  // Adjust range to leave room for the interval
  let minMidi = range.min;
  let maxMidi = range.max;

  if (direction === 'ascending') {
    // Leave room at the top for ascending intervals
    maxMidi = maxMidi - maxSemitones;
  } else {
    // Leave room at the bottom for descending intervals
    minMidi = minMidi + maxSemitones;
  }

  // Generate random MIDI note in range
  const midiRange = maxMidi - minMidi;
  const randomMidi = minMidi + Math.floor(Math.random() * midiRange);

  return midiToPitch(randomMidi);
}

/**
 * Apply an interval to a pitch
 */
function applyIntervalToPitch(
  pitch: Pitch,
  semitones: number,
  direction: IntervalDirection
): Pitch {
  const rootMidi = pitchToMidi(pitch);
  const targetMidi =
    direction === 'ascending' ? rootMidi + semitones : rootMidi - semitones;
  return midiToPitch(targetMidi);
}

/**
 * Generate answer options for a round
 * Includes the correct answer and plausible distractors
 */
function generateOptions(
  correctInterval: IntervalName,
  enabledIntervals: IntervalName[],
  count: number
): IntervalName[] {
  // Start with the correct answer
  const options: IntervalName[] = [correctInterval];

  // Get other enabled intervals as potential distractors
  const distractors = enabledIntervals.filter((i) => i !== correctInterval);

  // Shuffle and take enough distractors
  const shuffledDistractors = shuffleArray(distractors);
  const neededDistractors = count - 1;

  for (let i = 0; i < neededDistractors && i < shuffledDistractors.length; i++) {
    options.push(shuffledDistractors[i]);
  }

  // Shuffle the final options so correct answer isn't always first
  return shuffleArray(options);
}

/**
 * Generate a new Interval Flash round
 */
export function generateFlashRound(
  settings: IntervalFlashSettings
): IntervalFlashRound {
  const { enabledIntervals, includeDescending, timeLimit, optionsCount } = settings;

  // Pick a random interval from enabled intervals
  const interval = getRandomElement(enabledIntervals);
  const semitones = INTERVAL_SEMITONES[interval];

  // Pick direction
  const direction: IntervalDirection =
    includeDescending && Math.random() > 0.5 ? 'descending' : 'ascending';

  // Generate root note (leave room for interval)
  const maxIntervalSemitones = Math.max(
    ...enabledIntervals.map((i) => INTERVAL_SEMITONES[i])
  );
  const rootNote = generateRootNote(maxIntervalSemitones, direction);

  // Calculate target note
  const targetNote = applyIntervalToPitch(rootNote, semitones, direction);

  // Generate answer options
  const options = generateOptions(interval, enabledIntervals, optionsCount);

  return {
    rootNote,
    targetNote,
    interval,
    direction,
    semitones,
    timeLimit: timeLimit * 1000, // Convert to milliseconds
    options,
  };
}

/**
 * Validate the user's answer for Interval Flash
 */
export function validateFlashAnswer(
  round: IntervalFlashRound,
  answer: IntervalFlashAnswer
): ValidationResult {
  if (answer === null) {
    return {
      isCorrect: false,
      feedback: 'Time ran out! The interval was ' + INTERVAL_DISPLAY_NAMES[round.interval],
      correctAnswer: round.interval,
    };
  }

  const isCorrect = answer === round.interval;

  if (isCorrect) {
    return {
      isCorrect: true,
      feedback: 'Correct!',
    };
  }

  return {
    isCorrect: false,
    feedback: `Not quite. That was a ${INTERVAL_DISPLAY_NAMES[round.interval]} (${round.semitones} semitones).`,
    correctAnswer: round.interval,
  };
}

/**
 * Convert a pitch to a note string for Tone.js
 */
export function pitchToNoteString(pitch: Pitch): string {
  return `${pitch.note}${pitch.octave}`;
}

/**
 * Get all fretboard positions where an interval exists from a given root
 */
export function getIntervalFretboardPositions(
  rootPosition: FretboardPosition,
  interval: IntervalName,
  direction: IntervalDirection
): FretboardPosition[] {
  const positions: FretboardPosition[] = [];
  const semitones = INTERVAL_SEMITONES[interval];
  const targetSemitones = direction === 'ascending' ? semitones : -semitones;

  // Calculate root note's MIDI
  const rootString = rootPosition.string as 1 | 2 | 3 | 4 | 5 | 6;
  const openNote = GUITAR_TUNING[rootString];
  const rootMidi =
    getNoteIndex(openNote.note) + (openNote.octave + 1) * 12 + rootPosition.fret;

  // Target MIDI
  const targetMidi = rootMidi + targetSemitones;

  // Find all positions on the fretboard that produce this note
  for (let string = 1; string <= 6; string++) {
    const stringNum = string as 1 | 2 | 3 | 4 | 5 | 6;
    const stringOpen = GUITAR_TUNING[stringNum];
    const stringOpenMidi =
      getNoteIndex(stringOpen.note) + (stringOpen.octave + 1) * 12;

    const fret = targetMidi - stringOpenMidi;

    // Check if fret is valid (0-24)
    if (fret >= 0 && fret <= GUITAR_RANGE.frets) {
      positions.push({
        string: stringNum,
        fret,
      });
    }
  }

  return positions;
}

/**
 * Get the interval shape description for guitar
 * Returns common guitar fingering patterns for intervals
 */
export function getIntervalShapeDescription(interval: IntervalName): string {
  const shapes: Record<IntervalName, string> = {
    unison: 'Same note',
    m2: '1 fret up, same string',
    M2: '2 frets up, same string',
    m3: '3 frets up, same string OR 1 string up, 2 frets back',
    M3: '4 frets up, same string OR 1 string up, 1 fret back',
    P4: '5 frets up, same string OR 1 string up, same fret (except B string)',
    TT: '6 frets up, same string OR 1 string up, 1 fret forward',
    P5: '7 frets up, same string OR 1 string up, 2 frets forward',
    m6: '8 frets up, same string OR 2 strings up, 1 fret back',
    M6: '9 frets up, same string OR 2 strings up, same fret',
    m7: '10 frets up, same string OR 2 strings up, 1 fret forward',
    M7: '11 frets up, same string OR 2 strings up, 2 frets forward',
    octave: '12 frets up, same string OR 2 strings up, 2 frets forward',
  };

  return shapes[interval];
}

/**
 * Get interval from semitone count
 */
export function getIntervalFromSemitones(semitones: number): IntervalName | null {
  const normalizedSemitones = Math.abs(semitones) % 13; // 0-12 range
  return SEMITONES_TO_INTERVAL[normalizedSemitones] || null;
}

/**
 * Calculate semitones between two pitches
 */
export function getSemitonesBetweenPitches(from: Pitch, to: Pitch): number {
  const fromMidi = pitchToMidi(from);
  const toMidi = pitchToMidi(to);
  return toMidi - fromMidi;
}

/**
 * Check if a pitch is within guitar range
 */
export function isPitchInGuitarRange(pitch: Pitch): boolean {
  const midi = pitchToMidi(pitch);
  const range = getGuitarMidiRange();
  return midi >= range.min && midi <= range.max;
}
