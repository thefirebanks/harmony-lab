/**
 * Music Theory Library
 * Core music theory primitives for the Harmony Lab platform
 */

// Types
export * from './types';

// Constants
export * from './constants';

// Scales
export {
  getMajorScale,
  getMinorScale,
  getNoteIndex,
  getNoteAtIndex,
  getScaleDegree,
  getMinorScaleDegree,
  getInterval,
  transposeNote,
} from './scales';

// Chords
export {
  getChordNotes,
  createChord,
  getDiatonicChord,
  getAllDiatonicChords,
  getChordDisplayName,
  chordsAreEqual,
  noteToMidi,
  midiToPitch,
  pitchToString,
} from './chords';

// Intervals
export {
  INTERVAL_NAMES,
  getIntervalInSemitones,
  getIntervalName,
  applyInterval,
  getPitchDistance,
} from './intervals';

// Keys
export {
  createKey,
  getRandomKey,
  getAllMajorKeys,
  getKeyDisplayName,
  getRelativeMinor,
  keysAreEqual,
} from './keys';

// Progressions
export {
  buildTwoFiveOne,
  validateProgression,
  getProgressionDisplayString,
  getAnswerDisplayString,
  isAnswerComplete,
  createEmptyAnswer,
  getAllTwoFiveOneProgressions,
} from './progressions';

// Voicings
export {
  getVoicing,
  getSimpleVoicing,
  getVoicingWithBass,
  getSimpleVoicingWithBass,
  voicingToNoteStrings,
  isVoicingInRange,
  getLowestPitch,
  getHighestPitch,
} from './voicings';
