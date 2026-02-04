/**
 * Tests for fretboard math utilities
 * Verifies correct mapping between notes, frets, and music theory
 */

import { describe, expect, test } from 'bun:test';
import {
  getNoteAtPosition,
  getNoteFretboardPositions,
  getScaleOnFretboard,
  getScaleDegreeOfNote,
  isNoteInScale,
  getFretForNoteOnString,
  getScalePositionNotes,
  CAGED_MAJOR_POSITIONS,
  THREE_NPS_MAJOR_POSITIONS,
  filterNotesToFretRange,
  sortFretboardNotes,
  getUniquePitches,
  type ScalePosition,
} from '@/lib/music/fretboard';

describe('getNoteAtPosition', () => {
  test('returns open string notes correctly (standard tuning)', () => {
    // Standard tuning: E2, A2, D3, G3, B3, E4
    expect(getNoteAtPosition(6, 0)).toEqual({ note: 'E', octave: 2 });
    expect(getNoteAtPosition(5, 0)).toEqual({ note: 'A', octave: 2 });
    expect(getNoteAtPosition(4, 0)).toEqual({ note: 'D', octave: 3 });
    expect(getNoteAtPosition(3, 0)).toEqual({ note: 'G', octave: 3 });
    expect(getNoteAtPosition(2, 0)).toEqual({ note: 'B', octave: 3 });
    expect(getNoteAtPosition(1, 0)).toEqual({ note: 'E', octave: 4 });
  });

  test('returns correct note at 12th fret (octave)', () => {
    // 12th fret should be one octave above open string
    expect(getNoteAtPosition(6, 12)).toEqual({ note: 'E', octave: 3 });
    expect(getNoteAtPosition(5, 12)).toEqual({ note: 'A', octave: 3 });
    expect(getNoteAtPosition(4, 12)).toEqual({ note: 'D', octave: 4 });
    expect(getNoteAtPosition(3, 12)).toEqual({ note: 'G', octave: 4 });
    expect(getNoteAtPosition(2, 12)).toEqual({ note: 'B', octave: 4 });
    expect(getNoteAtPosition(1, 12)).toEqual({ note: 'E', octave: 5 });
  });

  test('returns correct common fretted notes', () => {
    // 3rd fret low E string = G
    expect(getNoteAtPosition(6, 3)).toEqual({ note: 'G', octave: 2 });
    // 5th fret A string = D
    expect(getNoteAtPosition(5, 5)).toEqual({ note: 'D', octave: 3 });
    // 2nd fret A string = B
    expect(getNoteAtPosition(5, 2)).toEqual({ note: 'B', octave: 2 });
    // 3rd fret B string = D
    expect(getNoteAtPosition(2, 3)).toEqual({ note: 'D', octave: 4 });
    // 1st fret high E string = F
    expect(getNoteAtPosition(1, 1)).toEqual({ note: 'F', octave: 4 });
  });

  test('handles high fret positions correctly', () => {
    // 24th fret high E = E6
    expect(getNoteAtPosition(1, 24)).toEqual({ note: 'E', octave: 6 });
    // 24th fret low E = E4
    expect(getNoteAtPosition(6, 24)).toEqual({ note: 'E', octave: 4 });
  });
});

