/**
 * Session Summary Component
 * Shows final session statistics when session is complete
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import type { SessionStats } from '@/lib/game-engine/types';

interface SessionSummaryProps {
  session: SessionStats;
  onStartNewSession: () => void;
  onViewProgress: () => void;
}

export function SessionSummary({ session, onStartNewSession, onViewProgress }: SessionSummaryProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Calculate elapsed time once when session completes
  useEffect(() => {
    const elapsedMs = Date.now() - session.startTime.getTime();
    setElapsedMinutes(Math.floor(elapsedMs / 60000));
  }, [session.startTime]);

  const accuracy = session.roundsCompleted > 0
    ? Math.round((session.roundsCorrect / session.roundsCompleted) * 100)
    : 0;

  return (
    <Card className="p-8 text-center">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Session Complete!
          </h2>
          <p className="text-text-muted">
            {session.currentRound - 1} {session.currentRound - 1 === 1 ? 'round' : 'rounds'} completed
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">{accuracy}%</div>
            <div className="text-sm text-text-muted">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-text-primary">
              {session.roundsCorrect}/{session.roundsCompleted}
            </div>
            <div className="text-sm text-text-muted">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success">
              {session.currentStreak}
            </div>
            <div className="text-sm text-text-muted">Best Streak</div>
          </div>
        </div>

        <div className="text-sm text-text-muted">
          Duration: {elapsedMinutes} {elapsedMinutes === 1 ? 'minute' : 'minutes'}
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="button"
            onClick={onStartNewSession}
            className="w-full py-3 bg-accent text-background rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            Start New Session
          </button>
          <button
            type="button"
            onClick={onViewProgress}
            className="w-full py-3 border border-text-muted/30 text-text-primary rounded-lg font-medium hover:bg-background-elevated transition-colors"
          >
            View Progress
          </button>
        </div>
      </div>
    </Card>
  );
}
