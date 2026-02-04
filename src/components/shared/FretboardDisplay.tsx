/**
 * FretboardDisplay Component
 * Full fretboard visualization for scale/chord practice
 * Shows all 6 strings across multiple frets with highlighted notes
 */

'use client';

import { useMemo } from 'react';
import type { FretboardNote } from '@/lib/music/fretboard';
import type { NoteName } from '@/lib/music/types';
import { DEGREE_COLORS } from '@/lib/music/constants';

interface FretboardDisplayProps {
  // Display configuration
  frets?: number; // Total frets to show (default: 15)
  startFret?: number; // First fret to show (default: 0)
  orientation?: 'horizontal' | 'vertical';
  showFretNumbers?: boolean;
  showStringNames?: boolean;
  showFretMarkers?: boolean; // Dots at frets 3, 5, 7, 9, 12, etc.

  // Note highlighting
  highlightedNotes?: FretboardNote[];
  noteColorScheme?: 'chord-tones' | 'scale-degrees' | 'custom';
  
  // Interaction
  onNoteClick?: (note: FretboardNote) => void;
  clickableNotes?: FretboardNote[];
  
  // Real-time feedback (for audio input later)
  detectedNote?: { note: NoteName; octave: number } | null;
  showDetectionFeedback?: boolean;
}

// String names for display (low E at bottom to high E at top when horizontal)
const STRING_NAMES_BOTTOM_TO_TOP = ['E', 'A', 'D', 'G', 'B', 'E'];

// Frets that have position markers
const MARKER_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21];
const DOUBLE_MARKER_FRETS = [12, 24];

