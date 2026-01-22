/**
 * Game Engine Types
 * Generic types for the game engine framework
 */

import type { Voicing, Pitch } from '../music/types';

/**
 * Difficulty levels (1-5)
 */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Result of validating an answer
 */
export interface ValidationResult {
  isCorrect: boolean;
  feedback?: string;
  correctAnswer?: unknown;
}

/**
 * Audio cue for playback
 */
export interface AudioCue {
  type: 'chord' | 'progression' | 'note';
  data: Voicing | Voicing[] | Pitch | string;
  timing?: number; // Delay in ms
}

/**
 * Theory card for contextual learning
 */
export interface TheoryCard {
  id: string;
  title: string;
  content: string;
  diagram?: string; // ASCII art or reference to image
}

/**
 * Session statistics
 */
export interface SessionStats {
  startTime: Date;
  roundsCompleted: number;
  roundsCorrect: number;
  currentStreak: number;
}

/**
 * Game configuration interface
 * Each game implements this interface to define its behavior
 */
export interface GameConfig<TRound, TAnswer, TSettings> {
  // Metadata
  id: string;
  name: string;
  description: string;
  
  // Round lifecycle
  generateRound: (settings: TSettings) => TRound;
  validateAnswer: (round: TRound, answer: TAnswer) => ValidationResult;
  
  // Settings
  defaultSettings: TSettings;
  difficultyPresets: Record<DifficultyLevel, Partial<TSettings>>;
  
  // Audio
  getRoundAudio: (round: TRound) => AudioCue[];
  getAnswerAudio: (answer: TAnswer) => AudioCue[];
  getCorrectAudio: (round: TRound) => AudioCue[];
  
  // Theory integration
  getTheoryCards: (round: TRound, wasCorrect: boolean) => TheoryCard[];
}

/**
 * Game state
 */
export interface GameState<TRound, TAnswer> {
  round: TRound | null;
  answer: TAnswer | null;
  feedback: ValidationResult | null;
  session: SessionStats;
  isPlaying: boolean;
}

/**
 * Game actions
 */
export interface GameActions<TRound, TAnswer> {
  startRound: () => void;
  submitAnswer: (answer: TAnswer) => void;
  playCorrectAnswer: () => void;
  nextRound: () => void;
  resetSession: () => void;
}

/**
 * Create initial session stats
 */
export function createInitialSession(): SessionStats {
  return {
    startTime: new Date(),
    roundsCompleted: 0,
    roundsCorrect: 0,
    currentStreak: 0,
  };
}
