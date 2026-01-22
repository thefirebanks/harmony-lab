/**
 * Tests for scale generation utilities
 */

import { describe, expect, test } from 'bun:test';
import { 
  getMajorScale, 
  getMinorScale, 
  getNoteIndex, 
  getNoteAtIndex, 
  getScaleDegree,
  getInterval,
  transposeNote
} from '@/lib/music/scales';
import type { NoteName } from '@/lib/music/types';

describe('getNoteIndex', () => {
  test('returns correct index for C', () => {
    expect(getNoteIndex('C')).toBe(0);
  });

  test('returns correct index for F#', () => {
    expect(getNoteIndex('F#')).toBe(6);
  });

  test('returns correct index for B', () => {
    expect(getNoteIndex('B')).toBe(11);
  });

  test('throws for invalid note', () => {
    // @ts-expect-error Testing invalid input
    expect(() => getNoteIndex('H')).toThrow('Invalid note name');
  });
});

describe('getNoteAtIndex', () => {
  test('returns C for index 0', () => {
    expect(getNoteAtIndex(0)).toBe('C');
  });

  test('wraps around for index 12', () => {
    expect(getNoteAtIndex(12)).toBe('C');
  });

  test('handles negative index', () => {
    expect(getNoteAtIndex(-1)).toBe('B');
  });

  test('handles large negative index', () => {
    expect(getNoteAtIndex(-13)).toBe('B');
  });
});

describe('getMajorScale', () => {
  test('returns correct scale for C major', () => {
    expect(getMajorScale('C')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  test('returns correct scale for G major', () => {
    expect(getMajorScale('G')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
  });

  test('returns correct scale for F major', () => {
    expect(getMajorScale('F')).toEqual(['F', 'G', 'A', 'A#', 'C', 'D', 'E']);
  });

  test('returns correct scale for F# major', () => {
    // Note: Our system uses sharps only, so E# is represented as F (enharmonic equivalent)
    expect(getMajorScale('F#')).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'F']);
  });

  test('handles all 12 keys without error', () => {
    const notes: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    notes.forEach(note => {
      expect(() => getMajorScale(note)).not.toThrow();
      expect(getMajorScale(note)).toHaveLength(7);
    });
  });

  test('scale starts with the tonic', () => {
    const notes: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    notes.forEach(note => {
      expect(getMajorScale(note)[0]).toBe(note);
    });
  });
});

describe('getMinorScale', () => {
  test('returns correct scale for A minor', () => {
    expect(getMinorScale('A')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  });

  test('returns correct scale for E minor', () => {
    expect(getMinorScale('E')).toEqual(['E', 'F#', 'G', 'A', 'B', 'C', 'D']);
  });
});

describe('getScaleDegree', () => {
  test('returns tonic for degree 1', () => {
    expect(getScaleDegree('C', 1)).toBe('C');
  });

  test('returns 2nd degree correctly', () => {
    expect(getScaleDegree('C', 2)).toBe('D');
  });

  test('returns 5th degree correctly', () => {
    expect(getScaleDegree('G', 5)).toBe('D');
  });

  test('returns 7th degree correctly for various keys', () => {
    expect(getScaleDegree('C', 7)).toBe('B');
    expect(getScaleDegree('F', 7)).toBe('E');
  });
});

describe('getInterval', () => {
  test('returns 0 for same note', () => {
    expect(getInterval('C', 'C')).toBe(0);
  });

  test('returns correct interval for perfect fifth', () => {
    expect(getInterval('C', 'G')).toBe(7);
  });

  test('returns correct interval for tritone', () => {
    expect(getInterval('C', 'F#')).toBe(6);
  });

  test('handles descending intervals (returns ascending equivalent)', () => {
    expect(getInterval('G', 'C')).toBe(5); // Perfect fourth (inversion of fifth)
  });
});

describe('transposeNote', () => {
  test('transposes up by semitone', () => {
    expect(transposeNote('C', 1)).toBe('C#');
  });

  test('transposes up by fifth', () => {
    expect(transposeNote('C', 7)).toBe('G');
  });

  test('transposes down by semitone', () => {
    expect(transposeNote('C', -1)).toBe('B');
  });

  test('transposes by octave returns same note', () => {
    expect(transposeNote('D', 12)).toBe('D');
  });
});
