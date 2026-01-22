/**
 * Session Stats Component
 * Shows subtle session statistics at the bottom
 */

'use client';

import type { SessionStats } from '@/lib/game-engine/types';

interface SessionStatsProps {
  session: SessionStats;
}

export function SessionStatsDisplay({ session }: SessionStatsProps) {
  // Calculate elapsed time
  const elapsedMs = Date.now() - session.startTime.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  
  // Calculate accuracy
  const accuracy = session.roundsCompleted > 0
    ? Math.round((session.roundsCorrect / session.roundsCompleted) * 100)
    : 0;

  return (
    <div className="text-center text-text-muted text-sm">
      <span>{elapsedMinutes} min</span>
      <span className="mx-2">•</span>
      <span>{session.roundsCompleted} rounds</span>
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
