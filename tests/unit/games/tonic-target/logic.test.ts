/**
 * Tests for Tonic Target game logic
 */

import { describe, expect, test } from 'bun:test';
import { generateRound, validateAnswer, getNextSlot, isAnswerComplete } from '@/games/tonic-target/logic';
import { defaultTonicTargetSettings } from '@/games/tonic-target/types';
import { getMajorScale } from '@/lib/music';
import type { TonicTargetAnswer } from '@/games/tonic-target/types';

describe('generateRound', () => {
  test('generates valid round with all required fields', () => {
    const round = generateRound(defaultTonicTargetSettings);
    
    expect(round.key).toBeDefined();
    expect(round.key.tonic).toBeDefined();
    expect(round.key.mode).toBe('major');
    expect(round.correctProgression).toBeDefined();
    expect(round.availableChords).toBeDefined();
  });

  test('correct progression has proper chord qualities', () => {
    const round = generateRound(defaultTonicTargetSettings);
    
    expect(round.correctProgression.ii.quality).toBe('min7');
    expect(round.correctProgression.V.quality).toBe('7');
    expect(round.correctProgression.I.quality).toBe('maj7');
  });

  test('ii chord is built on 2nd degree', () => {
    // Test multiple times due to randomness
    for (let i = 0; i < 20; i++) {
      const round = generateRound(defaultTonicTargetSettings);
      const scale = getMajorScale(round.key.tonic);
      expect(round.correctProgression.ii.root).toBe(scale[1]);
    }
  });

  test('V chord is built on 5th degree', () => {
    for (let i = 0; i < 20; i++) {
      const round = generateRound(defaultTonicTargetSettings);
      const scale = getMajorScale(round.key.tonic);
      expect(round.correctProgression.V.root).toBe(scale[4]);
    }
  });

  test('I chord is the tonic', () => {
    for (let i = 0; i < 20; i++) {
      const round = generateRound(defaultTonicTargetSettings);
      expect(round.correctProgression.I.root).toBe(round.key.tonic);
    }
  });

  test('available chords has 7 diatonic chords', () => {
    const round = generateRound(defaultTonicTargetSettings);
    expect(round.availableChords).toHaveLength(7);
  });
});

describe('validateAnswer', () => {
  test('returns true for correct answer', () => {
    const round = generateRound(defaultTonicTargetSettings);
    const answer: TonicTargetAnswer = {
      ii: round.correctProgression.ii,
      V: round.correctProgression.V,
      I: round.correctProgression.I,
    };

    const result = validateAnswer(round, answer);
    expect(result.isCorrect).toBe(true);
    expect(result.feedback).toBe('Nice!');
  });

  test('returns false for wrong ii chord', () => {
    const round = generateRound(defaultTonicTargetSettings);
    const answer: TonicTargetAnswer = {
      ii: { ...round.correctProgression.ii, root: 'X' as any },
      V: round.correctProgression.V,
      I: round.correctProgression.I,
    };

    const result = validateAnswer(round, answer);
    expect(result.isCorrect).toBe(false);
  });

  test('returns false for wrong V chord', () => {
    const round = generateRound(defaultTonicTargetSettings);
    const answer: TonicTargetAnswer = {
      ii: round.correctProgression.ii,
      V: { ...round.correctProgression.V, root: 'X' as any },
      I: round.correctProgression.I,
    };

    const result = validateAnswer(round, answer);
    expect(result.isCorrect).toBe(false);
  });

  test('returns false for incomplete answer', () => {
    const round = generateRound(defaultTonicTargetSettings);
    const answer: TonicTargetAnswer = {
      ii: round.correctProgression.ii,
      V: null,
      I: round.correctProgression.I,
    };

    const result = validateAnswer(round, answer);
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('select all three');
  });

  test('provides helpful feedback on incorrect', () => {
    const round = generateRound(defaultTonicTargetSettings);
    const answer: TonicTargetAnswer = {
      ii: { root: 'A', quality: 'min7', degree: 6 }, // Wrong chord
      V: round.correctProgression.V,
      I: round.correctProgression.I,
    };

    const result = validateAnswer(round, answer);
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('ii');
  });
});

describe('getNextSlot', () => {
  test('returns ii when all slots empty', () => {
    const answer: TonicTargetAnswer = { ii: null, V: null, I: null };
    expect(getNextSlot(answer)).toBe('ii');
  });

  test('returns V when ii is filled', () => {
    const answer: TonicTargetAnswer = {
      ii: { root: 'D', quality: 'min7', degree: 2 },
      V: null,
      I: null,
    };
    expect(getNextSlot(answer)).toBe('V');
  });

  test('returns I when ii and V are filled', () => {
    const answer: TonicTargetAnswer = {
      ii: { root: 'D', quality: 'min7', degree: 2 },
      V: { root: 'G', quality: '7', degree: 5 },
      I: null,
    };
    expect(getNextSlot(answer)).toBe('I');
  });

  test('returns null when all filled', () => {
    const answer: TonicTargetAnswer = {
      ii: { root: 'D', quality: 'min7', degree: 2 },
      V: { root: 'G', quality: '7', degree: 5 },
      I: { root: 'C', quality: 'maj7', degree: 1 },
    };
    expect(getNextSlot(answer)).toBe(null);
  });
});

describe('isAnswerComplete', () => {
  test('returns false for empty answer', () => {
    const answer: TonicTargetAnswer = { ii: null, V: null, I: null };
    expect(isAnswerComplete(answer)).toBe(false);
  });

  test('returns false for partial answer', () => {
    const answer: TonicTargetAnswer = {
      ii: { root: 'D', quality: 'min7', degree: 2 },
      V: null,
      I: { root: 'C', quality: 'maj7', degree: 1 },
    };
    expect(isAnswerComplete(answer)).toBe(false);
  });

  test('returns true for complete answer', () => {
    const answer: TonicTargetAnswer = {
      ii: { root: 'D', quality: 'min7', degree: 2 },
      V: { root: 'G', quality: '7', degree: 5 },
      I: { root: 'C', quality: 'maj7', degree: 1 },
    };
    expect(isAnswerComplete(answer)).toBe(true);
  });
});
