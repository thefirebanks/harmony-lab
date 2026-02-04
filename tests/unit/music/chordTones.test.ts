/**
 * Tests for chord tone utilities
 * Verifies correct chord/scale relationships for soloing
 */

import { describe, expect, test } from 'bun:test';
import {
  getChordTonesWithRoles,
  getChordTones,
  getAvoidNotes,
  categorizeNote,
  getDiatonicChordTones,
  getChordTonesOnFretboard,
  selectFocusNotes,
  getSafeLandingNotes,
  getSuggestedTarget,
} from '@/lib/music/chordTones';
import { createChord, getDiatonicChord } from '@/lib/music/chords';
import type { Chord } from '@/lib/music/types';

describe('getChordTonesWithRoles', () => {
  test('correctly identifies Cmaj7 chord tones', () => {
    const chord = createChord('C', 'maj7', 1);
    const tones = getChordTonesWithRoles(chord);
    
    expect(tones).toHaveLength(4);
    
    // Root
    expect(tones[0].note).toBe('C');
    expect(tones[0].type).toBe('root');
    expect(tones[0].label).toBe('R');
    
    // Major 3rd
    expect(tones[1].note).toBe('E');
    expect(tones[1].type).toBe('third');
    expect(tones[1].label).toBe('3');
    
    // Perfect 5th
    expect(tones[2].note).toBe('G');
    expect(tones[2].type).toBe('fifth');
    expect(tones[2].label).toBe('5');
    
    // Major 7th
    expect(tones[3].note).toBe('B');
    expect(tones[3].type).toBe('seventh');
    expect(tones[3].label).toBe('7');
  });

  test('correctly identifies Dm7 chord tones', () => {
    const chord = createChord('D', 'min7', 2);
    const tones = getChordTonesWithRoles(chord);
    
    expect(tones).toHaveLength(4);
    
    // Root
    expect(tones[0].note).toBe('D');
    expect(tones[0].type).toBe('root');
    
    // Minor 3rd
    expect(tones[1].note).toBe('F');
    expect(tones[1].type).toBe('third');
    expect(tones[1].label).toBe('b3');
    
    // Perfect 5th
    expect(tones[2].note).toBe('A');
    expect(tones[2].type).toBe('fifth');
    expect(tones[2].label).toBe('5');
    
    // Minor 7th
    expect(tones[3].note).toBe('C');
    expect(tones[3].type).toBe('seventh');
    expect(tones[3].label).toBe('b7');
  });

  test('correctly identifies G7 chord tones', () => {
    const chord = createChord('G', '7', 5);
    const tones = getChordTonesWithRoles(chord);
    
    expect(tones).toHaveLength(4);
    
    expect(tones[0].note).toBe('G');
    expect(tones[1].note).toBe('B');
    expect(tones[1].label).toBe('3'); // Major 3rd
    expect(tones[2].note).toBe('D');
    expect(tones[3].note).toBe('F');
    expect(tones[3].label).toBe('b7'); // Minor 7th (dominant)
  });

  test('correctly identifies half-diminished chord', () => {
    const chord = createChord('B', 'min7b5', 7);
    const tones = getChordTonesWithRoles(chord);
    
    expect(tones[1].label).toBe('b3'); // Minor 3rd
    expect(tones[2].label).toBe('b5'); // Diminished 5th
    expect(tones[3].label).toBe('b7'); // Minor 7th
  });
});

describe('getChordTones', () => {
  test('returns correct notes for C major chord', () => {
    const chord = createChord('C', 'maj', 1);
    const tones = getChordTones(chord);
    
    expect(tones).toEqual(['C', 'E', 'G']);
  });

  test('returns correct notes for Dm7 chord', () => {
    const chord = createChord('D', 'min7', 2);
    const tones = getChordTones(chord);
    
    expect(tones).toEqual(['D', 'F', 'A', 'C']);
  });
});

