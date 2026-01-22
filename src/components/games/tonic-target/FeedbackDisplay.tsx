/**
 * Feedback Display Component
 * Shows correct/incorrect feedback after submission
 */

'use client';

import type { Progression } from '@/lib/music/types';
import type { TheoryCard } from '@/lib/game-engine/types';
import { getProgressionDisplayString } from '@/lib/music';
import { Button } from '@/components/ui';
import { TheoryCard as TheoryCardDisplay } from '@/components/shared';

interface FeedbackDisplayProps {
  isCorrect: boolean;
  userProgressionString: string;
  correctProgression: Progression;
  theoryCard: TheoryCard | null;
  onHearCorrect: () => void;
  onNextRound: () => void;
  isPlaying: boolean;
}

export function FeedbackDisplay({
  isCorrect,
  userProgressionString,
  correctProgression,
  theoryCard,
  onHearCorrect,
  onNextRound,
  isPlaying,
}: FeedbackDisplayProps) {
  const correctProgressionString = getProgressionDisplayString(correctProgression);

  return (
    <div className="space-y-4" data-testid={isCorrect ? 'feedback-correct' : 'feedback-incorrect'}>
      {/* Result header */}
      <div className={`text-center p-4 rounded-xl ${isCorrect ? 'bg-success-muted' : 'bg-error-muted'}`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={`text-2xl ${isCorrect ? 'text-success' : 'text-error'}`}>
            {isCorrect ? '✓' : '✗'}
          </span>
          <h3 className={`text-xl font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
            {isCorrect ? 'Nice!' : 'Not quite'}
          </h3>
        </div>
        
        {/* Show progression */}
        <p className="text-text-primary font-mono text-lg">
          {correctProgressionString}
        </p>
      </div>

      {/* Show comparison if incorrect */}
      {!isCorrect && (
        <div className="space-y-2 text-center" data-testid="correct-answer">
          <p className="text-text-muted">
            You played: <span className="text-text-primary font-mono">{userProgressionString}</span>
          </p>
          <p className="text-text-muted">
            Correct: <span className="text-success font-mono">{correctProgressionString}</span>
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {!isCorrect && (
          <Button
            variant="secondary"
            onClick={onHearCorrect}
            disabled={isPlaying}
            className="gap-2"
          >
            <span>&#9654;</span>
            Hear Correct
          </Button>
        )}
        
        <Button variant="primary" onClick={onNextRound}>
          Next Round
        </Button>
      </div>

      {/* Theory card (on incorrect) */}
      {!isCorrect && theoryCard && <TheoryCardDisplay card={theoryCard} />}
    </div>
  );
}
