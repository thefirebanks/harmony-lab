/**
 * Tonic Target Game Logic
 * Core game mechanics for the Tonic Target Practice game
 */

import type { TonicTargetRound, TonicTargetAnswer, TonicTargetSettings, TargetDegree, ChordOption } from './types';
import type { ValidationResult } from '@/lib/game-engine/types';
import type { Key, Progression, ScaleDegree } from '@/lib/music/types';
import {
  getRandomKey,
  buildTwoFiveOne,
  getAllDiatonicChords,
  validateProgression,
  getDiatonicChord,
  getScaleDegree,
  getMinorScaleDegree,
  getNoteIndex,
} from '@/lib/music';

/**
 * Randomly select a target degree from available options
 */
function getRandomTargetDegree(availableDegrees: TargetDegree[]): TargetDegree {
  return availableDegrees[Math.floor(Math.random() * availableDegrees.length)];
}

/**
 * Build a progression targeting a specific scale degree
 * Uses functional harmony to create natural movement to each target
 */
function buildProgressionToTarget(key: Key, targetDegree: TargetDegree): Progression {
  // Resolve to the target chord using a true ii-V-(I/i) in the target key
  if (targetDegree === 1) {
    return buildTwoFiveOne(key);
  }

  const targetTonic = getScaleDegree(key.tonic, targetDegree);
  const targetChord = getDiatonicChord(key.tonic, targetDegree);
  const isMinorTarget = isMinorTargetDegree(targetDegree);

  if (isMinorTarget) {
    const iiRoot = getMinorScaleDegree(targetTonic, 2);
    const vRoot = getMinorScaleDegree(targetTonic, 5);
    return {
      ii: { root: iiRoot, quality: 'min7b5', degree: 2 },
      V: { root: vRoot, quality: '7', degree: 5 },
      I: targetChord,
    };
  }

  const iiRoot = getScaleDegree(targetTonic, 2);
  const vRoot = getScaleDegree(targetTonic, 5);
  return {
    ii: { root: iiRoot, quality: 'min7', degree: 2 },
    V: { root: vRoot, quality: '7', degree: 5 },
    I: targetChord,
  };
}

function getTargetProgressionLabels(targetDegree: TargetDegree): { ii: string; V: string; I: string } {
  const isMinorTarget = isMinorTargetDegree(targetDegree);
  return {
    ii: isMinorTarget ? 'iiø7' : 'ii',
    V: 'V7',
    I: isMinorTarget ? 'i' : 'I',
  };
}

function buildChordOptions(key: Key, targetDegree: TargetDegree, progression: Progression): ChordOption[] {
  const qualityOffsets: Record<string, number> = {
    maj7: 0,
    min7: 1,
    '7': 2,
    min7b5: 3,
    dim7: 4,
    maj: 5,
    min: 6,
  };
  const getColorDegree = (root: string, quality: string): ScaleDegree => {
    const rootIndex = getNoteIndex(root as never);
    const qualityOffset = qualityOffsets[quality] ?? 0;
    return (((rootIndex + qualityOffset) % 7) + 1) as ScaleDegree;
  };

  const diatonicChords = getAllDiatonicChords(key.tonic).map((chord) => ({
    id: `diatonic-${chord.degree}`,
    chord,
    label: '',
    degree: chord.degree,
    colorDegree: chord.degree,
    group: 'diatonic' as const,
  }));

  const targetOptions: ChordOption[] = [
    {
      id: `target-ii-${progression.ii.root}${progression.ii.quality}`,
      chord: progression.ii,
      label: '',
      colorDegree: getColorDegree(progression.ii.root, progression.ii.quality),
      group: 'target',
    },
    {
      id: `target-V-${progression.V.root}${progression.V.quality}`,
      chord: progression.V,
      label: '',
      colorDegree: getColorDegree(progression.V.root, progression.V.quality),
      group: 'target',
    },
    {
      id: `target-I-${progression.I.root}${progression.I.quality}`,
      chord: progression.I,
      label: '',
      degree: progression.I.degree,
      colorDegree: progression.I.degree,
      group: 'target',
    },
  ];

  const bySignature = new Map<string, ChordOption>();
  [...targetOptions, ...diatonicChords].forEach((option) => {
    const keySig = `${option.chord.root}-${option.chord.quality}`;
    if (!bySignature.has(keySig)) {
      bySignature.set(keySig, option);
    }
  });

  const options = Array.from(bySignature.values());
  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

export function isMinorTargetDegree(targetDegree: TargetDegree): boolean {
  return targetDegree === 2 || targetDegree === 3 || targetDegree === 6;
}

export function getTargetSlotLabels(targetDegree: TargetDegree): { ii: string; V: string; I: string } {
  const labels = getTargetProgressionLabels(targetDegree);
  return { ii: labels.ii, V: labels.V, I: labels.I };
}

/**
 * Generate a new round
 * @param settings - Current game settings
 * @returns A new round with a random key and correct progression
 */
export function generateRound(settings: TonicTargetSettings): TonicTargetRound {
  // Pick a random key from all 12 major keys
  const key = getRandomKey();

  // Determine which target degrees to use
  const availableDegrees: TargetDegree[] = settings.targetDegrees === 'random' || !settings.targetDegrees || settings.targetDegrees.length === 0
    ? [1, 2, 3, 4, 5, 6] as TargetDegree[]
    : settings.targetDegrees;

  // Pick a random target degree from available options
  const targetDegree = getRandomTargetDegree(availableDegrees);

  // Build the correct progression for this key and target
  const correctProgression = buildProgressionToTarget(key, targetDegree);

  // Build chord options for the grid (diatonic + target ii-V-(I/i))
  const availableChords = buildChordOptions(key, targetDegree, correctProgression);

  return {
    key,
    correctProgression,
    availableChords,
    targetDegree,
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
    const labels = getTargetSlotLabels(round.targetDegree);
    feedback = `Please select all three chords (${labels.ii}, ${labels.V}, and ${labels.I}).`;
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
