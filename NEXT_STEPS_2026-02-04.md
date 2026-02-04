# Harmony Lab - Development Status & Next Steps

## Completed Features

### Solo Note Visualizer (`/tools/solo-visualizer`)

A fully functional tool for visualizing which notes work over chord progressions.

**Features:**
- Fretboard visualization with highlighted notes
- Chord tones (root, 3rd, 5th, 7th) shown prominently
- Scale tones shown with lighter opacity
- Avoid tones (optional) shown in red
- Focus mode: randomly limit to 3-5 notes to practice
- Fret range slider to focus on specific positions

**Progression Builder (Text Input):**
- Type progressions in roman numeral notation: `I, V, vi, IV`
- Supports 7th chords: `Imaj7, V7, iim7, viim7b5`
- Supports borrowed chords: `bVII, bIII, #iv`
- Inline validation with error hints
- Click existing chords to edit in-place
- Hover between chords to insert new ones via `+` button
- Quick presets for common progressions

**Color Scheme:**
- Scale degree colors with CSS variables
- Root notes: warm yellow (`#fef3c7`)
- Chord tones: accent color
- Scale tones: light blue (`#93c5fd`)
- Avoid tones: error red (dimmed)

### Chord Parser Module (`src/lib/music/chordParser.ts`)

A robust parser for roman numeral chord notation:

```typescript
// Parse individual chords
parseRomanNumeral('V7')     // → { degree: 5, quality: '7', ... }
parseRomanNumeral('bVII')   // → { degree: 7, accidental: -1, quality: 'maj', ... }

// Parse progressions
parseProgression('I, V, vi, IV')  // → { success: true, chords: [...] }

// Convert to/from Chord objects
romanNumeralToChord(parsed, 'C', 'major')  // → { root: 'G', quality: '7', degree: 5 }
chordToRomanNumeral(chord, 'C', 'major')   // → 'V7'
```

**Supported Notation:**
| Input | Meaning |
|-------|---------|
| `I`, `ii`, `IV`, `vi` | Basic triads (case determines quality) |
| `V7`, `Imaj7`, `iim7` | 7th chords |
| `viidim`, `viidim7` | Diminished chords |
| `bVII`, `bIII`, `#iv` | Borrowed chords |

**Tests:** 63 comprehensive tests in `tests/unit/music/chordParser.test.ts`

---

## Architecture Overview

```
src/
├── lib/music/
│   ├── chordParser.ts    # NEW - Roman numeral parsing
│   ├── chords.ts         # Chord construction
│   ├── scales.ts         # Scale generation
│   ├── fretboard.ts      # Fretboard note mapping
│   ├── chordTones.ts     # Chord tone analysis
│   └── voicings.ts       # Piano voicings
├── components/shared/
│   ├── ProgressionBuilder.tsx  # Text input + inline edit
│   ├── FretboardDisplay.tsx    # Guitar fretboard visualization
│   └── GuitarFretboard.tsx     # Simple chord diagrams
└── app/tools/
    └── solo-visualizer/page.tsx
```

---

## Potential Next Steps

### Near-term Enhancements

1. **Backing Track Generator**
   - Synth drums + bass + piano chords
   - Play/pause, tempo control
   - Integrates with existing progression builder

2. **Scale Position Trainer**
   - CAGED and 3-notes-per-string positions
   - View mode: see scale shapes
   - Practice mode: click notes in order

3. **Audio Input (Pitch Detection)**
   - Detect notes from guitar via audio interface
   - Real-time feedback on fretboard
   - Uses Pitchy library for monophonic detection

### Technical Improvements

1. **Fretboard Enhancements**
   - Vertical orientation option
   - Position markers (5, 7, 9, 12 frets)
   - String bending indicators

2. **Progression Builder UX**
   - Drag-and-drop chord reordering
   - Save/load custom progressions to localStorage
   - Copy progression as text

3. **Mobile Optimization**
   - Touch-friendly fretboard
   - Responsive layout for narrow screens

---

## Technical Notes

### Color System (CSS Variables)

```css
--degree-1: #fef3c7;  /* Root - warm yellow */
--degree-2: #c4b5fd;  /* ii - soft purple */
--degree-3: #bbf7d0;  /* iii - pale green */
--degree-4: #fed7aa;  /* IV - orange */
--degree-5: #fca5a5;  /* V - red */
--degree-6: #93c5fd;  /* vi - blue */
--degree-7: #d4d4d8;  /* vii - grey */
```

### Key Dependencies

- **Tone.js**: Audio synthesis and playback
- **Zustand**: State management
- **Bun**: Runtime and test framework

### Running Tests

```bash
bun test                           # All tests
bun test tests/unit/music/         # Music theory tests
bun test chordParser.test.ts       # Single file
```