describe('getNoteFretboardPositions', () => {
  test('finds all E positions on fretboard (within first 12 frets)', () => {
    const ePositions = getNoteFretboardPositions('E', 0, 12);
    
    // There should be E on open strings 6, 1 and frets
    // String 6: fret 0, 12
    // String 5: fret 7
    // String 4: fret 2
    // String 3: fret 9
    // String 2: fret 5
    // String 1: fret 0, 12
    
    // Verify we find at least these positions
    const hasOpenLowE = ePositions.some(p => p.string === 6 && p.fret === 0);
    const hasOpenHighE = ePositions.some(p => p.string === 1 && p.fret === 0);
    const has12thFretLowE = ePositions.some(p => p.string === 6 && p.fret === 12);
    
    expect(hasOpenLowE).toBe(true);
    expect(hasOpenHighE).toBe(true);
    expect(has12thFretLowE).toBe(true);
    
    // All positions should have note 'E'
    ePositions.forEach(pos => {
      expect(pos.note).toBe('E');
    });
  });

  test('finds C positions correctly (not on open strings)', () => {
    const cPositions = getNoteFretboardPositions('C', 0, 5);
    
    // Expected C positions within first 5 frets:
    // String 5: fret 3
    // String 4: fret 0 is D, fret 1 is D#, no C
    // String 3: fret 5
    // String 2: fret 1
    // String 1: fret 0 is E, no C in 0-5 range
    
    const hasC_A_String = cPositions.some(p => p.string === 5 && p.fret === 3);
    const hasC_B_String = cPositions.some(p => p.string === 2 && p.fret === 1);
    
    expect(hasC_A_String).toBe(true);
    expect(hasC_B_String).toBe(true);
    
    // All positions should have note 'C'
    cPositions.forEach(pos => {
      expect(pos.note).toBe('C');
    });
  });

  test('respects minFret parameter', () => {
    const positions = getNoteFretboardPositions('E', 5, 12);
    
    // No positions should have fret < 5
    positions.forEach(pos => {
      expect(pos.fret).toBeGreaterThanOrEqual(5);
    });
  });
});

describe('getScaleOnFretboard', () => {
  test('returns all 7 unique scale degrees for C major', () => {
    const scaleNotes = getScaleOnFretboard('C', 'major', 0, 12);
    
    // Get unique scale degrees
    const uniqueDegrees = new Set(scaleNotes.map(n => n.scaleDegree));
    expect(uniqueDegrees.size).toBe(7);
    
    // Verify all degrees 1-7 are present
    for (let i = 1; i <= 7; i++) {
      expect(uniqueDegrees.has(i as any)).toBe(true);
    }
  });

  test('marks root notes correctly', () => {
    const scaleNotes = getScaleOnFretboard('G', 'major', 0, 5);
    
    // All notes with isRoot=true should be G
    const rootNotes = scaleNotes.filter(n => n.isRoot);
    rootNotes.forEach(n => {
      expect(n.note).toBe('G');
      expect(n.scaleDegree).toBe(1);
    });
  });

  test('assigns correct scale degrees for D major', () => {
    const scaleNotes = getScaleOnFretboard('D', 'major', 0, 5);
    
    // D major scale: D, E, F#, G, A, B, C#
    // Find notes and check their degrees
    const dNotes = scaleNotes.filter(n => n.note === 'D');
    const eNotes = scaleNotes.filter(n => n.note === 'E');
    const fSharpNotes = scaleNotes.filter(n => n.note === 'F#');
    const gNotes = scaleNotes.filter(n => n.note === 'G');
    const aNotes = scaleNotes.filter(n => n.note === 'A');
    
    dNotes.forEach(n => expect(n.scaleDegree).toBe(1));
    eNotes.forEach(n => expect(n.scaleDegree).toBe(2));
    fSharpNotes.forEach(n => expect(n.scaleDegree).toBe(3));
    gNotes.forEach(n => expect(n.scaleDegree).toBe(4));
    aNotes.forEach(n => expect(n.scaleDegree).toBe(5));
  });

  test('works with minor scale', () => {
    const scaleNotes = getScaleOnFretboard('A', 'minor', 0, 5);
    
    // A minor scale: A, B, C, D, E, F, G
    const cNotes = scaleNotes.filter(n => n.note === 'C');
    const fNotes = scaleNotes.filter(n => n.note === 'F');
    const gNotes = scaleNotes.filter(n => n.note === 'G');
    
    // In A minor, C should be degree 3 (minor 3rd)
    cNotes.forEach(n => expect(n.scaleDegree).toBe(3));
    // F should be degree 6 (minor 6th)
    fNotes.forEach(n => expect(n.scaleDegree).toBe(6));
    // G should be degree 7 (minor 7th)
    gNotes.forEach(n => expect(n.scaleDegree).toBe(7));
  });
});

