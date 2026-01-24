/**
 * Session Stats Component
 * Shows subtle session statistics at the bottom
 */

'use client';

import { useState, useEffect } from 'react';
import type { SessionStats } from '@/lib/game-engine/types';

interface SessionStatsProps {
  session: SessionStats;
  totalRounds?: number;
  sessionMode: 'rounds' | 'time';
  timeLimitSeconds: number;
}

export function SessionStatsDisplay({ session, totalRounds, sessionMode, timeLimitSeconds }: SessionStatsProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Update elapsed time every second
  useEffect(() => {
    const updateElapsed = () => {
      const elapsedMs = Date.now() - session.startTime.getTime();
      setElapsedSeconds(Math.floor(elapsedMs / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session.startTime]);

  // Calculate accuracy
  const accuracy = session.roundsCompleted > 0
    ? Math.round((session.roundsCorrect / session.roundsCompleted) * 100)
    : 0;

  // Format round display
  const totalIsFinite = typeof totalRounds === 'number' && totalRounds > 0;
  const roundDisplay = totalIsFinite
    ? `Round ${session.currentRound}/${totalRounds}`
    : `Round ${session.currentRound}`;
  const roundsRemaining = totalIsFinite
    ? Math.max(totalRounds - (session.currentRound - 1), 0)
    : null;
  const remainingSeconds = Math.max(timeLimitSeconds - elapsedSeconds, 0);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = String(remainingSeconds % 60).padStart(2, '0');

  return (
    <div className="text-center text-text-muted text-sm">
      {sessionMode === 'rounds' ? (
        <>
          <span>{roundDisplay}</span>
          <span className="mx-2">•</span>
          <span>{roundsRemaining} left</span>
        </>
      ) : (
        <>
          <span>Time left {minutes}:{seconds}</span>
          <span className="mx-2">•</span>
          <span>{session.roundsCompleted} completed</span>
        </>
      )}
      <span className="mx-2">•</span>
      <span>{accuracy}% accuracy</span>
      {session.currentStreak > 2 && (
        <>
          <span className="mx-2">•</span>
          <span className="text-accent">{session.currentStreak} streak</span>
        </>
      )}
    </div>
  );
}
