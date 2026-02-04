/**
 * Chord Parser Module
 * Parses roman numeral notation into chord objects
 * Supports borrowed chords (bVII, bIII, #iv, etc.)
 */

import type { NoteName, Chord, ChordQuality, ScaleDegree } from './types';
import { getNoteIndex, getNoteAtIndex, getMajorScale, getMinorScale } from './scales';

// ============================================================================
// Types
// ============================================================================

export interface ParsedChord {
  /** Scale degree 1-7 */
  degree: ScaleDegree;
  /** Accidental offset: -1 for flat, 0 for natural, 1 for sharp */
  accidental: -1 | 0 | 1;
  /** Chord quality (maj, min, dim, aug, etc.) */
  quality: ChordQuality;
  /** Whether the chord has an extension (7th) */
  hasExtension: boolean;
  /** Original input string for display */
  original: string;
}

export interface ParseError {
  /** Index of the invalid token in the input */
  index: number;
  /** The invalid value */
  value: string;
  /** Human-readable error message */
  message: string;
}

export interface ParseResult {
  /** Whether all tokens were successfully parsed */
  success: boolean;
  /** Successfully parsed chords */
  chords: ParsedChord[];
  /** Errors for invalid tokens */
  errors: ParseError[];
}

// ============================================================================
// Constants
// ============================================================================

// Roman numeral patterns (case-insensitive matching, then we check case)
const ROMAN_NUMERAL_MAP: Record<string, ScaleDegree> = {
  'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7,
  'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7,
};

// Order matters: check longer patterns first
const ROMAN_NUMERALS_ORDERED = ['viii', 'vii', 'iii', 'ii', 'iv', 'vi', 'i', 'v'];

// Quality patterns to match (order matters - longer first)
const QUALITY_PATTERNS = [
  { pattern: 'maj7', quality: 'maj7' as ChordQuality, hasExtension: true },
  { pattern: 'm7b5', quality: 'min7b5' as ChordQuality, hasExtension: true },
  { pattern: 'min7b5', quality: 'min7b5' as ChordQuality, hasExtension: true },
  { pattern: 'dim7', quality: 'dim7' as ChordQuality, hasExtension: true },
  { pattern: 'min7', quality: 'min7' as ChordQuality, hasExtension: true },
  { pattern: 'm7', quality: 'min7' as ChordQuality, hasExtension: true },
  { pattern: '7', quality: '7' as ChordQuality, hasExtension: true },
  { pattern: 'dim', quality: 'dim' as ChordQuality, hasExtension: false },
  { pattern: 'aug', quality: 'maj' as ChordQuality, hasExtension: false }, // Augmented - treat as major for now
  { pattern: 'min', quality: 'min' as ChordQuality, hasExtension: false },
  { pattern: 'maj', quality: 'maj' as ChordQuality, hasExtension: false },
  { pattern: 'm', quality: 'min' as ChordQuality, hasExtension: false },
];

// ============================================================================
// Parser Functions
// ============================================================================

/**
 * Parse a single roman numeral chord notation
 * @param input - A single chord like "I", "bVII7", "iim7", etc.
 * @returns ParsedChord if valid, null if invalid
 */
export function parseRomanNumeral(input: string): ParsedChord | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let remaining = trimmed;
  let accidental: -1 | 0 | 1 = 0;

  // 1. Check for accidental prefix (b or #)
  if (remaining.startsWith('b') || remaining.startsWith('♭')) {
    accidental = -1;
    remaining = remaining.slice(1);
  } else if (remaining.startsWith('#') || remaining.startsWith('♯')) {
    accidental = 1;
    remaining = remaining.slice(1);
  }

  // 2. Find the roman numeral
  let degree: ScaleDegree | null = null;
  let numeralLength = 0;
  let isUpperCase = false;

  const lowerRemaining = remaining.toLowerCase();
  for (const numeral of ROMAN_NUMERALS_ORDERED) {
    if (lowerRemaining.startsWith(numeral)) {
      // Check if it's actually 'viii' which is invalid (degree 8)
      if (numeral === 'viii') {
        return null;
      }
      degree = ROMAN_NUMERAL_MAP[numeral];
      numeralLength = numeral.length;
      // Check if original was uppercase (first char determines)
      isUpperCase = remaining[0] === remaining[0].toUpperCase();
      break;
    }
  }

  if (degree === null) {
    return null;
  }

  remaining = remaining.slice(numeralLength);

  // 3. Parse quality/extension suffix
  let quality: ChordQuality = isUpperCase ? 'maj' : 'min'; // Default based on case
  let hasExtension = false;

  if (remaining.length === 0) {
    // No suffix - use case to determine quality, default to triad
    // quality already set above
  } else {
    // Try to match a quality pattern
    const lowerRemainingQuality = remaining.toLowerCase();
    let matched = false;

    for (const { pattern, quality: q, hasExtension: ext } of QUALITY_PATTERNS) {
      if (lowerRemainingQuality === pattern) {
        quality = q;
        hasExtension = ext;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Check for special case: just "°" for diminished
      if (remaining === '°' || remaining === 'o') {
        quality = 'dim';
        hasExtension = false;
      } else if (remaining === '°7' || remaining === 'o7') {
        quality = 'dim7';
        hasExtension = true;
      } else {
        return null; // Invalid suffix
      }
    }
  }

  return {
    degree,
    accidental,
    quality,
    hasExtension,
    original: trimmed,
  };
}

