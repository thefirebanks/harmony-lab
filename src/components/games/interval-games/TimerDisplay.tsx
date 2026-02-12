/**
 * Timer Display Component
 * Shows countdown timer with visual urgency feedback
 */

'use client';

interface TimerDisplayProps {
  timeRemaining: number; // milliseconds
  totalTime: number; // milliseconds
  isActive: boolean;
}

export function TimerDisplay({ timeRemaining, totalTime, isActive }: TimerDisplayProps) {
  const seconds = timeRemaining / 1000;
  const percentage = (timeRemaining / totalTime) * 100;

  // Determine urgency level based on time remaining
  const isUrgent = percentage < 30;
  const isWarning = percentage < 50 && !isUrgent;

  // Color classes based on urgency
  const getColorClass = () => {
    if (isUrgent) return 'text-red-500';
    if (isWarning) return 'text-yellow-500';
    return 'text-[var(--accent)]';
  };

  const getBarColorClass = () => {
    if (isUrgent) return 'bg-red-500';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-[var(--accent)]';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Timer value */}
      <div className={`text-4xl font-bold tabular-nums ${getColorClass()}`}>
        {seconds.toFixed(1)}s
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[200px] h-2 bg-[var(--background-elevated)] rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColorClass()} transition-all duration-100`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status indicator */}
      {!isActive && timeRemaining > 0 && (
        <span className="text-sm text-[var(--text-muted)]">Paused</span>
      )}
    </div>
  );
}
