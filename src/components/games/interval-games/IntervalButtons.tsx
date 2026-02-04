/**
 * Interval Buttons Component
 * Answer button grid for selecting intervals
 */

'use client';

import type { IntervalName } from '@/games/interval-games/types';
import { INTERVAL_SEMITONES } from '@/games/interval-games/types';

interface IntervalButtonsProps {
  options: IntervalName[];
  selectedAnswer: IntervalName | null;
  correctAnswer?: IntervalName;
  showCorrect: boolean;
  disabled: boolean;
  showSemitones: boolean;
  onSelect: (interval: IntervalName) => void;
}

export function IntervalButtons({
  options,
  selectedAnswer,
  correctAnswer,
  showCorrect,
  disabled,
  showSemitones,
  onSelect,
}: IntervalButtonsProps) {
  const getButtonClasses = (interval: IntervalName) => {
    const base =
      'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 min-w-[80px]';

    if (showCorrect) {
      // Show feedback state
      if (interval === correctAnswer) {
        return `${base} bg-green-500/20 border-green-500 text-green-400`;
      }
      if (interval === selectedAnswer && interval !== correctAnswer) {
        return `${base} bg-red-500/20 border-red-500 text-red-400`;
      }
      return `${base} bg-[var(--background-elevated)] border-[var(--text-muted)]/20 text-[var(--text-muted)] opacity-50`;
    }

    if (interval === selectedAnswer) {
      return `${base} bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]`;
    }

    return `${base} bg-[var(--background-elevated)] border-[var(--text-muted)]/30 text-[var(--text-primary)] hover:border-[var(--accent)]/50 hover:bg-[var(--background-hover)]`;
  };

  return (
    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
      {options.map((interval) => (
        <button
          key={interval}
          onClick={() => !disabled && onSelect(interval)}
          disabled={disabled}
          className={getButtonClasses(interval)}
        >
          <span className="text-lg font-bold">{interval}</span>
          {showSemitones && (
            <span className="text-xs text-[var(--text-muted)] mt-1">
              {INTERVAL_SEMITONES[interval]} st
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
