/**
 * Interval Games Configuration
 * GameConfig implementation for Interval Flash
 */

import type { GameConfig, TheoryCard } from '@/lib/game-engine/types';
import type {
  IntervalFlashRound,
  IntervalFlashAnswer,
  IntervalFlashSettings,
} from './types';
import {
  defaultIntervalFlashSettings,
  intervalFlashDifficultyPresets,
  INTERVAL_DISPLAY_NAMES,
} from './types';
import {
  generateFlashRound,
  validateFlashAnswer,
  pitchToNoteString,
  getIntervalShapeDescription,
} from './logic';

/**
 * Get theory card for interval feedback
 */
function getIntervalTheoryCard(round: IntervalFlashRound): TheoryCard {
  const intervalName = INTERVAL_DISPLAY_NAMES[round.interval];
  const shapeDescription = getIntervalShapeDescription(round.interval);

  return {
    id: `interval-${round.interval}`,
    title: intervalName,
    content: `**${intervalName}** (${round.semitones} semitones)

On guitar: ${shapeDescription}

The ${intervalName.toLowerCase()} has a distinctive sound - try to memorize its character rather than counting semitones.`,
  };
}

/**
 * GameConfig for Interval Flash
 */
export const intervalFlashConfig: GameConfig<
  IntervalFlashRound,
  IntervalFlashAnswer,
  IntervalFlashSettings
> = {
  id: 'interval-flash',
  name: 'Interval Flash',
  description:
    'Identify intervals under time pressure to develop intuitive interval recognition.',

  generateRound: generateFlashRound,
  validateAnswer: validateFlashAnswer,

  defaultSettings: defaultIntervalFlashSettings,
  difficultyPresets: intervalFlashDifficultyPresets,

  getRoundAudio: (round) => {
    // Play root note, then target note (melodic interval)
    return [
      {
        type: 'note',
        data: pitchToNoteString(round.rootNote),
        timing: 0,
      },
      {
        type: 'note',
        data: pitchToNoteString(round.targetNote),
        timing: 400, // 400ms delay between notes
      },
    ];
  },

  getAnswerAudio: () => {
    // No special audio for answer
    return [];
  },

  getCorrectAudio: (round) => {
    // Replay the interval
    return [
      {
        type: 'note',
        data: pitchToNoteString(round.rootNote),
        timing: 0,
      },
      {
        type: 'note',
        data: pitchToNoteString(round.targetNote),
        timing: 400,
      },
    ];
  },

  getTheoryCards: (round) => {
    // Always show theory card on feedback (helpful for learning)
    return [getIntervalTheoryCard(round)];
  },
};