describe('getScaleDegreeOfNote', () => {
  test('returns correct degrees for C major scale', () => {
    // C major: C, D, E, F, G, A, B
    expect(getScaleDegreeOfNote('C', 'C', 'major')).toBe(1);
    expect(getScaleDegreeOfNote('D', 'C', 'major')).toBe(2);
    expect(getScaleDegreeOfNote('E', 'C', 'major')).toBe(3);
    expect(getScaleDegreeOfNote('F', 'C', 'major')).toBe(4);
    expect(getScaleDegreeOfNote('G', 'C', 'major')).toBe(5);
    expect(getScaleDegreeOfNote('A', 'C', 'major')).toBe(6);
    expect(getScaleDegreeOfNote('B', 'C', 'major')).toBe(7);
  });

  test('returns null for notes not in scale', () => {
    // C# is not in C major
    expect(getScaleDegreeOfNote('C#', 'C', 'major')).toBe(null);
    // D# is not in C major
    expect(getScaleDegreeOfNote('D#', 'C', 'major')).toBe(null);
    // F# is not in C major
    expect(getScaleDegreeOfNote('F#', 'C', 'major')).toBe(null);
  });

  test('works with G major (has F#)', () => {
    // G major: G, A, B, C, D, E, F#
    expect(getScaleDegreeOfNote('F#', 'G', 'major')).toBe(7);
    expect(getScaleDegreeOfNote('F', 'G', 'major')).toBe(null);
  });

  test('works with minor scales', () => {
    // A minor: A, B, C, D, E, F, G
    expect(getScaleDegreeOfNote('C', 'A', 'minor')).toBe(3);
    expect(getScaleDegreeOfNote('C#', 'A', 'minor')).toBe(null);
  });
});

describe('isNoteInScale', () => {
  test('returns true for notes in C major', () => {
    expect(isNoteInScale('C', 'C', 'major')).toBe(true);
    expect(isNoteInScale('G', 'C', 'major')).toBe(true);
    expect(isNoteInScale('B', 'C', 'major')).toBe(true);
  });

  test('returns false for notes not in C major', () => {
    expect(isNoteInScale('C#', 'C', 'major')).toBe(false);
    expect(isNoteInScale('F#', 'C', 'major')).toBe(false);
  });
});

describe('getFretForNoteOnString', () => {
  test('returns correct fret for open strings', () => {
    // E on string 6 should be fret 0
    expect(getFretForNoteOnString('E', 6, 0, 12)).toBe(0);
    // A on string 5 should be fret 0
    expect(getFretForNoteOnString('A', 5, 0, 12)).toBe(0);
  });

  test('returns correct fret for common notes', () => {
    // G on string 6 is fret 3
    expect(getFretForNoteOnString('G', 6, 0, 12)).toBe(3);
    // C on string 5 is fret 3
    expect(getFretForNoteOnString('C', 5, 0, 12)).toBe(3);
    // D on string 5 is fret 5
    expect(getFretForNoteOnString('D', 5, 0, 12)).toBe(5);
  });

  test('respects minFret parameter', () => {
    // E on string 6, starting from fret 5
    // Should return 12 (the octave E)
    expect(getFretForNoteOnString('E', 6, 5, 12)).toBe(12);
  });

  test('returns null if note is not in range', () => {
    // Looking for E on string 6, but only in frets 13-15 (no E there)
    expect(getFretForNoteOnString('E', 6, 13, 15)).toBe(null);
  });
});

describe('CAGED positions structure', () => {
  test('has all 5 CAGED shapes', () => {
    expect(Object.keys(CAGED_MAJOR_POSITIONS)).toContain('E');
    expect(Object.keys(CAGED_MAJOR_POSITIONS)).toContain('D');
    expect(Object.keys(CAGED_MAJOR_POSITIONS)).toContain('C');
    expect(Object.keys(CAGED_MAJOR_POSITIONS)).toContain('A');
    expect(Object.keys(CAGED_MAJOR_POSITIONS)).toContain('G');
  });

  test('each position has valid structure', () => {
    (Object.values(CAGED_MAJOR_POSITIONS) as ScalePosition[]).forEach(position => {
      expect(position.system).toBe('caged');
      expect(position.name).toBeDefined();
      expect([1, 2, 3, 4, 5, 6]).toContain(position.rootString);
      expect(position.pattern).toBeDefined();
      expect(position.pattern.string1).toBeDefined();
      expect(position.pattern.string6).toBeDefined();
    });
  });
});

