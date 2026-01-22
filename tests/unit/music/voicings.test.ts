/**
 * Tests for voicing algorithms
 */

import { describe, expect, test } from 'bun:test';
import {
  getVoicing,
  getSimpleVoicing,
  getVoicingWithBass,
  getSimpleVoicingWithBass,
  voicingToNoteStrings,
  isVoicingInRange,
  getLowestPitch,
  getHighestPitch,
} from '@/lib/music/voicings';
import { createChord, noteToMidi } from '@/lib/music/chords';
import type { Chord, Voicing } from '@/lib/music/types';

describe('getVoicing', () => {
  test('returns voicing with correct chord reference', () => {
    const chord = createChord('C', 'maj7', 1);
    const voicing = getVoicing(chord);
    
    expect(voicing.chord).toBe(chord);
  });

  test('returns 4 pitches for 7th chord', () => {
    const chord = createChord('C', 'maj7', 1);
    const voicing = getVoicing(chord);
    
    expect(voicing.pitches).toHaveLength(4);
  });

  test('pitches are in reasonable range', () => {
    const chord = createChord('C', 'maj7', 1);
    const voicing = getVoicing(chord);
    
    expect(isVoicingInRange(voicing)).toBe(true);
  });

  test('works for all chord qualities', () => {
    const qualities = ['maj7', 'min7', '7', 'min7b5', 'dim7', 'maj', 'min'] as const;
    
    qualities.forEach(quality => {
      const chord = createChord('C', quality, 1);
      const voicing = getVoicing(chord);
      expect(voicing.pitches.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe('getSimpleVoicing', () => {
  test('returns voicing starting from specified octave', () => {
    const chord = createChord('C', 'maj7', 1);
    const voicing = getSimpleVoicing(chord, 4);
    
    // First note should be in octave 4
    expect(voicing.pitches[0].octave).toBe(4);
  });

  test('includes root in the voicing', () => {
    const chord = createChord('C', 'maj7', 1);
    const voicing = getSimpleVoicing(chord);
    
    // First pitch should be the root
    expect(voicing.pitches[0].note).toBe('C');
  });
});

describe('getVoicingWithBass', () => {
  test('adds bass note in octave 2', () => {
    const chord = createChord('D', 'min7', 2);
    const voicing = getVoicingWithBass(chord);
    
    // First pitch should be bass in octave 2
    expect(voicing.pitches[0].note).toBe('D');
    expect(voicing.pitches[0].octave).toBe(2);
  });

  test('has more pitches than regular voicing', () => {
    const chord = createChord('G', '7', 5);
    const regularVoicing = getVoicing(chord);
    const voicingWithBass = getVoicingWithBass(chord);
    
    expect(voicingWithBass.pitches.length).toBe(regularVoicing.pitches.length + 1);
  });
});

describe('getSimpleVoicingWithBass', () => {
  test('adds bass note in octave 2', () => {
    const chord = createChord('C', 'maj7', 1);
    const voicing = getSimpleVoicingWithBass(chord);
    
    expect(voicing.pitches[0].note).toBe('C');
    expect(voicing.pitches[0].octave).toBe(2);
  });

  test('upper structure in octave 4', () => {
    const chord = createChord('C', 'maj7', 1);
    const voicing = getSimpleVoicingWithBass(chord);
    
    // Second pitch (first of upper structure) should be in octave 4
    expect(voicing.pitches[1].octave).toBe(4);
  });
});

describe('voicingToNoteStrings', () => {
  test('converts pitches to string format', () => {
    const chord = createChord('C', 'maj7', 1);
    const voicing = getSimpleVoicing(chord, 4);
    const strings = voicingToNoteStrings(voicing);
    
    expect(strings[0]).toBe('C4');
    expect(strings).toHaveLength(4);
  });

  test('handles sharp notes correctly', () => {
    const chord = createChord('F#', 'min7', 2);
    const voicing = getSimpleVoicing(chord, 3);
    const strings = voicingToNoteStrings(voicing);
    
    expect(strings[0]).toBe('F#3');
  });
});

describe('isVoicingInRange', () => {
  test('returns true for normal voicing', () => {
    const chord = createChord('C', 'maj7', 1);
    const voicing = getVoicing(chord);
    
    expect(isVoicingInRange(voicing)).toBe(true);
  });

  test('returns true for voicing with bass', () => {
    const chord = createChord('C', 'maj7', 1);
    const voicing = getVoicingWithBass(chord);
    
    expect(isVoicingInRange(voicing)).toBe(true);
  });
});

describe('getLowestPitch', () => {
  test('returns lowest pitch from voicing', () => {
    const chord = createChord('C', 'maj7', 1);
    const voicing = getVoicingWithBass(chord);
    const lowest = getLowestPitch(voicing);
    
    // Bass note should be lowest
    expect(lowest.octave).toBe(2);
  });
});

describe('getHighestPitch', () => {
  test('returns highest pitch from voicing', () => {
    const chord = createChord('C', 'maj7', 1);
    const voicing = getVoicing(chord);
    const highest = getHighestPitch(voicing);
    
    // All other pitches should be lower or equal
    voicing.pitches.forEach(pitch => {
      const highestMidi = noteToMidi(highest.note, highest.octave);
      const currentMidi = noteToMidi(pitch.note, pitch.octave);
      expect(currentMidi).toBeLessThanOrEqual(highestMidi);
    });
  });
});
