/**
 * Tests for chord parser module
 * Tests roman numeral parsing, progression parsing, and chord conversion
 */

import { describe, expect, test } from 'bun:test';
import {
  parseRomanNumeral,
  parseProgression,
  romanNumeralToChord,
  chordToRomanNumeral,
  validateChordInput,
  getFormatHint,
} from '@/lib/music/chordParser';
import type { ParsedChord } from '@/lib/music/chordParser';

describe('parseRomanNumeral', () => {
  describe('basic numerals (triads)', () => {
    test('parses uppercase I as major triad', () => {
      const result = parseRomanNumeral('I');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(1);
      expect(result!.quality).toBe('maj');
      expect(result!.accidental).toBe(0);
      expect(result!.hasExtension).toBe(false);
    });

    test('parses lowercase i as minor triad', () => {
      const result = parseRomanNumeral('i');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(1);
      expect(result!.quality).toBe('min');
      expect(result!.accidental).toBe(0);
    });

    test('parses uppercase IV', () => {
      const result = parseRomanNumeral('IV');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(4);
      expect(result!.quality).toBe('maj');
    });

    test('parses lowercase vi', () => {
      const result = parseRomanNumeral('vi');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(6);
      expect(result!.quality).toBe('min');
    });

    test('parses VII', () => {
      const result = parseRomanNumeral('VII');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(7);
      expect(result!.quality).toBe('maj');
    });

    test('parses ii', () => {
      const result = parseRomanNumeral('ii');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(2);
      expect(result!.quality).toBe('min');
    });

    test('parses iii', () => {
      const result = parseRomanNumeral('iii');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(3);
      expect(result!.quality).toBe('min');
    });
  });

  describe('7th chords', () => {
    test('parses V7 as dominant 7', () => {
      const result = parseRomanNumeral('V7');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(5);
      expect(result!.quality).toBe('7');
      expect(result!.hasExtension).toBe(true);
    });

    test('parses Imaj7', () => {
      const result = parseRomanNumeral('Imaj7');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(1);
      expect(result!.quality).toBe('maj7');
      expect(result!.hasExtension).toBe(true);
    });

    test('parses iim7', () => {
      const result = parseRomanNumeral('iim7');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(2);
      expect(result!.quality).toBe('min7');
      expect(result!.hasExtension).toBe(true);
    });

    test('parses IVmaj7', () => {
      const result = parseRomanNumeral('IVmaj7');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(4);
      expect(result!.quality).toBe('maj7');
    });

    test('parses viim7b5 (half-diminished)', () => {
      const result = parseRomanNumeral('viim7b5');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(7);
      expect(result!.quality).toBe('min7b5');
      expect(result!.hasExtension).toBe(true);
    });

    test('parses viiø7 equivalent notation', () => {
      const result = parseRomanNumeral('viimin7b5');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(7);
      expect(result!.quality).toBe('min7b5');
    });
  });

  describe('diminished chords', () => {
    test('parses viidim', () => {
      const result = parseRomanNumeral('viidim');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(7);
      expect(result!.quality).toBe('dim');
      expect(result!.hasExtension).toBe(false);
    });

    test('parses viidim7', () => {
      const result = parseRomanNumeral('viidim7');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(7);
      expect(result!.quality).toBe('dim7');
      expect(result!.hasExtension).toBe(true);
    });

    test('parses vii° (degree symbol)', () => {
      const result = parseRomanNumeral('vii°');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(7);
      expect(result!.quality).toBe('dim');
    });

    test('parses viio (lowercase o)', () => {
      const result = parseRomanNumeral('viio');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(7);
      expect(result!.quality).toBe('dim');
    });
  });

  describe('borrowed chords (accidentals)', () => {
    test('parses bVII (flat seven)', () => {
      const result = parseRomanNumeral('bVII');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(7);
      expect(result!.accidental).toBe(-1);
      expect(result!.quality).toBe('maj');
    });

    test('parses bIII', () => {
      const result = parseRomanNumeral('bIII');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(3);
      expect(result!.accidental).toBe(-1);
    });

    test('parses bVI', () => {
      const result = parseRomanNumeral('bVI');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(6);
      expect(result!.accidental).toBe(-1);
    });

    test('parses #iv (sharp four)', () => {
      const result = parseRomanNumeral('#iv');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(4);
      expect(result!.accidental).toBe(1);
      expect(result!.quality).toBe('min');
    });

    test('parses bVII7 with extension', () => {
      const result = parseRomanNumeral('bVII7');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(7);
      expect(result!.accidental).toBe(-1);
      expect(result!.quality).toBe('7');
      expect(result!.hasExtension).toBe(true);
    });

    test('parses ♭VII with unicode flat symbol', () => {
      const result = parseRomanNumeral('♭VII');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(7);
      expect(result!.accidental).toBe(-1);
    });

    test('parses ♯IV with unicode sharp symbol', () => {
      const result = parseRomanNumeral('♯IV');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(4);
      expect(result!.accidental).toBe(1);
    });
  });

  describe('invalid inputs', () => {
    test('returns null for empty string', () => {
      expect(parseRomanNumeral('')).toBeNull();
    });

    test('returns null for whitespace only', () => {
      expect(parseRomanNumeral('   ')).toBeNull();
    });

    test('returns null for invalid numeral VIII', () => {
      expect(parseRomanNumeral('VIII')).toBeNull();
    });

    test('returns null for random text', () => {
      expect(parseRomanNumeral('xyz')).toBeNull();
    });

    test('returns null for note names', () => {
      expect(parseRomanNumeral('C')).toBeNull();
      expect(parseRomanNumeral('Am')).toBeNull();
    });

    test('returns null for invalid suffix', () => {
      expect(parseRomanNumeral('Iaug7')).toBeNull();
      expect(parseRomanNumeral('Iminmaj7')).toBeNull();
    });
  });

  describe('whitespace handling', () => {
    test('trims leading whitespace', () => {
      const result = parseRomanNumeral('  I');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(1);
    });

    test('trims trailing whitespace', () => {
      const result = parseRomanNumeral('V7  ');
      expect(result).not.toBeNull();
      expect(result!.degree).toBe(5);
    });
  });
});

