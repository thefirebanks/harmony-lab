/**
 * Note Identification Game Logic
 */

import type { NoteName } from '@/lib/music/types';
import type { ValidationResult } from '@/lib/game-engine/types';
import { CHROMATIC_NOTES } from '@/lib/music';
import type { NoteIdentificationRound, NoteIdentificationSettings, NoteIdentificationAnswer, NotePool } from './types';

const NATURAL_NOTES: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const OCTAVE_RANGE = { min: 3, max: 5 };

function getNotePool(notePool: NotePool): NoteName[] {
  return notePool === 'natural' ? NATURAL_NOTES : CHROMATIC_NOTES;
}

function getRandomNote(notes: NoteName[]): NoteName {
  return notes[Math.floor(Math.random() * notes.length)];
}

function getRandomOctave(): number {
  return Math.floor(Math.random() * (OCTAVE_RANGE.max - OCTAVE_RANGE.min + 1)) + OCTAVE_RANGE.min;
}

function buildOptions(targetNote: NoteName, pool: NoteName[], count: number): NoteName[] {
  const uniqueCount = Math.min(count, pool.length);
  const options = new Set<NoteName>([targetNote]);

  while (options.size < uniqueCount) {
    options.add(getRandomNote(pool));
  }

  const optionList = Array.from(options);
  for (let i = optionList.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [optionList[i], optionList[j]] = [optionList[j], optionList[i]];
  }

  return optionList;
}

export function generateRound(settings: NoteIdentificationSettings): NoteIdentificationRound {
  const pool = getNotePool(settings.notePool);
  const targetNote = getRandomNote(pool);
  const targetPitch = `${targetNote}${getRandomOctave()}`;
  const options = buildOptions(targetNote, pool, settings.optionsCount);

  return {
    targetNote,
    targetPitch,
    options,
  };
}

export function validateAnswer(
  round: NoteIdentificationRound,
  answer: NoteIdentificationAnswer
): ValidationResult {
  if (!answer) {
    return {
      isCorrect: false,
      feedback: 'Pick a note to lock in your answer.',
    };
  }

  const isCorrect = answer === round.targetNote;

  return {
    isCorrect,
    feedback: isCorrect ? 'Nice!' : `It was ${round.targetNote}.`,
    correctAnswer: round.targetNote,
  };
}
