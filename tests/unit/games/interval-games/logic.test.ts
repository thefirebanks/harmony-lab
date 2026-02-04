/**
 * Interval Games Logic Tests
 * Unit tests for interval training game mechanics
 */

import { describe, it, expect } from 'bun:test';
import {
  generateFlashRound,
  validateFlashAnswer,
  pitchToNoteString,
  getIntervalFretboardPositions,
  getIntervalShapeDescription,
  getIntervalFromSemitones,
  getSemitonesBetweenPitches,
  isPitchInGuitarRange,
} from '@/games/interval-games/logic';
import {
  defaultIntervalFlashSettings,
  INTERVAL_SEMITONES,
  INTERVAL_GROUPS,
} from '@/games/interval-games/types';
import type { IntervalName, IntervalFlashRound, FretboardPosition } from '@/games/interval-games/types';
import type { Pitch } from '@/lib/music/types';

describe('Interval Flash Logic', () => {
  describe('generateFlashRound', () => {
    it('should generate a valid round with default settings', () => {
      const round = generateFlashRound(defaultIntervalFlashSettings);

      expect(round).toBeDefined();
      expect(round.rootNote).toBeDefined();
      expect(round.targetNote).toBeDefined();
      expect(round.interval).toBeDefined();
      expect(round.direction).toBe('ascending'); // Default settings don't include descending
      expect(round.options).toBeArray();
      expect(round.options.length).toBe(defaultIntervalFlashSettings.optionsCount);
      expect(round.timeLimit).toBe(defaultIntervalFlashSettings.timeLimit * 1000);
    });

    it('should only use enabled intervals', () => {
      const settings = {
        ...defaultIntervalFlashSettings,
        enabledIntervals: ['P5', 'P4'] as IntervalName[],
      };

      // Generate multiple rounds to test randomness
      for (let i = 0; i < 20; i++) {
        const round = generateFlashRound(settings);
        expect(['P5', 'P4']).toContain(round.interval);
      }
    });

    it('should include correct answer in options', () => {
      const round = generateFlashRound(defaultIntervalFlashSettings);
      expect(round.options).toContain(round.interval);
    });

    it('should generate descending intervals when enabled', () => {
      const settings = {
        ...defaultIntervalFlashSettings,
        includeDescending: true,
      };

      let hasDescending = false;
      for (let i = 0; i < 50; i++) {
        const round = generateFlashRound(settings);
        if (round.direction === 'descending') {
          hasDescending = true;
          break;
        }
      }

      expect(hasDescending).toBe(true);
    });

    it('should calculate correct semitones for interval', () => {
      const round = generateFlashRound(defaultIntervalFlashSettings);
      expect(round.semitones).toBe(INTERVAL_SEMITONES[round.interval]);
    });

    it('should generate notes within guitar range', () => {
      for (let i = 0; i < 20; i++) {
        const round = generateFlashRound(defaultIntervalFlashSettings);
        expect(isPitchInGuitarRange(round.rootNote)).toBe(true);
        expect(isPitchInGuitarRange(round.targetNote)).toBe(true);
      }
    });
  });

  describe('validateFlashAnswer', () => {
    it('should return correct for matching interval', () => {
      const round: IntervalFlashRound = {
        rootNote: { note: 'C', octave: 4 },
        targetNote: { note: 'G', octave: 4 },
        interval: 'P5',
        direction: 'ascending',
        semitones: 7,
        timeLimit: 5000,
        options: ['P4', 'P5', 'M3', 'm3'],
      };

      const result = validateFlashAnswer(round, 'P5');

      expect(result.isCorrect).toBe(true);
      expect(result.feedback).toBe('Correct!');
    });

    it('should return incorrect for wrong interval', () => {
      const round: IntervalFlashRound = {
        rootNote: { note: 'C', octave: 4 },
        targetNote: { note: 'G', octave: 4 },
        interval: 'P5',
        direction: 'ascending',
        semitones: 7,
        timeLimit: 5000,
        options: ['P4', 'P5', 'M3', 'm3'],
      };

      const result = validateFlashAnswer(round, 'P4');

      expect(result.isCorrect).toBe(false);
      expect(result.correctAnswer).toBe('P5');
    });

    it('should handle timeout (null answer)', () => {
      const round: IntervalFlashRound = {
        rootNote: { note: 'C', octave: 4 },
        targetNote: { note: 'G', octave: 4 },
        interval: 'P5',
        direction: 'ascending',
        semitones: 7,
        timeLimit: 5000,
        options: ['P4', 'P5', 'M3', 'm3'],
      };

      const result = validateFlashAnswer(round, null);

      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('Time ran out');
      expect(result.correctAnswer).toBe('P5');
    });
  });

  describe('pitchToNoteString', () => {
    it('should convert pitch to Tone.js format', () => {
      expect(pitchToNoteString({ note: 'C', octave: 4 })).toBe('C4');
      expect(pitchToNoteString({ note: 'F#', octave: 3 })).toBe('F#3');
      expect(pitchToNoteString({ note: 'A#', octave: 2 })).toBe('A#2');
    });
  });

  describe('getIntervalFretboardPositions', () => {
    it('should find positions for P5 from open E string', () => {
      const rootPosition: FretboardPosition = { string: 6, fret: 0 };
      const positions = getIntervalFretboardPositions(rootPosition, 'P5', 'ascending');

      // B2 is a perfect 5th above E2
      // Should find it on various strings
      expect(positions.length).toBeGreaterThan(0);

      // Should include 7th fret on 6th string (E + 7 semitones = B)
      const hasFret7 = positions.some((p) => p.string === 6 && p.fret === 7);
      expect(hasFret7).toBe(true);

      // Should include 2nd fret on A string (A + 2 semitones = B)
      const hasA2 = positions.some((p) => p.string === 5 && p.fret === 2);
      expect(hasA2).toBe(true);
    });

    it('should find descending interval positions', () => {
      const rootPosition: FretboardPosition = { string: 1, fret: 12 };
      const positions = getIntervalFretboardPositions(rootPosition, 'P5', 'descending');

      // From E5, descending P5 is A4
      expect(positions.length).toBeGreaterThan(0);
    });
  });

  describe('getIntervalFromSemitones', () => {
    it('should map semitones to interval names', () => {
      expect(getIntervalFromSemitones(0)).toBe('unison');
      expect(getIntervalFromSemitones(1)).toBe('m2');
      expect(getIntervalFromSemitones(2)).toBe('M2');
      expect(getIntervalFromSemitones(3)).toBe('m3');
      expect(getIntervalFromSemitones(4)).toBe('M3');
      expect(getIntervalFromSemitones(5)).toBe('P4');
      expect(getIntervalFromSemitones(6)).toBe('TT');
      expect(getIntervalFromSemitones(7)).toBe('P5');
      expect(getIntervalFromSemitones(8)).toBe('m6');
      expect(getIntervalFromSemitones(9)).toBe('M6');
      expect(getIntervalFromSemitones(10)).toBe('m7');
      expect(getIntervalFromSemitones(11)).toBe('M7');
      expect(getIntervalFromSemitones(12)).toBe('octave');
    });

    it('should handle negative semitones', () => {
      expect(getIntervalFromSemitones(-7)).toBe('P5');
      expect(getIntervalFromSemitones(-5)).toBe('P4');
    });
  });

  describe('getSemitonesBetweenPitches', () => {
    it('should calculate ascending intervals', () => {
      const from: Pitch = { note: 'C', octave: 4 };
      const to: Pitch = { note: 'G', octave: 4 };
      expect(getSemitonesBetweenPitches(from, to)).toBe(7); // P5
    });

    it('should calculate descending intervals', () => {
      const from: Pitch = { note: 'G', octave: 4 };
      const to: Pitch = { note: 'C', octave: 4 };
      expect(getSemitonesBetweenPitches(from, to)).toBe(-7); // Descending P5
    });

    it('should calculate intervals across octaves', () => {
      const from: Pitch = { note: 'C', octave: 4 };
      const to: Pitch = { note: 'C', octave: 5 };
      expect(getSemitonesBetweenPitches(from, to)).toBe(12); // Octave
    });
  });

  describe('isPitchInGuitarRange', () => {
    it('should accept pitches within guitar range', () => {
      expect(isPitchInGuitarRange({ note: 'E', octave: 2 })).toBe(true); // Low E
      expect(isPitchInGuitarRange({ note: 'E', octave: 5 })).toBe(true); // High E (24th fret)
      expect(isPitchInGuitarRange({ note: 'A', octave: 3 })).toBe(true); // Middle range
    });

    it('should reject pitches outside guitar range', () => {
      expect(isPitchInGuitarRange({ note: 'C', octave: 1 })).toBe(false); // Too low
      expect(isPitchInGuitarRange({ note: 'A', octave: 6 })).toBe(false); // Too high
    });
  });

  describe('getIntervalShapeDescription', () => {
    it('should return guitar shape descriptions for all intervals', () => {
      for (const interval of INTERVAL_GROUPS.all) {
        const description = getIntervalShapeDescription(interval);
        expect(description).toBeDefined();
        expect(typeof description).toBe('string');
        expect(description.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('Interval Types', () => {
  describe('INTERVAL_SEMITONES', () => {
    it('should have correct semitone mappings', () => {
      expect(INTERVAL_SEMITONES.unison).toBe(0);
      expect(INTERVAL_SEMITONES.m2).toBe(1);
      expect(INTERVAL_SEMITONES.M2).toBe(2);
      expect(INTERVAL_SEMITONES.m3).toBe(3);
      expect(INTERVAL_SEMITONES.M3).toBe(4);
      expect(INTERVAL_SEMITONES.P4).toBe(5);
      expect(INTERVAL_SEMITONES.TT).toBe(6);
      expect(INTERVAL_SEMITONES.P5).toBe(7);
      expect(INTERVAL_SEMITONES.m6).toBe(8);
      expect(INTERVAL_SEMITONES.M6).toBe(9);
      expect(INTERVAL_SEMITONES.m7).toBe(10);
      expect(INTERVAL_SEMITONES.M7).toBe(11);
      expect(INTERVAL_SEMITONES.octave).toBe(12);
    });
  });

  describe('INTERVAL_GROUPS', () => {
    it('should have foundations containing perfect consonances', () => {
      expect(INTERVAL_GROUPS.foundations).toContain('unison');
      expect(INTERVAL_GROUPS.foundations).toContain('P5');
      expect(INTERVAL_GROUPS.foundations).toContain('P4');
      expect(INTERVAL_GROUPS.foundations).toContain('octave');
    });

    it('should have all intervals in the all group', () => {
      expect(INTERVAL_GROUPS.all.length).toBe(13);
    });
  });
});