describe('3NPS positions structure', () => {
  test('has all 7 positions', () => {
    expect(Object.keys(THREE_NPS_MAJOR_POSITIONS)).toHaveLength(7);
    for (let i = 1; i <= 7; i++) {
      expect(Object.keys(THREE_NPS_MAJOR_POSITIONS)).toContain(String(i));
    }
  });

  test('each position has 3 notes per string', () => {
    (Object.values(THREE_NPS_MAJOR_POSITIONS) as ScalePosition[]).forEach(position => {
      expect(position.pattern.string1).toHaveLength(3);
      expect(position.pattern.string2).toHaveLength(3);
      expect(position.pattern.string3).toHaveLength(3);
      expect(position.pattern.string4).toHaveLength(3);
      expect(position.pattern.string5).toHaveLength(3);
      expect(position.pattern.string6).toHaveLength(3);
    });
  });
});

describe('getScalePositionNotes', () => {
  test('returns notes for E shape in C major', () => {
    const notes = getScalePositionNotes(CAGED_MAJOR_POSITIONS.E, 'C', 'major');
    
    // Should return multiple notes
    expect(notes.length).toBeGreaterThan(0);
    
    // All notes should be in C major scale
    const cMajorNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    notes.forEach(n => {
      expect(cMajorNotes).toContain(n.note);
    });
    
    // Should have some root notes (C)
    const rootNotes = notes.filter(n => n.isRoot);
    expect(rootNotes.length).toBeGreaterThan(0);
    rootNotes.forEach(n => {
      expect(n.note).toBe('C');
    });
  });

  test('returns notes for G major E shape', () => {
    const notes = getScalePositionNotes(CAGED_MAJOR_POSITIONS.E, 'G', 'major');
    
    // G major scale: G, A, B, C, D, E, F#
    const gMajorNotes = ['G', 'A', 'B', 'C', 'D', 'E', 'F#'];
    notes.forEach(n => {
      expect(gMajorNotes).toContain(n.note);
    });
    
    // Root notes should be G
    const rootNotes = notes.filter(n => n.isRoot);
    rootNotes.forEach(n => {
      expect(n.note).toBe('G');
    });
  });
});

describe('utility functions', () => {
  test('filterNotesToFretRange filters correctly', () => {
    const notes = [
      { string: 6 as const, fret: 0, note: 'E' as const, octave: 2 },
      { string: 6 as const, fret: 5, note: 'A' as const, octave: 2 },
      { string: 6 as const, fret: 10, note: 'D' as const, octave: 3 },
    ];
    
    const filtered = filterNotesToFretRange(notes, 3, 8);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].fret).toBe(5);
  });

  test('sortFretboardNotes sorts by string then fret', () => {
    const notes = [
      { string: 1 as const, fret: 5, note: 'A' as const, octave: 4 },
      { string: 6 as const, fret: 3, note: 'G' as const, octave: 2 },
      { string: 6 as const, fret: 0, note: 'E' as const, octave: 2 },
      { string: 3 as const, fret: 2, note: 'A' as const, octave: 3 },
    ];
    
    const sorted = sortFretboardNotes(notes);
    
    // First should be string 6 (lowest)
    expect(sorted[0].string).toBe(6);
    expect(sorted[0].fret).toBe(0);
    
    // Second should be string 6, fret 3
    expect(sorted[1].string).toBe(6);
    expect(sorted[1].fret).toBe(3);
    
    // Last should be string 1 (highest)
    expect(sorted[sorted.length - 1].string).toBe(1);
  });

  test('getUniquePitches removes duplicates', () => {
    const notes = [
      { string: 6 as const, fret: 0, note: 'E' as const, octave: 2 },
      { string: 4 as const, fret: 2, note: 'E' as const, octave: 3 },
      { string: 5 as const, fret: 7, note: 'E' as const, octave: 3 }, // Same pitch as above
      { string: 1 as const, fret: 0, note: 'E' as const, octave: 4 },
    ];
    
    const unique = getUniquePitches(notes);
    
    // Should have 3 unique pitches: E2, E3, E4
    expect(unique).toHaveLength(3);
    
    const pitches = unique.map(n => `${n.note}${n.octave}`);
    expect(pitches).toContain('E2');
    expect(pitches).toContain('E3');
    expect(pitches).toContain('E4');
  });
});

