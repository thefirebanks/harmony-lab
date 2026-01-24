/**
 * Note Identification Game Types
 */

import type { NoteName } from '@/lib/music/types';
import type { DifficultyLevel } from '@/lib/game-engine/types';

export type NotePool = 'natural' | 'chromatic';

export interface NoteIdentificationRound {
  targetNote: NoteName;
  targetPitch: string;
  options: NoteName[];
}

export type NoteIdentificationAnswer = NoteName | null;

export interface NoteIdentificationSettings {
  difficulty: DifficultyLevel;
  notePool: NotePool;
  optionsCount: number;
  autoPlayNote: boolean;
  sessionMode: 'rounds' | 'time';
  roundsPerSession: number;
  timeLimitSeconds: number;
}

export const defaultNoteIdentificationSettings: NoteIdentificationSettings = {
  difficulty: 1,
  notePool: 'natural',
  optionsCount: 3,
  autoPlayNote: true,
  sessionMode: 'rounds',
  roundsPerSession: 10,
  timeLimitSeconds: 600,
};

export const difficultyPresets: Record<DifficultyLevel, Partial<NoteIdentificationSettings>> = {
  1: { notePool: 'natural', optionsCount: 3, autoPlayNote: true },
  2: { notePool: 'chromatic', optionsCount: 4, autoPlayNote: true },
  3: { notePool: 'chromatic', optionsCount: 6, autoPlayNote: true },
  4: { notePool: 'chromatic', optionsCount: 8, autoPlayNote: true },
  5: { notePool: 'chromatic', optionsCount: 8, autoPlayNote: false },
};
