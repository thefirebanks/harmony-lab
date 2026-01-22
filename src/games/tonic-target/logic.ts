/**
 * Tonic Target Game Logic
 * Core game mechanics for the Tonic Target Practice game
 */

import type { TonicTargetRound, TonicTargetAnswer, TonicTargetSettings } from './types';
import type { ValidationResult } from '@/lib/game-engine/types';
import { 
  getRandomKey,
  buildTwoFiveOne,
  getAllDiatonicChords,
  validateProgression,
} from '@/lib/music';

/**
 * Generate a new round
 * @param settings - Current game settings
 * @returns A new round with a random key and correct progression
 */
export function generateRound(settings: TonicTargetSettings): TonicTargetRound {
  // Pick a random key from all 12 major keys
  const key = getRandomKey();
  
  // Build the correct ii-V-I for this key
  const correctProgression = buildTwoFiveOne(key);
  
  // Get all 7 diatonic chords for the chord grid
  const availableChords = getAllDiatonicChords(key.tonic);
  
  return {
    key,
    correctProgression,
    availableChords,
  };
}

/**
 * Validate the user's answer
 * @param round - The current round
 * @param answer - The user's answer
 * @returns Validation result with feedback
 */
export function validateAnswer(
  round: TonicTargetRound,
  answer: TonicTargetAnswer
): ValidationResult {
  const isCorrect = validateProgression(round.correctProgression, answer);
  
  if (isCorrect) {
    return {
      isCorrect: true,
      feedback: 'Nice!',
    };
  }
  
  // Generate helpful feedback for incorrect answers
  let feedback = 'Not quite.';
  
  if (!answer.ii || !answer.V || !answer.I) {
    feedback = 'Please select all three chords (ii, V, and I).';
  } else {
    // Specific feedback about what was wrong
    const wrongChords: string[] = [];
    
    if (answer.ii.root !== round.correctProgression.ii.root) {
      wrongChords.push('ii');
    }
    if (answer.V.root !== round.correctProgression.V.root) {
      wrongChords.push('V');
    }
    if (answer.I.root !== round.correctProgression.I.root) {
      wrongChords.push('I');
    }
    
    if (wrongChords.length > 0) {
      feedback = `The ${wrongChords.join(', ')} chord${wrongChords.length > 1 ? 's were' : ' was'} incorrect.`;
    }
  }
  
  return {
    isCorrect: false,
    feedback,
    correctAnswer: round.correctProgression,
  };
}

/**
 * Get the slot for the next chord selection
 * Returns which slot should be filled next (ii, V, or I)
 */
export function getNextSlot(answer: TonicTargetAnswer): 'ii' | 'V' | 'I' | null {
  if (!answer.ii) return 'ii';
  if (!answer.V) return 'V';
  if (!answer.I) return 'I';
  return null; // All slots filled
}

/**
 * Check if answer is complete
 */
export function isAnswerComplete(answer: TonicTargetAnswer): boolean {
  return answer.ii !== null && answer.V !== null && answer.I !== null;
}