describe('cross-validation: fretboard matches music theory', () => {
  test('5th fret rule: same note as next higher open string', () => {
    // A well-known guitar fact: 5th fret of strings 6,5,4,3 = next open string
    // Exception: 4th fret of string 3 = open string 2 (due to B tuning)
    
    // 5th fret string 6 (E) = open string 5 (A)
    expect(getNoteAtPosition(6, 5).note).toBe(getNoteAtPosition(5, 0).note);
    // 5th fret string 5 (A) = open string 4 (D)
    expect(getNoteAtPosition(5, 5).note).toBe(getNoteAtPosition(4, 0).note);
    // 5th fret string 4 (D) = open string 3 (G)
    expect(getNoteAtPosition(4, 5).note).toBe(getNoteAtPosition(3, 0).note);
    // 4th fret string 3 (G) = open string 2 (B)
    expect(getNoteAtPosition(3, 4).note).toBe(getNoteAtPosition(2, 0).note);
    // 5th fret string 2 (B) = open string 1 (E)
    expect(getNoteAtPosition(2, 5).note).toBe(getNoteAtPosition(1, 0).note);
  });

  test('octave shapes: same note, different octave', () => {
    // 12th fret = same note, 1 octave higher
    for (let str = 1; str <= 6; str++) {
      const s = str as 1 | 2 | 3 | 4 | 5 | 6;
      const open = getNoteAtPosition(s, 0);
      const twelfth = getNoteAtPosition(s, 12);
      
      expect(twelfth.note).toBe(open.note);
      expect(twelfth.octave).toBe(open.octave + 1);
    }
  });

  test('C major chord positions are correct', () => {
    // Standard open C chord:
    // String 5, fret 3 = C
    // String 4, fret 2 = E
    // String 3, fret 0 = G
    // String 2, fret 1 = C
    // String 1, fret 0 = E
    
    expect(getNoteAtPosition(5, 3).note).toBe('C');
    expect(getNoteAtPosition(4, 2).note).toBe('E');
    expect(getNoteAtPosition(3, 0).note).toBe('G');
    expect(getNoteAtPosition(2, 1).note).toBe('C');
    expect(getNoteAtPosition(1, 0).note).toBe('E');
  });

  test('G major chord positions are correct', () => {
    // Standard open G chord:
    // String 6, fret 3 = G
    // String 5, fret 2 = B
    // String 4, fret 0 = D
    // String 3, fret 0 = G
    // String 2, fret 0 = B
    // String 1, fret 3 = G
    
    expect(getNoteAtPosition(6, 3).note).toBe('G');
    expect(getNoteAtPosition(5, 2).note).toBe('B');
    expect(getNoteAtPosition(4, 0).note).toBe('D');
    expect(getNoteAtPosition(3, 0).note).toBe('G');
    expect(getNoteAtPosition(2, 0).note).toBe('B');
    expect(getNoteAtPosition(1, 3).note).toBe('G');
  });

  test('barre chord E shape at 5th fret = A major', () => {
    // E shape barre at 5th fret gives A major:
    // String 6, fret 5 = A (root)
    // String 5, fret 7 = E (5th)
    // String 4, fret 7 = A (root)
    // String 3, fret 6 = C# (3rd)
    // String 2, fret 5 = E (5th)
    // String 1, fret 5 = A (root)
    
    expect(getNoteAtPosition(6, 5).note).toBe('A');
    expect(getNoteAtPosition(5, 7).note).toBe('E');
    expect(getNoteAtPosition(4, 7).note).toBe('A');
    expect(getNoteAtPosition(3, 6).note).toBe('C#');
    expect(getNoteAtPosition(2, 5).note).toBe('E');
    expect(getNoteAtPosition(1, 5).note).toBe('A');
  });
});
