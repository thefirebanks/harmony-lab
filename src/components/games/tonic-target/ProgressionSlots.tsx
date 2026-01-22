/**
 * Progression Slots Component
 * Shows the user's current ii-V-I selection
 */

'use client';

import type { Chord } from '@/lib/music/types';
import { getChordDisplayName } from '@/lib/music';

interface ProgressionSlotsProps {
  answer: {
    ii: Chord | null;
    V: Chord | null;
    I: Chord | null;
  };
  onSlotClick: (slot: 'ii' | 'V' | 'I') => void;
  disabled: boolean;
}

export function ProgressionSlots({ answer, onSlotClick, disabled }: ProgressionSlotsProps) {
  const slots: Array<{ key: 'ii' | 'V' | 'I'; label: string }> = [
    { key: 'ii', label: 'ii' },
    { key: 'V', label: 'V' },
    { key: 'I', label: 'I' },
  ];

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
