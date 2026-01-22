/**
 * Tests for chord construction utilities
 */

import { describe, expect, test } from 'bun:test';
import {
  getChordNotes,
  createChord,
  getDiatonicChord,
  getAllDiatonicChords,
  getChordDisplayName,
  chordsAreEqual,
  noteToMidi,
  midiToPitch,
  pitchToString,
} from '@/lib/music/chords';
import type { Chord } from '@/lib/music/types';

describe('getChordNotes', () => {
  test('returns correct notes for C major 7', () => {
    expect(getChordNotes('C', 'maj7')).toEqual(['C', 'E', 'G', 'B']);
  });

  test('returns correct notes for D minor 7', () => {
    expect(getChordNotes('D', 'min7')).toEqual(['D', 'F', 'A', 'C']);
  });

  test('returns correct notes for G dominant 7', () => {
    expect(getChordNotes('G', '7')).toEqual(['G', 'B', 'D', 'F']);
  });

  test('returns correct notes for B half-diminished', () => {
    expect(getChordNotes('B', 'min7b5')).toEqual(['B', 'D', 'F', 'A']);
  });

  test('returns correct notes for F# minor 7', () => {
    expect(getChordNotes('F#', 'min7')).toEqual(['F#', 'A', 'C#', 'E']);
  });
});

describe('createChord', () => {
  test('creates chord with correct properties', () => {
    const chord = createChord('C', 'maj7', 1);
    expect(chord.root).toBe('C');
    expect(chord.quality).toBe('maj7');
    expect(chord.degree).toBe(1);
  });
});

describe('getDiatonicChord', () => {
  test('returns I chord correctly', () => {
    const chord = getDiatonicChord('C', 1);
    expect(chord.root).toBe('C');
    expect(chord.quality).toBe('maj7');
    expect(chord.degree).toBe(1);
  });

  test('returns ii chord correctly', () => {
    const chord = getDiatonicChord('C', 2);
    expect(chord.root).toBe('D');
    expect(chord.quality).toBe('min7');
    expect(chord.degree).toBe(2);
  });

  test('returns V chord correctly', () => {
    const chord = getDiatonicChord('C', 5);
    expect(chord.root).toBe('G');
    expect(chord.quality).toBe('7');
    expect(chord.degree).toBe(5);
  });

  test('returns vii chord correctly', () => {
    const chord = getDiatonicChord('C', 7);
    expect(chord.root).toBe('B');
    expect(chord.quality).toBe('min7b5');
    expect(chord.degree).toBe(7);
  });

  test('returns correct ii chord for G major', () => {
    const chord = getDiatonicChord('G', 2);
    expect(chord.root).toBe('A');
    expect(chord.quality).toBe('min7');
  });
});

describe('getAllDiatonicChords', () => {
  test('returns 7 chords', () => {
    const chords = getAllDiatonicChords('C');
    expect(chords).toHaveLength(7);
  });

  test('returns chords in correct order', () => {
    const chords = getAllDiatonicChords('C');
    expect(chords[0].degree).toBe(1);
    expect(chords[1].degree).toBe(2);
    expect(chords[6].degree).toBe(7);
  });

  test('chords have correct qualities for major key', () => {
    const chords = getAllDiatonicChords('C');
    expect(chords[0].quality).toBe('maj7'); // I
    expect(chords[1].quality).toBe('min7'); // ii
    expect(chords[2].quality).toBe('min7'); // iii
    expect(chords[3].quality).toBe('maj7'); // IV
    expect(chords[4].quality).toBe('7');    // V
    expect(chords[5].quality).toBe('min7'); // vi
    expect(chords[6].quality).toBe('min7b5'); // vii
  });
});

describe('getChordDisplayName', () => {
  test('displays major 7 chord correctly', () => {
    const chord = createChord('C', 'maj7', 1);
    expect(getChordDisplayName(chord)).toBe('Cmaj7');
  });

  test('displays minor 7 chord correctly', () => {
    const chord = createChord('D', 'min7', 2);
    expect(getChordDisplayName(chord)).toBe('Dm7');
  });

  test('displays dominant 7 chord correctly', () => {
    const chord = createChord('G', '7', 5);
    expect(getChordDisplayName(chord)).toBe('G7');
  });

  test('displays half-diminished chord correctly', () => {
    const chord = createChord('B', 'min7b5', 7);
    expect(getChordDisplayName(chord)).toBe('Bm7b5');
  });

  test('displays sharp root correctly', () => {
    const chord = createChord('F#', 'min7', 2);
    expect(getChordDisplayName(chord)).toBe('F#m7');
  });
});

describe('chordsAreEqual', () => {
  test('returns true for identical chords', () => {
    const a = createChord('C', 'maj7', 1);
    const b = createChord('C', 'maj7', 4); // Different degree but same root/quality
    expect(chordsAreEqual(a, b)).toBe(true);
  });

  test('returns false for different roots', () => {
    const a = createChord('C', 'maj7', 1);
    const b = createChord('D', 'maj7', 1);
    expect(chordsAreEqual(a, b)).toBe(false);
  });

  test('returns false for different qualities', () => {
    const a = createChord('C', 'maj7', 1);
    const b = createChord('C', 'min7', 1);
    expect(chordsAreEqual(a, b)).toBe(false);
  });
});

describe('noteToMidi', () => {
  test('returns 60 for middle C (C4)', () => {
    expect(noteToMidi('C', 4)).toBe(60);
  });

  test('returns 69 for A4 (concert A)', () => {
    expect(noteToMidi('A', 4)).toBe(69);
  });

  test('returns 36 for C2', () => {
    expect(noteToMidi('C', 2)).toBe(36);
  });
});

describe('midiToPitch', () => {
  test('returns C4 for MIDI 60', () => {
    const pitch = midiToPitch(60);
    expect(pitch.note).toBe('C');
    expect(pitch.octave).toBe(4);
  });

  test('returns A4 for MIDI 69', () => {
    const pitch = midiToPitch(69);
    expect(pitch.note).toBe('A');
    expect(pitch.octave).toBe(4);
  });
});

describe('pitchToString', () => {
  test('returns correct string for C4', () => {
    expect(pitchToString({ note: 'C', octave: 4 })).toBe('C4');
  });

  test('returns correct string for F#3', () => {
    expect(pitchToString({ note: 'F#', octave: 3 })).toBe('F#3');
  });
});
