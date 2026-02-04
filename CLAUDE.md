# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Harmony Lab is a music practice games platform built with Next.js 16 and Bun. It includes:

1. **Tonic Target Practice** - A drill for building ii-V-I (and similar) progressions in random keys
2. **Solo Visualizer** (`/tools/solo-visualizer`) - A tool for visualizing which notes work over chord progressions on guitar

## Commands

Always use **bun** (not npm/yarn):
```bash
bun dev                     # Development server (localhost:3000)
bun run build               # Production build
bun test                    # Run all unit tests
bun test --watch            # Watch mode
bun test tests/unit/music   # Run tests in a directory
bun test chords.test.ts     # Run a single test file
bun lint                    # Lint code

# Cloudflare Workers deployment
bun run preview             # Build and preview locally
bun run deploy              # Build and deploy to Cloudflare
```

## Architecture

### Core Layers

1. **Music Theory Core** (`src/lib/music/`) - Pure TypeScript functions, no React dependencies
   - `types.ts` - `NoteName`, `Chord`, `Key`, `Progression`, `ScaleDegree`, `Voicing`
   - `scales.ts` - Scale generation (major, minor)
   - `chords.ts` - Chord construction, diatonic chord lookup
   - `progressions.ts` - Build ii-V-I, validate answers
   - `voicings.ts` - Generate piano voicings from chords
   - `chordParser.ts` - Parse roman numeral notation (`I`, `V7`, `bVII`, etc.)
   - `fretboard.ts` - Guitar fretboard note mapping
   - `chordTones.ts` - Chord tone analysis for improvisation

2. **Audio Engine** (`src/lib/audio/`) - Wraps Tone.js with Salamander piano samples
   - `engine.ts` - Sampler setup, audio context management
   - `playback.ts` - `playChord()`, `playProgression()`, `playVoicingSequence()`
   - Samples lazy-loaded on first user interaction

3. **Game Engine** (`src/lib/game-engine/`) - Generic types for game state, rounds, validation

4. **Game Definitions** (`src/games/`) - Game-specific logic separated from UI
   - `tonic-target/` - Tonic Target game logic
   - `interval-games/` - Interval recognition game logic
   - `note-identification/` - Note identification game logic

5. **State Management** (`src/stores/`) - Zustand stores with localStorage persistence
   - `gameStore.ts` - Game state, round management, playback actions
   - `settingsStore.ts` - User preferences
   - `progressStore.ts` - Session history, per-key stats

### Component Organization

- `components/ui/` - Primitives (Button, Card)
- `components/shared/` - Platform-wide (GameShell, TheoryCard, SettingsPanel, ProgressPanel, ProgressionBuilder, FretboardDisplay)
- `components/games/tonic-target/` - Tonic Target game components
- `components/games/interval-games/` - Interval game components
- `components/games/note-identification/` - Note identification game components

## Key Features

### Solo Visualizer (`/tools/solo-visualizer`)

A tool for guitarists to visualize which notes work over chord progressions:

- **Fretboard visualization** - Shows notes on guitar fretboard with colors
- **Chord tones** - Root, 3rd, 5th, 7th highlighted prominently
- **Scale tones** - Safe passing tones shown with lighter opacity
- **Avoid tones** - Notes to avoid shown in red (optional)
- **Focus mode** - Randomly limit to 3-5 notes for practice
- **Fret range slider** - Focus on specific positions

**Progression Builder:**
- Type progressions in roman numeral notation: `I, V, vi, IV`
- Supports 7th chords: `Imaj7, V7, iim7, viim7b5`
- Supports borrowed chords: `bVII, bIII, #iv`
- Click existing chords to edit in-place
- Hover between chords to insert via `+` button

### Tonic Target Game Flow

1. `generateRound()` picks random key + target degree (I or vii)
2. For target I: correct progression is ii-V-I
3. For target vii: correct progression is vi-IV-vii
4. User clicks chords from grid (7 diatonic options) - chords play on click
5. `validateAnswer()` checks against correct progression

### Core Data Types

```typescript
interface Chord {
  root: NoteName;        // 'C', 'F#', etc.
  quality: ChordQuality; // 'maj7', 'min7', '7', 'min7b5'
  degree: ScaleDegree;   // 1-7
}

interface TonicTargetRound {
  key: Key;
  correctProgression: Progression;
  availableChords: Chord[];
  targetDegree: TargetDegree; // 1 or 7
}
```

### Design Decisions

1. **Slot naming**: Answer slots are named `ii`, `V`, `I` but represent "prep", "dominant", "target" positions. When targeting vii, labels change but slot keys remain the same.

2. **Voicings**: Using simple close-position voicings with optional bass note (not rootless jazz voicings).

3. **Progression for vii target**: Uses vi-IV-vii (provides practice identifying the leading tone).

4. **Chord parser defaults**: Parser defaults to triads when no extension is typed (`V` = major triad, `V7` = dominant 7th).

## Testing

Unit tests are in `tests/unit/` mirroring the source structure. E2E tests use Playwright in `tests/e2e/`.

Key test files:
- `tests/unit/music/chordParser.test.ts` - 63 tests for roman numeral parsing
- `tests/unit/music/chords.test.ts` - Chord construction tests
- `tests/unit/music/scales.test.ts` - Scale generation tests