describe('getAvoidNotes', () => {
  test('F is an avoid note over Cmaj7 in C major', () => {
    const chord = createChord('C', 'maj7', 1);
    const avoidNotes = getAvoidNotes(chord, 'C', 'major');
    
    // F is a half step above E (the 3rd of Cmaj7)
    expect(avoidNotes).toContain('F');
  });

  test('C is an avoid note over G7 in C major', () => {
    const chord = createChord('G', '7', 5);
    const avoidNotes = getAvoidNotes(chord, 'C', 'major');
    
    // C is a half step above B (the 3rd of G7)
    expect(avoidNotes).toContain('C');
  });

  test('no avoid notes over Dm7 in C major (typical)', () => {
    const chord = createChord('D', 'min7', 2);
    const avoidNotes = getAvoidNotes(chord, 'C', 'major');
    
    // Dm7 is usually considered "neutral" - no strong avoid notes in traditional theory
    // The 6th (B) can be debated but is often fine
    // Our algorithm checks for half-step above chord tones
    
    // B is not a half step above any chord tone in Dm7 (D, F, A, C)
    // E is a half step above D# but D# isn't in C major scale
    // Let's check if any are marked avoid
    expect(avoidNotes.length).toBe(0);
  });
});

describe('categorizeNote', () => {
  test('correctly categorizes notes over Cmaj7', () => {
    const chord = createChord('C', 'maj7', 1);
    
    // Chord tones
    expect(categorizeNote('C', chord, 'C', 'major')).toBe('chord-tone');
    expect(categorizeNote('E', chord, 'C', 'major')).toBe('chord-tone');
    expect(categorizeNote('G', chord, 'C', 'major')).toBe('chord-tone');
    expect(categorizeNote('B', chord, 'C', 'major')).toBe('chord-tone');
    
    // Avoid tone
    expect(categorizeNote('F', chord, 'C', 'major')).toBe('avoid-tone');
    
    // Scale tones (not avoid)
    expect(categorizeNote('D', chord, 'C', 'major')).toBe('scale-tone');
    expect(categorizeNote('A', chord, 'C', 'major')).toBe('scale-tone');
    
    // Outside notes
    expect(categorizeNote('C#', chord, 'C', 'major')).toBe('outside');
    expect(categorizeNote('F#', chord, 'C', 'major')).toBe('outside');
  });

  test('correctly categorizes notes in G major', () => {
    const chord = getDiatonicChord('G', 1); // Gmaj7
    
    expect(categorizeNote('G', chord, 'G', 'major')).toBe('chord-tone');
    expect(categorizeNote('B', chord, 'G', 'major')).toBe('chord-tone');
    expect(categorizeNote('D', chord, 'G', 'major')).toBe('chord-tone');
    expect(categorizeNote('F#', chord, 'G', 'major')).toBe('chord-tone');
    
    // C is a half step above B (the 3rd)
    expect(categorizeNote('C', chord, 'G', 'major')).toBe('avoid-tone');
  });
});

describe('getDiatonicChordTones', () => {
  test('returns correct tones for ii chord in C major', () => {
    const tones = getDiatonicChordTones('C', 2);
    
    // Dm7 = D, F, A, C
    expect(tones).toEqual(['D', 'F', 'A', 'C']);
  });

  test('returns correct tones for V chord in C major', () => {
    const tones = getDiatonicChordTones('C', 5);
    
    // G7 = G, B, D, F
    expect(tones).toEqual(['G', 'B', 'D', 'F']);
  });

  test('returns correct tones for I chord in G major', () => {
    const tones = getDiatonicChordTones('G', 1);
    
    // Gmaj7 = G, B, D, F#
    expect(tones).toEqual(['G', 'B', 'D', 'F#']);
  });
});

describe('getChordTonesOnFretboard', () => {
  test('returns fretboard positions for Cmaj7', () => {
    const chord = createChord('C', 'maj7', 1);
    const positions = getChordTonesOnFretboard(chord, 0, 5);
    
    // Should have positions for C, E, G, B in frets 0-5
    expect(positions.length).toBeGreaterThan(0);
    
    // All should be chord tones
    positions.forEach(pos => {
      expect(pos.isChordTone).toBe(true);
      expect(['C', 'E', 'G', 'B']).toContain(pos.note);
    });
    
    // Should have some roots
    const roots = positions.filter(p => p.isRoot);
    expect(roots.length).toBeGreaterThan(0);
    roots.forEach(r => expect(r.note).toBe('C'));
  });
});