export function FretboardDisplay({
  frets = 15,
  startFret = 0,
  orientation = 'horizontal',
  showFretNumbers = true,
  showStringNames = true,
  showFretMarkers = true,
  highlightedNotes = [],
  noteColorScheme = 'scale-degrees',
  onNoteClick,
  clickableNotes,
  detectedNote,
  showDetectionFeedback = false,
}: FretboardDisplayProps) {
  // Dimensions
  const isHorizontal = orientation === 'horizontal';
  const stringSpacing = 28;
  const fretSpacing = 50;
  const nutWidth = 8;
  const dotRadius = 10;
  
  const totalFrets = frets - startFret;
  const width = isHorizontal 
    ? nutWidth + totalFrets * fretSpacing + 20 
    : stringSpacing * 5 + 60;
  const height = isHorizontal 
    ? stringSpacing * 5 + 80 
    : nutWidth + totalFrets * fretSpacing + 20;

  // Check if a note is clickable
  const isClickable = useMemo(() => {
    if (!clickableNotes) return (note: FretboardNote) => true;
    const clickableSet = new Set(
      clickableNotes.map(n => `${n.string}-${n.fret}`)
    );
    return (note: FretboardNote) => clickableSet.has(`${note.string}-${note.fret}`);
  }, [clickableNotes]);

  // Get color for a note based on scheme
  const getNoteColor = (note: FretboardNote): string => {
    if (noteColorScheme === 'scale-degrees' && note.scaleDegree) {
      return DEGREE_COLORS[note.scaleDegree];
    }
    if (noteColorScheme === 'chord-tones') {
      if (note.isRoot) return 'var(--degree-1)';
      if (note.isChordTone) return 'var(--accent)';
      // Use custom color if provided (e.g., for scale tones), otherwise fall back to muted
      return note.color || 'var(--text-muted)';
    }
    return note.color || 'var(--accent)';
  };

  // Calculate position for a string/fret
  const getPosition = (string: number, fret: number) => {
    // String: 1 = high E (top in horizontal), 6 = low E (bottom in horizontal)
    // We want low strings at bottom, high strings at top
    // string 6 (low E) -> index 5 (bottom), string 1 (high E) -> index 0 (top)
    const stringIndex = string - 1; // 0-5, where 0 is high E (top), 5 is low E (bottom)
    
    if (isHorizontal) {
      const x = startFret === 0 && fret === 0 
        ? nutWidth / 2 
        : nutWidth + (fret - startFret - 0.5) * fretSpacing;
      const y = 40 + stringIndex * stringSpacing;
      return { x, y };
    } else {
      const x = 30 + (5 - stringIndex) * stringSpacing;
      const y = startFret === 0 && fret === 0
        ? nutWidth / 2
        : nutWidth + (fret - startFret - 0.5) * fretSpacing;
      return { x, y };
    }
  };

  // Check if detected note matches this position
  const isDetectedAt = (note: FretboardNote): boolean => {
    if (!showDetectionFeedback || !detectedNote) return false;
    return note.note === detectedNote.note && note.octave === detectedNote.octave;
  };

  // Render the fretboard grid
  const renderGrid = () => {
    const lines = [];
    
    // Draw strings (index 0 = high E at top, index 5 = low E at bottom)
    for (let stringIdx = 0; stringIdx < 6; stringIdx++) {
      // String thickness: thicker for lower strings (higher index)
      const thickness = 1 + stringIdx * 0.2;
      
      if (isHorizontal) {
        lines.push(
          <line
            key={`string-${stringIdx}`}
            x1={0}
            y1={40 + stringIdx * stringSpacing}
            x2={width}
            y2={40 + stringIdx * stringSpacing}
            stroke="var(--text-muted)"
            strokeWidth={thickness}
            opacity={0.5}
          />
        );
      } else {
        lines.push(
          <line
            key={`string-${stringIdx}`}
            x1={30 + (5 - stringIdx) * stringSpacing}
            y1={0}
            x2={30 + (5 - stringIdx) * stringSpacing}
            y2={height}
            stroke="var(--text-muted)"
            strokeWidth={thickness}
            opacity={0.5}
          />
        );
      }
    }

    // Draw frets
    for (let fret = 0; fret <= totalFrets; fret++) {
      const actualFret = fret + startFret;
      const isNut = actualFret === 0;
      
      if (isHorizontal) {
        const x = isNut ? nutWidth / 2 : nutWidth + (fret - (startFret === 0 ? 0 : -0.5)) * fretSpacing - fretSpacing/2;
        lines.push(
          <line
            key={`fret-${fret}`}
            x1={x}
            y1={35}
            x2={x}
            y2={35 + 5 * stringSpacing + 10}
            stroke={isNut ? 'var(--text-secondary)' : 'var(--text-muted)'}
            strokeWidth={isNut ? nutWidth : 2}
            opacity={isNut ? 0.8 : 0.4}
          />
        );
      } else {
        const y = isNut ? nutWidth / 2 : nutWidth + (fret - (startFret === 0 ? 0 : -0.5)) * fretSpacing - fretSpacing/2;
        lines.push(
          <line
            key={`fret-${fret}`}
            x1={25}
            y1={y}
            x2={25 + 5 * stringSpacing + 10}
            y2={y}
            stroke={isNut ? 'var(--text-secondary)' : 'var(--text-muted)'}
            strokeWidth={isNut ? nutWidth : 2}
            opacity={isNut ? 0.8 : 0.4}
          />
        );
      }
    }

    return lines;
  };

  // Render fret markers (dots)
  const renderMarkers = () => {
    if (!showFretMarkers) return null;
    
    const markers = [];
    
    for (let fret = startFret + 1; fret <= startFret + totalFrets; fret++) {
      if (!MARKER_FRETS.includes(fret)) continue;
      
      const isDouble = DOUBLE_MARKER_FRETS.includes(fret);
      const fretOffset = fret - startFret;
      
      if (isHorizontal) {
        const x = nutWidth + (fretOffset - 0.5) * fretSpacing;
        
        if (isDouble) {
          markers.push(
            <circle key={`marker-${fret}-1`} cx={x} cy={40 + 1.5 * stringSpacing} r={4} fill="var(--text-muted)" opacity={0.3} />,
            <circle key={`marker-${fret}-2`} cx={x} cy={40 + 3.5 * stringSpacing} r={4} fill="var(--text-muted)" opacity={0.3} />
          );
        } else {
          markers.push(
            <circle key={`marker-${fret}`} cx={x} cy={40 + 2.5 * stringSpacing} r={4} fill="var(--text-muted)" opacity={0.3} />
          );
        }
      } else {
        const y = nutWidth + (fretOffset - 0.5) * fretSpacing;
        
        if (isDouble) {
          markers.push(
            <circle key={`marker-${fret}-1`} cx={30 + 1.5 * stringSpacing} cy={y} r={4} fill="var(--text-muted)" opacity={0.3} />,
            <circle key={`marker-${fret}-2`} cx={30 + 3.5 * stringSpacing} cy={y} r={4} fill="var(--text-muted)" opacity={0.3} />
          );
        } else {
          markers.push(
            <circle key={`marker-${fret}`} cx={30 + 2.5 * stringSpacing} cy={y} r={4} fill="var(--text-muted)" opacity={0.3} />
          );
        }
      }
    }
    
    return markers;
  };

  // Render fret numbers
  const renderFretNumbers = () => {
    if (!showFretNumbers) return null;
    
    const numbers = [];
    
    // Show every fret number, or just markers
    const fretsToShow = [1, 3, 5, 7, 9, 12, 15, 17, 19, 21].filter(
      f => f >= startFret && f <= startFret + totalFrets
    );
    
    for (const fret of fretsToShow) {
      const fretOffset = fret - startFret;
      
      if (isHorizontal) {
        numbers.push(
          <text
            key={`fretnum-${fret}`}
            x={nutWidth + (fretOffset - 0.5) * fretSpacing}
            y={height - 10}
            textAnchor="middle"
            className="text-xs fill-text-muted"
          >
            {fret}
          </text>
        );
      } else {
        numbers.push(
          <text
            key={`fretnum-${fret}`}
            x={10}
            y={nutWidth + (fretOffset - 0.5) * fretSpacing + 4}
            textAnchor="middle"
            className="text-xs fill-text-muted"
          >
            {fret}
          </text>
        );
      }
    }
    
    return numbers;
  };

  // Render string names
  const renderStringNames = () => {
    if (!showStringNames) return null;
    
    const names = [];
    
    // String names from top to bottom: high E, B, G, D, A, low E
    for (let i = 0; i < 6; i++) {
      if (isHorizontal) {
        names.push(
          <text
            key={`stringname-${i}`}
            x={width - 10}
            y={40 + i * stringSpacing + 4}
            textAnchor="middle"
            className="text-xs fill-text-muted font-mono"
          >
            {STRING_NAMES_BOTTOM_TO_TOP[5 - i]}
          </text>
        );
      } else {
        names.push(
          <text
            key={`stringname-${i}`}
            x={30 + (5 - i) * stringSpacing}
            y={height - 5}
            textAnchor="middle"
            className="text-xs fill-text-muted font-mono"
          >
            {STRING_NAMES_BOTTOM_TO_TOP[5 - i]}
          </text>
        );
      }
    }
    
    return names;
  };

  // Render highlighted notes
  const renderNotes = () => {
    const notes = [];
    
    for (const note of highlightedNotes) {
      // Skip notes outside visible range
      if (note.fret < startFret || note.fret > startFret + totalFrets) continue;
      
      const pos = getPosition(note.string, note.fret);
      const color = getNoteColor(note);
      const opacity = note.opacity ?? 1;
      const size = note.size === 'large' ? dotRadius * 1.3 : 
                   note.size === 'small' ? dotRadius * 0.8 : 
                   dotRadius;
      
      const isDetected = isDetectedAt(note);
      const canClick = onNoteClick && isClickable(note);
      
      notes.push(
        <g 
          key={`note-${note.string}-${note.fret}`}
          style={{ cursor: canClick ? 'pointer' : 'default' }}
          onClick={() => canClick && onNoteClick(note)}
        >
          {/* Glow effect for detected notes */}
          {isDetected && (
            <circle
              cx={pos.x}
              cy={pos.y}
              r={size + 4}
              fill={color}
              opacity={0.4}
              className="animate-pulse"
            />
          )}
          
          {/* Main note circle */}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={size}
            fill={color}
            opacity={opacity}
            stroke={isDetected ? 'white' : 'none'}
            strokeWidth={isDetected ? 2 : 0}
          />
          
          {/* Label */}
          {note.label && (
            <text
              x={pos.x}
              y={pos.y + 4}
              textAnchor="middle"
              className="text-[10px] font-bold fill-background"
              style={{ pointerEvents: 'none' }}
            >
              {note.label}
            </text>
          )}
        </g>
      );
    }
    
    return notes;
  };

  return (
    <div className="overflow-x-auto">
      <svg 
        width={width} 
        height={height} 
        className="min-w-fit"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Background */}
        <rect 
          x={0} 
          y={35} 
          width={width - 20} 
          height={5 * stringSpacing + 10} 
          fill="var(--background-elevated)" 
          rx={4}
        />
        
        {/* Fret markers */}
        {renderMarkers()}
        
        {/* Grid lines */}
        {renderGrid()}
        
        {/* Notes */}
        {renderNotes()}
        
        {/* Fret numbers */}
        {renderFretNumbers()}
        
        {/* String names */}
        {renderStringNames()}
      </svg>
    </div>
  );
}

// Default export for convenience
export default FretboardDisplay;
