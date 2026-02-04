/**
 * ProgressionBuilder Component
 * Build custom chord progressions by typing roman numerals or clicking presets
 * Supports inline editing and insertion of chords
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Chord, NoteName, ScaleDegree } from '@/lib/music/types';
import { getChordDisplayName } from '@/lib/music/chords';
import { CHROMATIC_NOTES } from '@/lib/music/constants';
import { getSimpleVoicing, getSimpleVoicingWithBass } from '@/lib/music/voicings';
import { playChord } from '@/lib/audio/playback';
import {
  parseProgression,
  parseRomanNumeral,
  romanNumeralToChord,
  chordToRomanNumeral,
  getFormatHint,
  validateChordInput,
} from '@/lib/music/chordParser';

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

const degreeBorderColors: Record<ScaleDegree, string> = {
  1: 'border-[#fef3c7]/50',
  2: 'border-[#c4b5fd]/50',
  3: 'border-[#bbf7d0]/50',
  4: 'border-[#fed7aa]/50',
  5: 'border-[#fca5a5]/50',
  6: 'border-[#93c5fd]/50',
  7: 'border-[#d4d4d8]/50',
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
  mode = 'major',
  onModeChange,
}: ProgressionBuilderProps) {
  // Text input state
  const [textInput, setTextInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  
  // Inline edit state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  
  // Insertion state
  const [insertingAtIndex, setInsertingAtIndex] = useState<number | null>(null);
  const [insertValue, setInsertValue] = useState('');
  const [insertError, setInsertError] = useState<string | null>(null);
  const insertInputRef = useRef<HTMLInputElement>(null);
  
  // Hover state for insertion points
  const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);

  // Focus edit input when it appears
  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingIndex]);

  // Focus insert input when it appears
  useEffect(() => {
    if (insertingAtIndex !== null && insertInputRef.current) {
      insertInputRef.current.focus();
    }
  }, [insertingAtIndex]);

  // Play a chord sound
  const playChordSound = useCallback(async (chord: Chord) => {
    if (!playOnClick) return;
    const voicing = includeBassNote
      ? getSimpleVoicingWithBass(chord)
      : getSimpleVoicing(chord, 4);
    await playChord(voicing, '4n');
  }, [playOnClick, includeBassNote]);

  // Add chords from text input
  const handleAddFromText = () => {
    if (!textInput.trim()) return;
    if (progression.length >= maxChords) {
      setInputError(`Maximum ${maxChords} chords allowed`);
      return;
    }

    const result = parseProgression(textInput);
    
    if (result.errors.length > 0) {
      setInputError(result.errors[0].message);
      return;
    }

    if (result.chords.length === 0) {
      setInputError('No valid chords found');
      return;
    }

    // Check if adding these would exceed max
    const availableSlots = maxChords - progression.length;
    const chordsToAdd = result.chords.slice(0, availableSlots);

    // Convert parsed chords to Chord objects
    const newChords: ProgressionChord[] = chordsToAdd.map(parsed => ({
      chord: romanNumeralToChord(parsed, keyTonic, mode),
      beats: 4,
    }));

    // Play the first chord
    if (newChords.length > 0) {
      playChordSound(newChords[0].chord);
    }

    onProgressionChange([...progression, ...newChords]);
    setTextInput('');
    setInputError(null);

    if (result.chords.length > availableSlots) {
      setInputError(`Only added ${availableSlots} chords (max ${maxChords} reached)`);
    }
  };

  // Handle text input keydown
  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFromText();
    } else if (e.key === 'Escape') {
      setTextInput('');
      setInputError(null);
    }
  };

  // Validate text input as user types
  const handleTextChange = (value: string) => {
    setTextInput(value);
    
    // Clear error when typing
    if (inputError) {
      setInputError(null);
    }
    
    // Real-time validation (only show errors after a pause or on submit)
    // For now, we just clear errors while typing
  };

  // Start editing a chord
  const handleStartEdit = (index: number) => {
    const chord = progression[index].chord;
    const romanNumeral = chordToRomanNumeral(chord, keyTonic, mode);
    setEditingIndex(index);
    setEditValue(romanNumeral);
    setEditError(null);
  };

  // Save edited chord
  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const trimmed = editValue.trim();
    if (!trimmed) {
      // Revert on empty (don't delete)
      setEditingIndex(null);
      setEditValue('');
      setEditError(null);
      return;
    }

    const validation = validateChordInput(trimmed);
    if (!validation.isValid) {
      setEditError(validation.error || 'Invalid chord');
      return;
    }

    const parsed = parseRomanNumeral(trimmed);
    if (!parsed) {
      setEditError('Invalid chord');
      return;
    }

    const newChord = romanNumeralToChord(parsed, keyTonic, mode);
    const newProgression = [...progression];
    newProgression[editingIndex] = {
      ...newProgression[editingIndex],
      chord: newChord,
    };

    playChordSound(newChord);
    onProgressionChange(newProgression);
    setEditingIndex(null);
    setEditValue('');
    setEditError(null);
  };

  // Handle edit input keydown
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditValue('');
      setEditError(null);
    }
  };

  // Handle edit input change
  const handleEditChange = (value: string) => {
    setEditValue(value);
    if (editError) {
      setEditError(null);
    }
  };

  // Start inserting at a position
  const handleStartInsert = (index: number) => {
    setInsertingAtIndex(index);
    setInsertValue('');
    setInsertError(null);
    setHoveredInsertIndex(null);
  };

  // Save inserted chord
  const handleSaveInsert = () => {
    if (insertingAtIndex === null) return;

    const trimmed = insertValue.trim();
    if (!trimmed) {
      // Cancel on empty
      setInsertingAtIndex(null);
      setInsertValue('');
      setInsertError(null);
      return;
    }

    if (progression.length >= maxChords) {
      setInsertError(`Maximum ${maxChords} chords reached`);
      return;
    }

    const validation = validateChordInput(trimmed);
    if (!validation.isValid) {
      setInsertError(validation.error || 'Invalid chord');
      return;
    }

    const parsed = parseRomanNumeral(trimmed);
    if (!parsed) {
      setInsertError('Invalid chord');
      return;
    }

    const newChord = romanNumeralToChord(parsed, keyTonic, mode);
    const newProgression = [...progression];
    newProgression.splice(insertingAtIndex, 0, {
      chord: newChord,
      beats: 4,
    });

    playChordSound(newChord);
    onProgressionChange(newProgression);
    setInsertingAtIndex(null);
    setInsertValue('');
    setInsertError(null);
  };

  // Handle insert input keydown
  const handleInsertKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveInsert();
    } else if (e.key === 'Escape') {
      setInsertingAtIndex(null);
      setInsertValue('');
      setInsertError(null);
    }
  };

  // Handle insert input change
  const handleInsertChange = (value: string) => {
    setInsertValue(value);
    if (insertError) {
      setInsertError(null);
    }
  };

  // Remove a chord from the progression
  const handleRemoveChord = (index: number) => {
    const newProgression = [...progression];
    newProgression.splice(index, 1);
    onProgressionChange(newProgression);
    
    // Clear any editing state if we removed the edited chord
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditValue('');
      setEditError(null);
    } else if (editingIndex !== null && editingIndex > index) {
      // Adjust editing index if we removed a chord before it
      setEditingIndex(editingIndex - 1);
    }
  };

  // Clear the entire progression
  const handleClear = () => {
    onProgressionChange([]);
    setEditingIndex(null);
    setEditValue('');
    setEditError(null);
    setInsertingAtIndex(null);
    setInsertValue('');
    setInsertError(null);
  };

  // Load a preset progression
  const handleLoadPreset = (romanNumerals: string) => {
    const result = parseProgression(romanNumerals);
    if (result.success && result.chords.length > 0) {
      const newProgression = result.chords.map(parsed => ({
        chord: romanNumeralToChord(parsed, keyTonic, mode),
        beats: 4,
      }));
      onProgressionChange(newProgression);
      
      // Play the first chord
      if (newProgression.length > 0) {
        playChordSound(newProgression[0].chord);
      }
    }
  };

  // Get roman numeral display for a chord
  const getRomanNumeral = (chord: Chord): string => {
    return chordToRomanNumeral(chord, keyTonic, mode);
  };

  // Render insertion point (the "+" button between chords)
  const renderInsertionPoint = (index: number) => {
    const isHovered = hoveredInsertIndex === index;
    const isInserting = insertingAtIndex === index;
    const isDisabled = progression.length >= maxChords;

    if (isInserting) {
      return (
        <div className="flex flex-col items-center mx-1">
          <input
            ref={insertInputRef}
            type="text"
            value={insertValue}
            onChange={(e) => handleInsertChange(e.target.value)}
            onKeyDown={handleInsertKeyDown}
            onBlur={handleSaveInsert}
            placeholder="V7"
            className={`
              w-16 px-2 py-1 text-sm text-center rounded
              bg-background border-2 transition-colors
              text-text-primary placeholder-text-muted
              focus:outline-none focus:ring-2 focus:ring-accent
              ${insertError ? 'border-error' : 'border-accent'}
            `}
          />
          {insertError && (
            <span className="text-xs text-error mt-1 whitespace-nowrap">
              {insertError}
            </span>
          )}
        </div>
      );
    }

    return (
      <div
        className="relative flex items-center justify-center mx-0.5 h-8"
        onMouseEnter={() => !isDisabled && setHoveredInsertIndex(index)}
        onMouseLeave={() => setHoveredInsertIndex(null)}
      >
        {/* Invisible hover target area */}
        <div className="absolute inset-0 w-6 -mx-1" />
        
        {/* The dot / plus button */}
        <button
          onClick={() => !isDisabled && handleStartInsert(index)}
          disabled={isDisabled}
          className={`
            flex items-center justify-center transition-all duration-200 ease-out
            ${isHovered && !isDisabled
              ? 'w-6 h-6 rounded-full bg-accent text-background text-sm font-bold opacity-100 scale-100'
              : 'w-1.5 h-1.5 rounded-full bg-text-muted/30 opacity-60 scale-100'
            }
            ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-100'}
          `}
          title={isDisabled ? `Maximum ${maxChords} chords` : 'Insert chord'}
        >
          {isHovered && !isDisabled && '+'}
        </button>
      </div>
    );
  };

  // Render a chord in the progression display
  const renderProgressionChord = (item: ProgressionChord, index: number) => {
    const { chord } = item;
    const degree = chord.degree;
    const textColor = showColors ? degreeTextColors[degree] : 'text-text-primary';
    const borderColor = showColors ? degreeBorderColors[degree] : 'border-text-muted/30';
    const isEditing = editingIndex === index;

    if (isEditing) {
      return (
        <div key={`prog-${index}`} className="relative flex flex-col items-center">
          <input
            ref={editInputRef}
            type="text"
            value={editValue}
            onChange={(e) => handleEditChange(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleSaveEdit}
            className={`
              w-20 px-2 py-1.5 text-sm text-center rounded-lg font-bold
              bg-background border-2 transition-colors
              text-text-primary
              focus:outline-none focus:ring-2 focus:ring-accent
              ${editError ? 'border-error' : 'border-accent'}
            `}
          />
          {editError && (
            <span className="absolute -bottom-5 text-xs text-error whitespace-nowrap">
              {editError}
            </span>
          )}
        </div>
      );
    }
    
    return (
      <div
        key={`prog-${index}`}
        className="relative group"
      >
        <button
          onClick={() => handleStartEdit(index)}
          className={`
            px-4 py-2 rounded-lg bg-background-elevated border
            ${borderColor} ${textColor}
            transition-all duration-150
            hover:scale-105 hover:shadow-md
            cursor-pointer
          `}
          title="Click to edit"
        >
          <span className="font-bold">
            {showChordNames ? getChordDisplayName(chord) : getRomanNumeral(chord)}
          </span>
          {showChordNames && (
            <span className="ml-1.5 text-xs text-text-muted">
              {getRomanNumeral(chord)}
            </span>
          )}
        </button>
        
        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveChord(index);
          }}
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

  // Get presets based on mode
  const presets = mode === 'major'
    ? [
        { label: 'I-V-vi-IV', value: 'I, V, vi, IV' },
        { label: 'ii-V-I', value: 'ii, V, I' },
        { label: 'I-IV-V-I', value: 'I, IV, V, I' },
        { label: 'vi-IV-I-V', value: 'vi, IV, I, V' },
      ]
    : [
        { label: 'i-VII-VI-v', value: 'i, VII, VI, v' },
        { label: 'i-iv-v-i', value: 'i, iv, v, i' },
        { label: 'i-VI-III-VII', value: 'i, VI, III, VII' },
        { label: 'i-iv-VII-III', value: 'i, iv, VII, III' },
      ];

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
      </div>

      {/* Text input for adding chords */}
      <div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={textInput}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleTextKeyDown}
              placeholder="I, V, vi, IV"
              className={`
                w-full px-4 py-2.5 rounded-lg
                bg-background-elevated border transition-colors
                text-text-primary placeholder-text-muted
                focus:outline-none focus:ring-2 focus:ring-accent
                ${inputError ? 'border-error' : 'border-text-muted/30'}
              `}
            />
          </div>
          <button
            onClick={handleAddFromText}
            disabled={!textInput.trim() || progression.length >= maxChords}
            className="
              px-4 py-2.5 rounded-lg font-medium
              bg-accent text-background
              hover:bg-accent/90 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Add
          </button>
        </div>
        
        {/* Error message or format hint */}
        <div className="mt-1.5 min-h-[1.25rem]">
          {inputError ? (
            <p className="text-sm text-error">{inputError}</p>
          ) : (
            <p className="text-xs text-text-muted">{getFormatHint()}</p>
          )}
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
            Type chords above or use a preset below
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-y-3 p-3 rounded-lg bg-background-elevated/50 min-h-[56px]">
            {/* Insertion point at the start */}
            {renderInsertionPoint(0)}
            
            {progression.map((item, i) => (
              <div key={`chord-wrapper-${i}`} className="flex items-center">
                {renderProgressionChord(item, i)}
                {/* Insertion point after this chord */}
                {renderInsertionPoint(i + 1)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick presets */}
      <div>
        <p className="text-sm text-text-secondary mb-2">Quick presets:</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleLoadPreset(preset.value)}
              className="px-3 py-1 text-sm rounded-lg bg-background-elevated border border-text-muted/30 text-text-secondary hover:bg-background-hover transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProgressionBuilder;
