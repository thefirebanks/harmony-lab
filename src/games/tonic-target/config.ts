/**
 * Tonic Target Game Configuration
 * Full game config following the GameConfig interface
 */

import type { GameConfig, AudioCue, TheoryCard } from '@/lib/game-engine/types';
import type { TonicTargetRound, TonicTargetAnswer, TonicTargetSettings } from './types';
import { defaultTonicTargetSettings, difficultyPresets } from './types';
import { generateRound, validateAnswer } from './logic';
import { getSimpleVoicingWithBass, getVoicing } from '@/lib/music';
import { getRandomTheoryCard } from './theoryCards';

export const tonicTargetConfig: GameConfig<
  TonicTargetRound,
  TonicTargetAnswer,
  TonicTargetSettings
> = {
  id: 'tonic-target',
  name: 'Tonic Target Practice',
  description: 'Build ii-V-I progressions in random keys to develop functional harmony intuition',
  
  generateRound,
  validateAnswer,
  
  defaultSettings: defaultTonicTargetSettings,
  difficultyPresets,
  
  getRoundAudio: (round): AudioCue[] => [{
    type: 'chord',
    data: getSimpleVoicingWithBass(round.correctProgression.I),
  }],
  
  getAnswerAudio: (answer): AudioCue[] => {
    if (!answer.ii || !answer.V || !answer.I) {
      return [];
    }
    
    return [{
      type: 'progression',
      data: [
        getSimpleVoicingWithBass(answer.ii),
        getSimpleVoicingWithBass(answer.V),
        getSimpleVoicingWithBass(answer.I),
      ],
    }];
  },
  
  getCorrectAudio: (round): AudioCue[] => [{
    type: 'progression',
    data: [
      getSimpleVoicingWithBass(round.correctProgression.ii),
      getSimpleVoicingWithBass(round.correctProgression.V),
      getSimpleVoicingWithBass(round.correctProgression.I),
    ],
  }],
  
  getTheoryCards: (round, wasCorrect): TheoryCard[] => {
    if (wasCorrect) return [];
    // Show a random theory card on incorrect answer
    return [getRandomTheoryCard()];
  },
};