describe('parseProgression', () => {
  test('parses simple progression', () => {
    const result = parseProgression('I, V, vi, IV');
    expect(result.success).toBe(true);
    expect(result.chords).toHaveLength(4);
    expect(result.errors).toHaveLength(0);
    
    expect(result.chords[0].degree).toBe(1);
    expect(result.chords[1].degree).toBe(5);
    expect(result.chords[2].degree).toBe(6);
    expect(result.chords[3].degree).toBe(4);
  });

  test('parses progression without spaces', () => {
    const result = parseProgression('I,V,vi,IV');
    expect(result.success).toBe(true);
    expect(result.chords).toHaveLength(4);
  });

  test('parses ii-V-I progression with 7ths', () => {
    const result = parseProgression('iim7, V7, Imaj7');
    expect(result.success).toBe(true);
    expect(result.chords).toHaveLength(3);
    
    expect(result.chords[0].quality).toBe('min7');
    expect(result.chords[1].quality).toBe('7');
    expect(result.chords[2].quality).toBe('maj7');
  });

  test('parses progression with borrowed chords', () => {
    const result = parseProgression('I, bVII, IV, I');
    expect(result.success).toBe(true);
    expect(result.chords).toHaveLength(4);
    expect(result.chords[1].accidental).toBe(-1);
  });

  test('returns errors for invalid entries', () => {
    const result = parseProgression('I, xyz, V');
    expect(result.success).toBe(false);
    expect(result.chords).toHaveLength(2); // I and V parsed
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].value).toBe('xyz');
  });

  test('handles empty string', () => {
    const result = parseProgression('');
    expect(result.success).toBe(true);
    expect(result.chords).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  test('handles trailing comma', () => {
    const result = parseProgression('I, V,');
    expect(result.success).toBe(true);
    expect(result.chords).toHaveLength(2);
  });

  test('handles multiple invalid entries', () => {
    const result = parseProgression('I, abc, V, def, IV');
    expect(result.success).toBe(false);
    expect(result.chords).toHaveLength(3); // I, V, IV
    expect(result.errors).toHaveLength(2);
  });
});

describe('romanNumeralToChord', () => {
  test('converts I in C major to C', () => {
    const parsed: ParsedChord = {
      degree: 1, accidental: 0, quality: 'maj', hasExtension: false, original: 'I'
    };
    const chord = romanNumeralToChord(parsed, 'C', 'major');
    expect(chord.root).toBe('C');
    expect(chord.quality).toBe('maj');
    expect(chord.degree).toBe(1);
  });

  test('converts V7 in C major to G7', () => {
    const parsed: ParsedChord = {
      degree: 5, accidental: 0, quality: '7', hasExtension: true, original: 'V7'
    };
    const chord = romanNumeralToChord(parsed, 'C', 'major');
    expect(chord.root).toBe('G');
    expect(chord.quality).toBe('7');
  });

  test('converts ii in G major to Am', () => {
    const parsed: ParsedChord = {
      degree: 2, accidental: 0, quality: 'min', hasExtension: false, original: 'ii'
    };
    const chord = romanNumeralToChord(parsed, 'G', 'major');
    expect(chord.root).toBe('A');
    expect(chord.quality).toBe('min');
  });

  test('converts bVII in C major to Bb', () => {
    const parsed: ParsedChord = {
      degree: 7, accidental: -1, quality: 'maj', hasExtension: false, original: 'bVII'
    };
    const chord = romanNumeralToChord(parsed, 'C', 'major');
    expect(chord.root).toBe('A#'); // A# is enharmonic to Bb
    expect(chord.quality).toBe('maj');
  });

  test('converts IV in F major to Bb', () => {
    const parsed: ParsedChord = {
      degree: 4, accidental: 0, quality: 'maj', hasExtension: false, original: 'IV'
    };
    const chord = romanNumeralToChord(parsed, 'F', 'major');
    expect(chord.root).toBe('A#'); // Bb
    expect(chord.quality).toBe('maj');
  });

  test('converts i in A minor to Am', () => {
    const parsed: ParsedChord = {
      degree: 1, accidental: 0, quality: 'min', hasExtension: false, original: 'i'
    };
    const chord = romanNumeralToChord(parsed, 'A', 'minor');
    expect(chord.root).toBe('A');
    expect(chord.quality).toBe('min');
  });

  test('converts VII in A minor to G', () => {
    const parsed: ParsedChord = {
      degree: 7, accidental: 0, quality: 'maj', hasExtension: false, original: 'VII'
    };
    const chord = romanNumeralToChord(parsed, 'A', 'minor');
    expect(chord.root).toBe('G');
    expect(chord.quality).toBe('maj');
  });
});

