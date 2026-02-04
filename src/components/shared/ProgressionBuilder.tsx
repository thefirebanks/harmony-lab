/**
 * ProgressionBuilder Component
 * Build custom chord progressions by clicking diatonic chords
 * For use in solo visualizer, backing tracks, etc.
 */

'use client';

import { useState } from 'react';
import type { Chord, NoteName, ScaleDegree, ChordExtensionLevel } from '@/lib/music/types';
import { getAllDiatonicChords, getChordDisplayName } from '@/lib/music/chords';
import { DEGREE_TO_ROMAN, CHROMATIC_NOTES, MINOR_DEGREE_TO_ROMAN } from '@/lib/music/constants';
import { getSimpleVoicing, getSimpleVoicingWithBass } from '@/lib/music/voicings';
import { playChord } from '@/lib/audio/playback';

interface ProgressionChord {
  chord: Chord;
  beats: number;
}

interface ProgressionBuilderProps {
  /** Current key tonic */
  keyTonic: NoteName;
  /** Callback when key changes */
  onKeyChange: (key: NoteName) => void;
  /** Current progression */
  progression: ProgressionChord[];
  /** Callback when progression changes */
  onProgressionChange: (progression: ProgressionChord[]) => void;
  /** Maximum number of chords allowed */
  maxChords?: number;
  /** Whether to show chord names or just roman numerals */
  showChordNames?: boolean;
  /** Show colors for scale degrees */
  showColors?: boolean;
  /** Whether to play sounds on click */
  playOnClick?: boolean;
  /** Include bass note when playing */
  includeBassNote?: boolean;
  /** Chord extension level - triads or 7th chords */
  extensionLevel?: ChordExtensionLevel;
  /** Callback when extension level changes */
  onExtensionLevelChange?: (level: ChordExtensionLevel) => void;
  /** Key mode - major or minor */
  mode?: 'major' | 'minor';
  /** Callback when mode changes */
  onModeChange?: (mode: 'major' | 'minor') => void;
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

export function ProgressionBuilder({
  keyTonic,
  onKeyChange,
  progression,
  onProgressionChange,
  maxChords = 8,
  showChordNames = true,
  showColors = true,
  playOnClick = true,
  includeBassNote = true,
  extensionLevel = '7ths',
  onExtensionLevelChange,
  mode = 'major',
  onModeChange,
}: ProgressionBuilderProps) {
  // Get diatonic chords for the current key with the selected extension level and mode
  const diatonicChords = getAllDiatonicChords(keyTonic, extensionLevel, mode);
  
  // Get the appropriate roman numerals based on mode
  const romanNumerals = mode === 'minor' ? MINOR_DEGREE_TO_ROMAN : DEGREE_TO_ROMAN;

  // Play a chord sound
  const playChordSound = async (chord: Chord) => {
    if (!playOnClick) return;
    const voicing = includeBassNote
      ? getSimpleVoicingWithBass(chord)
      : getSimpleVoicing(chord, 4);
    await playChord(voicing, '4n');
  };

  // Add a chord to the progression
  const handleAddChord = (chord: Chord) => {
    if (progression.length >= maxChords) return;
    
    playChordSound(chord);
    onProgressionChange([
      ...progression,
      { chord, beats: 4 }, // Default to 4 beats
    ]);
  };

  // Remove a chord from the progression
  const handleRemoveChord = (index: number) => {
    const newProgression = [...progression];
    newProgression.splice(index, 1);
    onProgressionChange(newProgression);
  };

  // Clear the entire progression
  const handleClear = () => {
    onProgressionChange([]);
  };

  // Render a chord button in the selection grid
  const renderChordButton = (chord: Chord, index: number) => {
    const degree = chord.degree;
    const colorClass = showColors 
      ? degreeColorClasses[degree] 
      : 'bg-background-elevated border-text-muted/30 hover:bg-background-hover';
    const textColor = showColors 
      ? degreeTextColors[degree] 
      : 'text-text-primary';
    const isDisabled = progression.length >= maxChords;

    return (
      <button
        key={`chord-${degree}`}
        onClick={() => handleAddChord(chord)}
        disabled={isDisabled}
        className={`
          px-4 py-3 rounded-xl border-2 transition-all duration-200
          min-w-[80px] font-medium
          ${colorClass}
          ${textColor}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
        `}
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-bold">
            {showChordNames ? getChordDisplayName(chord) : romanNumerals[degree]}
          </span>
          {showChordNames && (
            <span className="text-xs text-text-muted">
              {romanNumerals[degree]}
            </span>
          )}
        </div>
      </button>
    );
  };

  // Render a chord in the progression display
  const renderProgressionChord = (item: ProgressionChord, index: number) => {
    const { chord } = item;
    const degree = chord.degree;
    const textColor = showColors ? degreeTextColors[degree] : 'text-text-primary';
    
    return (
      <div
        key={`prog-${index}`}
        className="relative group"
      >
        <div 
          className={`
            px-4 py-2 rounded-lg bg-background-elevated border border-text-muted/30
            ${textColor}
          `}
        >
          <span className="font-bold">
            {showChordNames ? getChordDisplayName(chord) : romanNumerals[degree]}
          </span>
        </div>
        
        {/* Remove button */}
        <button
          onClick={() => handleRemoveChord(index)}
          className="
            absolute -top-2 -right-2 
            w-5 h-5 rounded-full 
            bg-error text-background 
            text-xs font-bold
            opacity-0 group-hover:opacity-100
            transition-opacity
            hover:scale-110
          "
        >
          ×
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Key selector, mode, and extension level */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-secondary">Key:</label>
          <select
            value={keyTonic}
            onChange={(e) => onKeyChange(e.target.value as NoteName)}
            className="
              px-3 py-2 rounded-lg
              bg-background-elevated border border-text-muted/30
              text-text-primary
              focus:outline-none focus:ring-2 focus:ring-accent
            "
          >
            {CHROMATIC_NOTES.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>
        
        {/* Mode toggle (Major/Minor) */}
        {onModeChange && (
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-text-muted/30">
              <button
                onClick={() => onModeChange('major')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  mode === 'major'
                    ? 'bg-accent text-background'
                    : 'bg-background-elevated text-text-secondary hover:bg-background-hover'
                }`}
              >
                Major
              </button>
              <button
                onClick={() => onModeChange('minor')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  mode === 'minor'
                    ? 'bg-accent text-background'
                    : 'bg-background-elevated text-text-secondary hover:bg-background-hover'
                }`}
              >
                Minor
              </button>
            </div>
          </div>
        )}
        
        {/* Extension level toggle */}
        {onExtensionLevelChange && (
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-text-muted/30">
              <button
                onClick={() => onExtensionLevelChange('triads')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  extensionLevel === 'triads'
                    ? 'bg-accent text-background'
                    : 'bg-background-elevated text-text-secondary hover:bg-background-hover'
                }`}
              >
                Triads
              </button>
              <button
                onClick={() => onExtensionLevelChange('7ths')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  extensionLevel === '7ths'
                    ? 'bg-accent text-background'
                    : 'bg-background-elevated text-text-secondary hover:bg-background-hover'
                }`}
              >
                7ths
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chord selection grid */}
      <div>
        <p className="text-sm text-text-secondary mb-2">
          Click chords to build your progression:
        </p>
        <div className="flex flex-wrap gap-3">
          {diatonicChords.map((chord, i) => renderChordButton(chord, i))}
        </div>
      </div>

      {/* Current progression display */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-text-secondary">
            Your progression ({progression.length}/{maxChords}):
          </p>
          {progression.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-text-muted hover:text-error transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
        
        {progression.length === 0 ? (
          <div className="py-4 px-6 rounded-lg border-2 border-dashed border-text-muted/30 text-text-muted text-center">
            Click chords above to start building
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-background-elevated/50">
            {progression.map((item, i) => renderProgressionChord(item, i))}
          </div>
        )}
      </div>

      {/* Quick presets */}
      <div>
        <p className="text-sm text-text-secondary mb-2">Quick presets:</p>
        <div className="flex flex-wrap gap-2">
          {mode === 'major' ? (
            <>
              <button
                onClick={() => {
                  const chords = getAllDiatonicChords(keyTonic, extensionLevel, mode);
                  onProgressionChange([
                    { chord: chords[0], beats: 4 }, // I
                    { chord: chords[4], beats: 4 }, // V
                    { chord: chords[5], beats: 4 }, // vi
                    { chord: chords[3], beats: 4 }, // IV
                  ]);
                }}
                className="px-3 py-1 text-sm rounded-lg bg-background-elevated border border-text-muted/30 text-text-secondary hover:bg-background-hover transition-colors"
              >
                I-V-vi-IV
              </button>
              <button
                onClick={() => {
                  const chords = getAllDiatonicChords(keyTonic, extensionLevel, mode);
                  onProgressionChange([
                    { chord: chords[1], beats: 4 }, // ii
                    { chord: chords[4], beats: 4 }, // V
                    { chord: chords[0], beats: 4 }, // I
                  ]);
                }}
                className="px-3 py-1 text-sm rounded-lg bg-background-elevated border border-text-muted/30 text-text-secondary hover:bg-background-hover transition-colors"
              >
                ii-V-I
              </button>
              <button
                onClick={() => {
                  const chords = getAllDiatonicChords(keyTonic, extensionLevel, mode);
                  onProgressionChange([
                    { chord: chords[0], beats: 4 }, // I
                    { chord: chords[3], beats: 4 }, // IV
                    { chord: chords[4], beats: 4 }, // V
                    { chord: chords[0], beats: 4 }, // I
                  ]);
                }}
                className="px-3 py-1 text-sm rounded-lg bg-background-elevated border border-text-muted/30 text-text-secondary hover:bg-background-hover transition-colors"
              >
                I-IV-V-I
              </button>
              <button
                onClick={() => {
                  const chords = getAllDiatonicChords(keyTonic, extensionLevel, mode);
                  onProgressionChange([
                    { chord: chords[5], beats: 4 }, // vi
                    { chord: chords[3], beats: 4 }, // IV
                    { chord: chords[0], beats: 4 }, // I
                    { chord: chords[4], beats: 4 }, // V
                  ]);
                }}
                className="px-3 py-1 text-sm rounded-lg bg-background-elevated border border-text-muted/30 text-text-secondary hover:bg-background-hover transition-colors"
              >
                vi-IV-I-V
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  const chords = getAllDiatonicChords(keyTonic, extensionLevel, mode);
                  onProgressionChange([
                    { chord: chords[0], beats: 4 }, // i
                    { chord: chords[6], beats: 4 }, // VII
                    { chord: chords[5], beats: 4 }, // VI
                    { chord: chords[4], beats: 4 }, // v
                  ]);
                }}
                className="px-3 py-1 text-sm rounded-lg bg-background-elevated border border-text-muted/30 text-text-secondary hover:bg-background-hover transition-colors"
              >
                i-VII-VI-v
              </button>
              <button
                onClick={() => {
                  const chords = getAllDiatonicChords(keyTonic, extensionLevel, mode);
                  onProgressionChange([
                    { chord: chords[0], beats: 4 }, // i
                    { chord: chords[3], beats: 4 }, // iv
                    { chord: chords[4], beats: 4 }, // v
                    { chord: chords[0], beats: 4 }, // i
                  ]);
                }}
                className="px-3 py-1 text-sm rounded-lg bg-background-elevated border border-text-muted/30 text-text-secondary hover:bg-background-hover transition-colors"
              >
                i-iv-v-i
              </button>
              <button
                onClick={() => {
                  const chords = getAllDiatonicChords(keyTonic, extensionLevel, mode);
                  onProgressionChange([
                    { chord: chords[0], beats: 4 }, // i
                    { chord: chords[5], beats: 4 }, // VI
                    { chord: chords[2], beats: 4 }, // III
                    { chord: chords[6], beats: 4 }, // VII
                  ]);
                }}
                className="px-3 py-1 text-sm rounded-lg bg-background-elevated border border-text-muted/30 text-text-secondary hover:bg-background-hover transition-colors"
              >
                i-VI-III-VII
              </button>
              <button
                onClick={() => {
                  const chords = getAllDiatonicChords(keyTonic, extensionLevel, mode);
                  onProgressionChange([
                    { chord: chords[0], beats: 4 }, // i
                    { chord: chords[3], beats: 4 }, // iv
                    { chord: chords[6], beats: 4 }, // VII
                    { chord: chords[2], beats: 4 }, // III
                  ]);
                }}
                className="px-3 py-1 text-sm rounded-lg bg-background-elevated border border-text-muted/30 text-text-secondary hover:bg-background-hover transition-colors"
              >
                i-iv-VII-III
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressionBuilder;
