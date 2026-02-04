/**
 * Interval Games Module
 * Export all types, logic, and config for interval training games
 */

// Types
export * from './types';

// Logic
export {
  generateFlashRound,
  validateFlashAnswer,
  pitchToNoteString,
  getIntervalFretboardPositions,
  getIntervalShapeDescription,
  getIntervalFromSemitones,
  getSemitonesBetweenPitches,
  isPitchInGuitarRange,
} from './logic';

// Config
export { intervalFlashConfig } from './config';