/**
 * Parse a comma-separated progression string
 * @param input - Comma-separated chord string like "I, V, vi, IV"
 * @returns ParseResult with chords and any errors
 */
export function parseProgression(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: true, chords: [], errors: [] };
  }

  // Split by comma, keeping track of positions
  const tokens = trimmed.split(/\s*,\s*/);
  const chords: ParsedChord[] = [];
  const errors: ParseError[] = [];

  tokens.forEach((token, index) => {
    if (!token.trim()) {
      // Skip empty tokens (e.g., from trailing comma)
      return;
    }

    const parsed = parseRomanNumeral(token);
    if (parsed) {
      chords.push(parsed);
    } else {
      errors.push({
        index,
        value: token,
        message: `"${token}" is not valid. Use: I, ii, V7, Imaj7, viidim, bVII...`,
      });
    }
  });

  return {
    success: errors.length === 0,
    chords,
    errors,
  };
}

/**
 * Convert a parsed roman numeral to a Chord object in a specific key
 * @param parsed - The parsed chord data
 * @param keyTonic - The tonic of the key (e.g., 'C')
 * @param mode - 'major' or 'minor'
 * @returns A Chord object
 */
export function romanNumeralToChord(
  parsed: ParsedChord,
  keyTonic: NoteName,
  mode: 'major' | 'minor' = 'major'
): Chord {
  // Get the scale for this key
  const scale = mode === 'major' ? getMajorScale(keyTonic) : getMinorScale(keyTonic);
  
  // Get the root note from the scale degree
  let rootNote = scale[parsed.degree - 1];
  
  // Apply accidental if present (borrowed chord)
  if (parsed.accidental !== 0) {
    const rootIndex = getNoteIndex(rootNote);
    rootNote = getNoteAtIndex(rootIndex + parsed.accidental);
  }

  return {
    root: rootNote,
    quality: parsed.quality,
    degree: parsed.degree,
  };
}

/**
 * Convert a Chord back to roman numeral notation
 * Useful for displaying chords in the inline edit field
 * @param chord - The chord to convert
 * @param keyTonic - The tonic of the key
 * @param mode - 'major' or 'minor'
 * @returns Roman numeral string like "V7" or "bVII"
 */
export function chordToRomanNumeral(
  chord: Chord,
  keyTonic: NoteName,
  mode: 'major' | 'minor' = 'major'
): string {
  const scale = mode === 'major' ? getMajorScale(keyTonic) : getMinorScale(keyTonic);
  const expectedRoot = scale[chord.degree - 1];
  
  // Check if this is a borrowed chord (root doesn't match expected)
  let accidentalPrefix = '';
  const expectedIndex = getNoteIndex(expectedRoot);
  const actualIndex = getNoteIndex(chord.root);
  const diff = (actualIndex - expectedIndex + 12) % 12;
  
  if (diff === 11) {
    accidentalPrefix = 'b';
  } else if (diff === 1) {
    accidentalPrefix = '#';
  }

  // Determine if numeral should be uppercase based on quality
  const isMinorQuality = ['min', 'min7', 'min7b5', 'dim', 'dim7'].includes(chord.quality);
  
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  let numeral = numerals[chord.degree - 1];
  
  if (isMinorQuality) {
    numeral = numeral.toLowerCase();
  }

  // Add quality suffix
  let suffix = '';
  switch (chord.quality) {
    case 'maj7':
      suffix = 'maj7';
      break;
    case 'min7':
      suffix = 'm7';
      break;
    case '7':
      suffix = '7';
      break;
    case 'min7b5':
      suffix = 'm7b5';
      break;
    case 'dim7':
      suffix = 'dim7';
      break;
    case 'dim':
      suffix = 'dim';
      break;
    case 'maj':
    case 'min':
      // No suffix for triads (case of numeral indicates quality)
      suffix = '';
      break;
  }

  return `${accidentalPrefix}${numeral}${suffix}`;
}

/**
 * Validate a single chord input string
 * @param input - The input to validate
 * @returns Object with isValid flag and optional error message
 */
export function validateChordInput(input: string): { isValid: boolean; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Please enter a chord' };
  }

  const parsed = parseRomanNumeral(trimmed);
  if (!parsed) {
    return { 
      isValid: false, 
      error: `"${trimmed}" is not valid. Use: I, ii, V7, Imaj7, viidim, bVII...` 
    };
  }

  return { isValid: true };
}

/**
 * Get format hint for the input field
 */
export function getFormatHint(): string {
  return 'Format: I, ii, V7, Imaj7, viidim, bVII...';
}
