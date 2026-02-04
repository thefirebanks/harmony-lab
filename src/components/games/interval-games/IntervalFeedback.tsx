/**
 * Interval Feedback Component
 * Shows feedback after answering with fretboard visualization
 */

'use client';

import type { IntervalFlashRound, IntervalName, FretboardPosition } from '@/games/interval-games/types';
import type { ValidationResult } from '@/lib/game-engine/types';
import {
  INTERVAL_DISPLAY_NAMES,
  INTERVAL_SEMITONES,
  GUITAR_TUNING,
} from '@/games/interval-games/types';
import { getIntervalFretboardPositions, getIntervalShapeDescription } from '@/games/interval-games/logic';
import { getNoteIndex } from '@/lib/music';

interface IntervalFeedbackProps {
  round: IntervalFlashRound & { answer: IntervalName | null };
  feedback: ValidationResult;
  showFretboard: boolean;
  onReplay: () => void;
  onNext: () => void;
}

/**
 * Simple fretboard diagram showing the interval
 */
function FretboardDiagram({
  rootPosition,
  targetPositions,
  interval,
}: {
  rootPosition: FretboardPosition;
  targetPositions: FretboardPosition[];
  interval: IntervalName;
}) {
  // Calculate fret range to display
  const allFrets = [rootPosition.fret, ...targetPositions.map((p) => p.fret)];
  const minFret = Math.max(0, Math.min(...allFrets) - 1);
  const maxFret = Math.min(24, Math.max(...allFrets) + 2);
  const displayFrets = maxFret - minFret + 1;

  const stringWidth = 24;
  const fretHeight = 28;
  const topPadding = 20;
  const leftPadding = 30;
  const strings = 6;

  const width = (strings - 1) * stringWidth + leftPadding * 2;
  const height = displayFrets * fretHeight + topPadding + 20;

  const getStringX = (stringNum: number) => leftPadding + (6 - stringNum) * stringWidth;
  const getFretY = (fret: number) => topPadding + (fret - minFret + 0.5) * fretHeight;

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="text-text-muted">
        {/* Nut if starting at fret 0 */}
        {minFret === 0 && (
          <rect
            x={leftPadding - 2}
            y={topPadding - 3}
            width={(strings - 1) * stringWidth + 4}
            height={4}
            fill="currentColor"
          />
        )}

        {/* Fret numbers */}
        {Array.from({ length: displayFrets }).map((_, i) => {
          const fret = minFret + i;
          if (fret === 0) return null;
          return (
            <text
              key={`fret-num-${i}`}
              x={8}
              y={topPadding + (i + 0.5) * fretHeight + 4}
              className="text-xs fill-text-muted"
            >
              {fret}
            </text>
          );
        })}

        {/* Frets (horizontal lines) */}
        {Array.from({ length: displayFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={leftPadding}
            y1={topPadding + i * fretHeight}
            x2={leftPadding + (strings - 1) * stringWidth}
            y2={topPadding + i * fretHeight}
            stroke="currentColor"
            strokeWidth={1}
          />
        ))}

        {/* Strings (vertical lines) */}
        {Array.from({ length: strings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={leftPadding + i * stringWidth}
            y1={topPadding}
            x2={leftPadding + i * stringWidth}
            y2={topPadding + displayFrets * fretHeight}
            stroke="currentColor"
            strokeWidth={i === 0 ? 1 : i === 5 ? 2 : 1.5}
          />
        ))}

        {/* Root note */}
        <circle
          cx={getStringX(rootPosition.string)}
          cy={rootPosition.fret === 0 ? topPadding - 10 : getFretY(rootPosition.fret)}
          r={10}
          className="fill-[var(--accent)]"
        />
        <text
          x={getStringX(rootPosition.string)}
          y={(rootPosition.fret === 0 ? topPadding - 10 : getFretY(rootPosition.fret)) + 4}
          textAnchor="middle"
          className="text-xs fill-[var(--background)] font-bold"
        >
          R
        </text>

        {/* Target positions */}
        {targetPositions.slice(0, 3).map((pos, idx) => (
          <g key={`target-${idx}`}>
            <circle
              cx={getStringX(pos.string)}
              cy={pos.fret === 0 ? topPadding - 10 : getFretY(pos.fret)}
              r={10}
              className="fill-green-500"
            />
            <text
              x={getStringX(pos.string)}
              y={(pos.fret === 0 ? topPadding - 10 : getFretY(pos.fret)) + 4}
              textAnchor="middle"
              className="text-xs fill-[var(--background)] font-bold"
            >
              {interval.replace('m', '').replace('M', '').replace('P', '')}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function IntervalFeedback({
  round,
  feedback,
  showFretboard,
  onReplay,
  onNext,
}: IntervalFeedbackProps) {
  const intervalName = INTERVAL_DISPLAY_NAMES[round.interval];
  const semitones = INTERVAL_SEMITONES[round.interval];
  const shapeDescription = getIntervalShapeDescription(round.interval);

  // Calculate root position on fretboard (pick a reasonable position)
  const rootMidi =
    getNoteIndex(round.rootNote.note) + (round.rootNote.octave + 1) * 12;

  // Find the string and fret for the root note
  let rootPosition: FretboardPosition = { string: 6, fret: 0 };
  for (let string = 6; string >= 1; string--) {
    const stringNum = string as 1 | 2 | 3 | 4 | 5 | 6;
    const openNote = GUITAR_TUNING[stringNum];
    const openMidi = getNoteIndex(openNote.note) + (openNote.octave + 1) * 12;
    const fret = rootMidi - openMidi;
    if (fret >= 0 && fret <= 12) {
      rootPosition = { string: stringNum, fret };
      break;
    }
  }

  // Get target positions
  const targetPositions = getIntervalFretboardPositions(
    rootPosition,
    round.interval,
    round.direction
  );

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Result */}
      <div className="text-center">
        {feedback.isCorrect ? (
          <div className="text-3xl font-bold text-green-500">Correct!</div>
        ) : (
          <div className="text-3xl font-bold text-red-500">
            {round.answer === null ? 'Time Up!' : 'Not Quite'}
          </div>
        )}
      </div>

      {/* Interval info */}
      <div className="text-center space-y-2">
        <div className="text-xl font-semibold text-[var(--text-primary)]">
          {intervalName}
        </div>
        <div className="text-sm text-[var(--text-secondary)]">
          {semitones} semitone{semitones !== 1 ? 's' : ''} • {round.direction}
        </div>
      </div>

      {/* Fretboard visualization */}
      {showFretboard && targetPositions.length > 0 && (
        <div className="bg-[var(--background-elevated)] rounded-xl p-4">
          <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 text-center">
            Guitar Shape
          </h4>
          <FretboardDiagram
            rootPosition={rootPosition}
            targetPositions={targetPositions}
            interval={round.interval}
          />
          <p className="text-xs text-[var(--text-muted)] mt-3 text-center max-w-[200px]">
            {shapeDescription}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onReplay}
          className="px-4 py-2 bg-[var(--background-elevated)] text-[var(--text-primary)] rounded-lg border border-[var(--text-muted)]/20 hover:border-[var(--accent)]/50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Hear Again
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-[var(--accent)] text-[var(--background)] font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-2"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
