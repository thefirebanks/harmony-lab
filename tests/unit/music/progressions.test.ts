/**
 * Tests for progression utilities
 */

import { describe, expect, test } from 'bun:test';
import {
  buildTwoFiveOne,
  validateProgression,
  getProgressionDisplayString,
  getAnswerDisplayString,
  isAnswerComplete,
  createEmptyAnswer,
  getAllTwoFiveOneProgressions,
} from '@/lib/music/progressions';
import { getMajorScale } from '@/lib/music/scales';
import type { Key, Answer, NoteName } from '@/lib/music/types';

describe('buildTwoFiveOne', () => {
  test('returns correct ii-V-I for C major', () => {
    const key: Key = { tonic: 'C', mode: 'major' };
    const progression = buildTwoFiveOne(key);

    expect(progression.ii.root).toBe('D');
    expect(progression.ii.quality).toBe('min7');
    expect(progression.ii.degree).toBe(2);

    expect(progression.V.root).toBe('G');
    expect(progression.V.quality).toBe('7');
    expect(progression.V.degree).toBe(5);

    expect(progression.I.root).toBe('C');
    expect(progression.I.quality).toBe('maj7');
    expect(progression.I.degree).toBe(1);
  });

  test('returns correct ii-V-I for G major', () => {
    const key: Key = { tonic: 'G', mode: 'major' };
    const progression = buildTwoFiveOne(key);

    expect(progression.ii.root).toBe('A');
    expect(progression.V.root).toBe('D');
    expect(progression.I.root).toBe('G');
  });

  test('returns correct ii-V-I for F# major', () => {
    const key: Key = { tonic: 'F#', mode: 'major' };
    const progression = buildTwoFiveOne(key);

    expect(progression.ii.root).toBe('G#');
    expect(progression.V.root).toBe('C#');
    expect(progression.I.root).toBe('F#');
  });

  test('ii chord is built on 2nd degree for all keys', () => {
    const keys: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    keys.forEach(tonic => {
      const key: Key = { tonic, mode: 'major' };
      const progression = buildTwoFiveOne(key);
      const scale = getMajorScale(tonic);
      
      expect(progression.ii.root).toBe(scale[1]);
    });
  });

  test('V chord is built on 5th degree for all keys', () => {
    const keys: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    keys.forEach(tonic => {
      const key: Key = { tonic, mode: 'major' };
      const progression = buildTwoFiveOne(key);
      const scale = getMajorScale(tonic);
      
      expect(progression.V.root).toBe(scale[4]);
    });
  });
});

describe('validateProgression', () => {
  test('returns true for correct answer', () => {
    const key: Key = { tonic: 'C', mode: 'major' };
    const progression = buildTwoFiveOne(key);
    const answer: Answer = {
      ii: progression.ii,
      V: progression.V,
      I: progression.I,
    };

    expect(validateProgression(progression, answer)).toBe(true);
  });

  test('returns false for wrong ii chord', () => {
    const key: Key = { tonic: 'C', mode: 'major' };
    const progression = buildTwoFiveOne(key);
    const answer: Answer = {
      ii: { root: 'E', quality: 'min7', degree: 3 }, // iii instead of ii
      V: progression.V,
      I: progression.I,
    };

    expect(validateProgression(progression, answer)).toBe(false);
  });

  test('returns false for wrong V chord', () => {
    const key: Key = { tonic: 'C', mode: 'major' };
    const progression = buildTwoFiveOne(key);
    const answer: Answer = {
      ii: progression.ii,
      V: { root: 'F', quality: 'maj7', degree: 4 }, // IV instead of V
      I: progression.I,
    };

    expect(validateProgression(progression, answer)).toBe(false);
  });

  test('returns false when ii is null', () => {
    const key: Key = { tonic: 'C', mode: 'major' };
    const progression = buildTwoFiveOne(key);
    const answer: Answer = {
      ii: null,
      V: progression.V,
      I: progression.I,
    };

    expect(validateProgression(progression, answer)).toBe(false);
  });

  test('returns false when all are null', () => {
    const key: Key = { tonic: 'C', mode: 'major' };
    const progression = buildTwoFiveOne(key);
    const answer = createEmptyAnswer();

    expect(validateProgression(progression, answer)).toBe(false);
  });
});

describe('getProgressionDisplayString', () => {
  test('displays C major ii-V-I correctly', () => {
    const key: Key = { tonic: 'C', mode: 'major' };
    const progression = buildTwoFiveOne(key);
    
    expect(getProgressionDisplayString(progression)).toBe('Dm7 → G7 → Cmaj7');
  });

  test('displays F# major ii-V-I correctly', () => {
    const key: Key = { tonic: 'F#', mode: 'major' };
    const progression = buildTwoFiveOne(key);
    
    expect(getProgressionDisplayString(progression)).toBe('G#m7 → C#7 → F#maj7');
  });
});

describe('getAnswerDisplayString', () => {
  test('displays complete answer', () => {
    const key: Key = { tonic: 'C', mode: 'major' };
    const progression = buildTwoFiveOne(key);
    const answer: Answer = {
      ii: progression.ii,
      V: progression.V,
      I: progression.I,
    };

    expect(getAnswerDisplayString(answer)).toBe('Dm7 → G7 → Cmaj7');
  });

  test('displays partial answer with underscores', () => {
    const answer: Answer = {
      ii: { root: 'D', quality: 'min7', degree: 2 },
      V: null,
      I: null,
    };

    expect(getAnswerDisplayString(answer)).toBe('Dm7 → ___ → ___');
  });

  test('displays empty answer', () => {
    const answer = createEmptyAnswer();
    expect(getAnswerDisplayString(answer)).toBe('___ → ___ → ___');
  });
});

describe('isAnswerComplete', () => {
  test('returns true when all chords selected', () => {
    const key: Key = { tonic: 'C', mode: 'major' };
    const progression = buildTwoFiveOne(key);
    const answer: Answer = {
      ii: progression.ii,
      V: progression.V,
      I: progression.I,
    };

    expect(isAnswerComplete(answer)).toBe(true);
  });

  test('returns false when some chords missing', () => {
    const answer: Answer = {
      ii: { root: 'D', quality: 'min7', degree: 2 },
      V: null,
      I: { root: 'C', quality: 'maj7', degree: 1 },
    };

    expect(isAnswerComplete(answer)).toBe(false);
  });

  test('returns false for empty answer', () => {
    expect(isAnswerComplete(createEmptyAnswer())).toBe(false);
  });
});

describe('getAllTwoFiveOneProgressions', () => {
  test('returns 12 progressions', () => {
    const progressions = getAllTwoFiveOneProgressions();
    expect(progressions).toHaveLength(12);
  });

  test('each progression has correct structure', () => {
    const progressions = getAllTwoFiveOneProgressions();
    
    progressions.forEach(({ key, progression }) => {
      expect(key.tonic).toBeDefined();
      expect(key.mode).toBe('major');
      expect(progression.ii.quality).toBe('min7');
      expect(progression.V.quality).toBe('7');
      expect(progression.I.quality).toBe('maj7');
    });
  });
});
