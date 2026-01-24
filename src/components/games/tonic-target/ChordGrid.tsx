/**
 * Chord Grid Component
 * Interactive grid of diatonic chords for selection
 */

'use client';

import type { Chord, ScaleDegree } from '@/lib/music/types';
import type { ChordOption } from '@/games/tonic-target/types';
import { getChordDisplayName, getSimpleVoicing, getSimpleVoicingWithBass, DEGREE_TO_ROMAN } from '@/lib/music';
import { playChord } from '@/lib/audio';
import { useSettingsStore } from '@/stores';

interface ChordGridProps {
  chords: ChordOption[];
  onChordSelect: (chord: Chord) => void;
  showChordNames: boolean;
  showRomanNumerals: boolean;
  showColors: boolean;
  disabled: boolean;
  selectedChords: {
    ii: Chord | null;
    V: Chord | null;
    I: Chord | null;
  };
}

// CSS classes for degree colors
const degreeColorClasses: Record<ScaleDegree, string> = {
  1: 'bg-[#fef3c7]/20 border-[#fef3c7]/50 hover:bg-[#fef3c7]/30',
  2: 'bg-[#c4b5fd]/20 border-[#c4b5fd]/50 hover:bg-[#c4b5fd]/30',
  3: 'bg-[#bbf7d0]/20 border-[#bbf7d0]/50 hover:bg-[#bbf7d0]/30',
  4: 'bg-[#fed7aa]/20 border-[#fed7aa]/50 hover:bg-[#fed7aa]/30',
  5: 'bg-[#fca5a5]/20 border-[#fca5a5]/50 hover:bg-[#fca5a5]/30',
  6: 'bg-[#93c5fd]/20 border-[#93c5fd]/50 hover:bg-[#93c5fd]/30',
  7: 'bg-[#d4d4d8]/20 border-[#d4d4d8]/50 hover:bg-[#d4d4d8]/30',
};

const degreeTextColors: Record<ScaleDegree, string> = {
  1: 'text-[#fef3c7]',
  2: 'text-[#c4b5fd]',
  3: 'text-[#bbf7d0]',
  4: 'text-[#fed7aa]',
  5: 'text-[#fca5a5]',
  6: 'text-[#93c5fd]',
  7: 'text-[#d4d4d8]',
};

export function ChordGrid({
  chords,
  onChordSelect,
  showChordNames,
  showRomanNumerals,
  showColors,
  disabled,
  selectedChords,
}: ChordGridProps) {
  const settings = useSettingsStore((s) => s.tonicTarget);

  // Play a chord when clicked
  const playChordSound = async (chord: Chord) => {
    const voicing = settings.includeBassNote
      ? getSimpleVoicingWithBass(chord)
      : getSimpleVoicing(chord, 4);
    await playChord(voicing, '4n');
  };

  // Handle chord click: play sound and select
  const handleChordClick = (chord: Chord) => {
    playChordSound(chord);
    onChordSelect(chord);
  };

  // Check if a chord is selected (any slot)
  const getSelectionSlot = (chord: Chord): 'ii' | 'V' | 'I' | null => {
    if (selectedChords.ii?.root === chord.root && selectedChords.ii?.quality === chord.quality) {
      return 'ii';
    }
    if (selectedChords.V?.root === chord.root && selectedChords.V?.quality === chord.quality) {
      return 'V';
    }
    if (selectedChords.I?.root === chord.root && selectedChords.I?.quality === chord.quality) {
      return 'I';
    }
    return null;
  };

  const diatonicOptions = chords.filter((option) => option.degree);
  const nonDiatonicOptions = chords.filter((option) => !option.degree);

  const renderChordButton = (option: ChordOption) => {
    const selectionSlot = getSelectionSlot(option.chord);
    const isSelected = selectionSlot !== null;
    const colorKey = option.colorDegree ?? option.degree;
    const colorClass = showColors && colorKey
      ? degreeColorClasses[colorKey]
      : 'bg-background-elevated border-text-muted/30 hover:bg-background-hover';

    const textColor = showColors && !isSelected && colorKey
      ? degreeTextColors[colorKey]
      : 'text-text-primary';
    const secondaryLabel = showRomanNumerals && option.degree ? DEGREE_TO_ROMAN[option.degree] : '';

    return (
      <button
        key={option.id}
        onClick={() => handleChordClick(option.chord)}
        disabled={disabled || isSelected}
        data-testid={`chord-option-${option.id}`}
        className={`
          relative px-4 py-3 rounded-xl border-2 transition-all duration-200
          min-w-[80px] font-medium
          ${colorClass}
          ${textColor}
          ${isSelected ? 'ring-2 ring-accent ring-offset-2 ring-offset-background opacity-75' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          hover:scale-105 active:scale-95
        `}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold">
            {showChordNames
              ? getChordDisplayName(option.chord)
              : (secondaryLabel || getChordDisplayName(option.chord))}
          </span>
          {showChordNames && secondaryLabel && (
            <span className="text-xs text-text-muted">
              {secondaryLabel}
            </span>
          )}
        </div>
        
        {/* Selection badge */}
        {isSelected && (
          <span className="absolute -top-2 -right-2 bg-accent text-background text-xs font-bold px-2 py-0.5 rounded-full">
            {selectionSlot}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {[...diatonicOptions, ...nonDiatonicOptions].map(renderChordButton)}
    </div>
  );
}
