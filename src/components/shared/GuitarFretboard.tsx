/**
 * Guitar Fretboard Component
 * Visual chord diagram for guitar voicings
 */

'use client';

interface FretPosition {
  string: number; // 1-6 (high E to low E)
  fret: number;   // 0 = open, -1 = muted
  label?: string; // Optional finger/note label
}

interface GuitarChordProps {
  name: string;
  positions: FretPosition[];
  startFret?: number; // For showing fret number on side
}

interface GuitarFretboardProps {
  chords: GuitarChordProps[];
  title?: string;
}

function GuitarChord({ name, positions, startFret = 1 }: GuitarChordProps) {
  const strings = 6;
  const frets = 4;
  const stringWidth = 20;
  const fretHeight = 24;
  const topPadding = 24;
  const bottomPadding = 8;
  const leftPadding = 20;

  const width = (strings - 1) * stringWidth + leftPadding * 2;
  const height = frets * fretHeight + topPadding + bottomPadding;

  // Get fret status for each string (muted, open, or fretted)
  const getStringStatus = (stringNum: number): { fret: number; label?: string } => {
    const pos = positions.find(p => p.string === stringNum);
    return pos ? { fret: pos.fret, label: pos.label } : { fret: -1 }; // default muted
  };

  return (
    <div className="flex flex-col items-center">
      <span className="text-sm font-bold text-text-primary mb-1">{name}</span>
      <svg width={width} height={height} className="text-text-muted">
        {/* Nut (thick line at top if starting at fret 1) */}
        {startFret === 1 && (
          <rect
            x={leftPadding - 2}
            y={topPadding - 3}
            width={(strings - 1) * stringWidth + 4}
            height={4}
            fill="currentColor"
          />
        )}

        {/* Fret number indicator */}
        {startFret > 1 && (
          <text
            x={8}
            y={topPadding + fretHeight / 2 + 4}
            className="text-xs fill-text-muted"
          >
            {startFret}
          </text>
        )}

        {/* Frets (horizontal lines) */}
        {Array.from({ length: frets + 1 }).map((_, i) => (
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
            y2={topPadding + frets * fretHeight}
            stroke="currentColor"
            strokeWidth={i === 0 ? 1 : i === 5 ? 2 : 1.5}
          />
        ))}

        {/* String markers (muted X, open O, or fretted dots) */}
        {Array.from({ length: strings }).map((_, i) => {
          const stringNum = 6 - i; // Convert to string number (6 = low E on left)
          const status = getStringStatus(stringNum);
          const x = leftPadding + i * stringWidth;

          if (status.fret === -1) {
            // Muted string (X)
            return (
              <text
                key={`marker-${i}`}
                x={x}
                y={topPadding - 8}
                textAnchor="middle"
                className="text-xs fill-text-muted"
              >
                x
              </text>
            );
          } else if (status.fret === 0) {
            // Open string (O)
            return (
              <circle
                key={`marker-${i}`}
                cx={x}
                cy={topPadding - 10}
                r={4}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              />
            );
          } else {
            // Fretted note (filled circle)
            const fretIndex = status.fret - startFret + 1;
            const y = topPadding + (fretIndex - 0.5) * fretHeight;
            return (
              <g key={`marker-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={7}
                  className="fill-accent"
                />
                {status.label && (
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    className="text-[8px] fill-background font-bold"
                  >
                    {status.label}
                  </text>
                )}
              </g>
            );
          }
        })}
      </svg>
    </div>
  );
}

export function GuitarFretboard({ chords, title }: GuitarFretboardProps) {
  return (
    <div className="space-y-3">
      {title && (
        <h4 className="text-sm font-semibold text-text-secondary">{title}</h4>
      )}
      <div className="flex flex-wrap justify-center gap-4">
        {chords.map((chord, index) => (
          <GuitarChord key={index} {...chord} />
        ))}
      </div>
    </div>
  );
}

// Pre-defined chord voicings for ii-V-I

export const SHELL_VOICINGS_5TH_STRING = {
  title: 'Shell Voicings (Root on 5th String)',
  chords: [
    {
      name: 'Dm7 (ii)',
      startFret: 5,
      positions: [
        { string: 5, fret: 5, label: 'R' },
        { string: 3, fret: 5, label: '7' },
        { string: 2, fret: 6, label: '3' },
      ],
    },
    {
      name: 'G7 (V)',
      startFret: 3,
      positions: [
        { string: 5, fret: 3, label: 'R' },
        { string: 3, fret: 3, label: '7' },
        { string: 2, fret: 3, label: '3' },
      ],
    },
    {
      name: 'Cmaj7 (I)',
      startFret: 3,
      positions: [
        { string: 5, fret: 3, label: 'R' },
        { string: 3, fret: 4, label: '7' },
        { string: 2, fret: 5, label: '3' },
      ],
    },
  ],
};

export const SHELL_VOICINGS_6TH_STRING = {
  title: 'Shell Voicings (Root on 6th String)',
  chords: [
    {
      name: 'Dm7 (ii)',
      startFret: 10,
      positions: [
        { string: 6, fret: 10, label: 'R' },
        { string: 4, fret: 10, label: '7' },
        { string: 3, fret: 10, label: '3' },
      ],
    },
    {
      name: 'G7 (V)',
      startFret: 3,
      positions: [
        { string: 6, fret: 3, label: 'R' },
        { string: 4, fret: 3, label: '7' },
        { string: 3, fret: 4, label: '3' },
      ],
    },
    {
      name: 'Cmaj7 (I)',
      startFret: 8,
      positions: [
        { string: 6, fret: 8, label: 'R' },
        { string: 4, fret: 9, label: '7' },
        { string: 3, fret: 9, label: '3' },
      ],
    },
  ],
};

export const DROP_2_VOICINGS = {
  title: 'Drop 2 Voicings (Root on 4th String)',
  chords: [
    {
      name: 'Dm7 (ii)',
      startFret: 1,
      positions: [
        { string: 4, fret: 3 },
        { string: 3, fret: 2 },
        { string: 2, fret: 1 },
        { string: 1, fret: 1 },
      ],
    },
    {
      name: 'G7 (V)',
      startFret: 3,
      positions: [
        { string: 4, fret: 3 },
        { string: 3, fret: 4 },
        { string: 2, fret: 3 },
        { string: 1, fret: 4 },
      ],
    },
    {
      name: 'Cmaj7 (I)',
      startFret: 1,
      positions: [
        { string: 4, fret: 2 },
        { string: 3, fret: 4 },
        { string: 2, fret: 1 },
        { string: 1, fret: 3 },
      ],
    },
  ],
};