describe('chordToRomanNumeral', () => {
  test('converts Cmaj7 in C major to Imaj7', () => {
    const chord = { root: 'C' as const, quality: 'maj7' as const, degree: 1 as const };
    const result = chordToRomanNumeral(chord, 'C', 'major');
    expect(result).toBe('Imaj7');
  });

  test('converts G7 in C major to V7', () => {
    const chord = { root: 'G' as const, quality: '7' as const, degree: 5 as const };
    const result = chordToRomanNumeral(chord, 'C', 'major');
    expect(result).toBe('V7');
  });

  test('converts Am in C major to vi', () => {
    const chord = { root: 'A' as const, quality: 'min' as const, degree: 6 as const };
    const result = chordToRomanNumeral(chord, 'C', 'major');
    expect(result).toBe('vi');
  });

  test('converts Dm7 in C major to iim7', () => {
    const chord = { root: 'D' as const, quality: 'min7' as const, degree: 2 as const };
    const result = chordToRomanNumeral(chord, 'C', 'major');
    expect(result).toBe('iim7');
  });

  test('converts Bm7b5 in C major to viim7b5', () => {
    const chord = { root: 'B' as const, quality: 'min7b5' as const, degree: 7 as const };
    const result = chordToRomanNumeral(chord, 'C', 'major');
    expect(result).toBe('viim7b5');
  });

  test('converts Bdim in C major to viidim', () => {
    const chord = { root: 'B' as const, quality: 'dim' as const, degree: 7 as const };
    const result = chordToRomanNumeral(chord, 'C', 'major');
    expect(result).toBe('viidim');
  });

  test('handles borrowed chord Bb in C major as bVII', () => {
    // A# is enharmonic to Bb, and should show as bVII
    const chord = { root: 'A#' as const, quality: 'maj' as const, degree: 7 as const };
    const result = chordToRomanNumeral(chord, 'C', 'major');
    expect(result).toBe('bVII');
  });
});

describe('validateChordInput', () => {
  test('returns valid for correct input', () => {
    const result = validateChordInput('V7');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('returns invalid for empty input', () => {
    const result = validateChordInput('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('returns invalid for invalid numeral', () => {
    const result = validateChordInput('xyz');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('not valid');
  });

  test('returns valid for borrowed chord', () => {
    const result = validateChordInput('bVII');
    expect(result.isValid).toBe(true);
  });
});

describe('getFormatHint', () => {
  test('returns a non-empty string', () => {
    const hint = getFormatHint();
    expect(hint).toBeTruthy();
    expect(typeof hint).toBe('string');
  });

  test('includes example formats', () => {
    const hint = getFormatHint();
    expect(hint).toContain('I');
    expect(hint).toContain('ii');
  });
});

describe('round-trip parsing', () => {
  test('chord survives parse -> convert -> toRoman -> parse cycle', () => {
    const input = 'Imaj7';
    const parsed1 = parseRomanNumeral(input)!;
    const chord = romanNumeralToChord(parsed1, 'C', 'major');
    const romanAgain = chordToRomanNumeral(chord, 'C', 'major');
    const parsed2 = parseRomanNumeral(romanAgain)!;
    
    expect(parsed2.degree).toBe(parsed1.degree);
    expect(parsed2.quality).toBe(parsed1.quality);
  });

  test('V7 round-trips correctly', () => {
    const input = 'V7';
    const parsed1 = parseRomanNumeral(input)!;
    const chord = romanNumeralToChord(parsed1, 'G', 'major');
    const romanAgain = chordToRomanNumeral(chord, 'G', 'major');
    
    expect(romanAgain).toBe('V7');
  });

  test('iim7 round-trips correctly', () => {
    const input = 'iim7';
    const parsed1 = parseRomanNumeral(input)!;
    const chord = romanNumeralToChord(parsed1, 'F', 'major');
    const romanAgain = chordToRomanNumeral(chord, 'F', 'major');
    
    expect(romanAgain).toBe('iim7');
  });
});