describe('selectFocusNotes', () => {
  test('returns requested number of notes', () => {
    const mockNotes = [
      { string: 6 as const, fret: 0, note: 'E' as const, octave: 2, isChordTone: true },
      { string: 6 as const, fret: 3, note: 'G' as const, octave: 2, isChordTone: true },
      { string: 5 as const, fret: 0, note: 'A' as const, octave: 2, isChordTone: false },
      { string: 5 as const, fret: 2, note: 'B' as const, octave: 2, isChordTone: false },
      { string: 5 as const, fret: 3, note: 'C' as const, octave: 3, isChordTone: true },
      { string: 4 as const, fret: 0, note: 'D' as const, octave: 3, isChordTone: false },
    ];
    
    const selected = selectFocusNotes(mockNotes, 3, false);
    
    // Should return notes with 3 unique note names
    const uniqueNames = new Set(selected.map(n => n.note));
    expect(uniqueNames.size).toBe(3);
  });

  test('prefers chord tones when specified', () => {
    const mockNotes = [
      { string: 6 as const, fret: 0, note: 'E' as const, octave: 2, isChordTone: true },
      { string: 6 as const, fret: 3, note: 'G' as const, octave: 2, isChordTone: true },
      { string: 5 as const, fret: 0, note: 'A' as const, octave: 2, isChordTone: false },
      { string: 5 as const, fret: 2, note: 'B' as const, octave: 2, isChordTone: false },
      { string: 5 as const, fret: 3, note: 'C' as const, octave: 3, isChordTone: true },
      { string: 4 as const, fret: 0, note: 'D' as const, octave: 3, isChordTone: false },
    ];
    
    // Run multiple times to check tendency
    let chordToneCount = 0;
    for (let i = 0; i < 10; i++) {
      const selected = selectFocusNotes(mockNotes, 3, true);
      const selectedWithChordTones = selected.filter(n => n.isChordTone);
      chordToneCount += selectedWithChordTones.length;
    }
    
    // On average, should have more chord tones than not
    expect(chordToneCount / 10).toBeGreaterThan(1);
  });
});

describe('getSafeLandingNotes', () => {
  test('finds common tones between ii and V', () => {
    const ii = createChord('D', 'min7', 2); // D, F, A, C
    const V = createChord('G', '7', 5);     // G, B, D, F
    
    const safeLanding = getSafeLandingNotes(ii, V);
    
    // D and F are common to both
    expect(safeLanding).toContain('D');
    expect(safeLanding).toContain('F');
    expect(safeLanding).toHaveLength(2);
  });

  test('returns target chord tones when no common tones', () => {
    // Contrived example - create chords with no common tones
    const chordA = createChord('C', 'maj', 1); // C, E, G
    const chordB = createChord('F#', 'min', 3); // F#, A, C#
    
    const safeLanding = getSafeLandingNotes(chordA, chordB);
    
    // No common tones, should return F#m chord tones
    expect(safeLanding).toEqual(['F#', 'A', 'C#']);
  });
});

describe('getSuggestedTarget', () => {
  test('suggests closest chord tone', () => {
    const V = createChord('G', '7', 5); // G, B, D, F
    
    // Starting from A, closest chord tone should be G or B
    const target = getSuggestedTarget('A', V);
    expect(['G', 'B']).toContain(target);
  });

  test('suggests root when starting on root of previous chord', () => {
    const I = createChord('C', 'maj7', 1); // C, E, G, B
    
    // Starting from G (the V), suggest closest tone in I
    const target = getSuggestedTarget('G', I);
    
    // G is a chord tone of Cmaj7, so it should suggest G
    expect(target).toBe('G');
  });

  test('handles voice leading across larger intervals', () => {
    const ii = createChord('D', 'min7', 2); // D, F, A, C
    
    // Starting from B, closest should be C or A
    const target = getSuggestedTarget('B', ii);
    expect(['C', 'A']).toContain(target);
  });
});

describe('integration: ii-V-I in C major', () => {
  test('all chord tones are in C major scale', () => {
    const cMajorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    // ii = Dm7
    const ii = getDiatonicChordTones('C', 2);
    ii.forEach(note => expect(cMajorScale).toContain(note));
    
    // V = G7
    const V = getDiatonicChordTones('C', 5);
    V.forEach(note => expect(cMajorScale).toContain(note));
    
    // I = Cmaj7
    const I = getDiatonicChordTones('C', 1);
    I.forEach(note => expect(cMajorScale).toContain(note));
  });
});
