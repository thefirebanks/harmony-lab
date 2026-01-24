/**
 * Progression Slots Component
 * Shows the user's current selection for the target progression
 */

'use client';

import type { Chord } from '@/lib/music/types';
import type { TargetDegree } from '@/games/tonic-target/types';
import { getChordDisplayName } from '@/lib/music';
import { getTargetSlotLabels } from '@/games/tonic-target/logic';

interface ProgressionSlotsProps {
  answer: {
    ii: Chord | null;
    V: Chord | null;
    I: Chord | null;
  };
  onSlotClick: (slot: 'ii' | 'V' | 'I') => void;
  disabled: boolean;
  targetDegree?: TargetDegree;
}

/**
 * Get slot labels based on target degree
 * Each target has a functional progression that leads to it
 */
function getSlotLabels(targetDegree: TargetDegree): Array<{ key: 'ii' | 'V' | 'I'; label: string }> {
  const labels = getTargetSlotLabels(targetDegree);
  return [
    { key: 'ii', label: labels.ii },
    { key: 'V', label: labels.V },
    { key: 'I', label: labels.I },
  ];
}

export function ProgressionSlots({ answer, onSlotClick, disabled, targetDegree = 1 }: ProgressionSlotsProps) {
  const slots = getSlotLabels(targetDegree);

  return (
    <div className="flex items-center justify-center gap-2">
      {slots.map((slot, index) => {
        const chord = answer[slot.key];
        const isEmpty = chord === null;
        
        return (
          <div key={slot.key} className="flex items-center">
            <button
              onClick={() => !isEmpty && onSlotClick(slot.key)}
              disabled={disabled || isEmpty}
              data-testid={`slot-${slot.key}`}
              className={`
                w-24 h-20 rounded-xl border-2 transition-all duration-200
                flex flex-col items-center justify-center gap-1
                ${isEmpty
                  ? 'border-dashed border-text-muted/30 bg-transparent'
                  : 'border-accent/50 bg-accent-muted cursor-pointer hover:bg-accent/20'
                }
                ${disabled ? 'cursor-not-allowed' : ''}
              `}
            >
              <span className="text-xs text-text-muted font-medium">{slot.label}</span>
              <span className="text-lg font-bold text-text-primary">
                {chord ? getChordDisplayName(chord) : '___'}
              </span>
            </button>
            
            {/* Arrow between slots */}
            {index < slots.length - 1 && (
              <span className="text-text-muted mx-2 text-xl">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
