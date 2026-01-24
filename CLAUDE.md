# Claude Code Context for Harmony Lab

## Project Overview

Harmony Lab is a music practice games platform. The first game is **Tonic Target Practice** - a drill for building ii-V-I (and similar) progressions in random keys.

## Commands

Always use **bun** (not npm/yarn):
```bash
bun dev          # Development server
bun run build    # Production build
bun test         # Run tests
bun lint         # Lint code
```

## Architecture

### Core Layers

1. **Music Theory Core** (`src/lib/music/`)
   - Pure TypeScript functions, no React dependencies
   - Types: `NoteName`, `Chord`, `Key`, `Progression`, `ScaleDegree`, `Voicing`
   - Key files:
     - `types.ts` - All type definitions
     - `constants.ts` - Chromatic notes, diatonic chords, intervals
     - `scales.ts` - Scale generation (major, minor)
     - `chords.ts` - Chord construction, diatonic chord lookup
     - `progressions.ts` - Build ii-V-I, validate answers
     - `voicings.ts` - Generate piano voicings from chords

2. **Audio Engine** (`src/lib/audio/`)
   - Wraps Tone.js with clean API
   - `engine.ts` - Sampler setup, audio context management
   - `playback.ts` - `playChord()`, `playProgression()`, `playVoicingSequence()`

3. **Game Engine** (`src/lib/game-engine/`)
   - Generic types for game state, rounds, validation
   - `types.ts` - `SessionStats`, `ValidationResult`, `TheoryCard`, `DifficultyLevel`

4. **Game Definitions** (`src/games/tonic-target/`)
   - Game-specific logic separated from UI
   - `types.ts` - `TonicTargetRound`, `TonicTargetSettings`, `TargetDegree`
   - `logic.ts` - `generateRound()`, `validateAnswer()`, `getNextSlot()`
   - `config.ts` - Game configuration, theory card generators

5. **State Management** (`src/stores/`)
   - Zustand stores with localStorage persistence
   - `gameStore.ts` - Game state, round management, playback actions
   - `settingsStore.ts` - User preferences (persisted)
   - `audioStore.ts` - Audio loading state
   - `progressStore.ts` - Session history, per-key stats (persisted)

### Component Structure

```
components/
├── ui/                      # Primitives (Button, Card)
├── shared/                  # Platform-wide
│   ├── GameShell.tsx        # Game container with header
│   ├── LoadingScreen.tsx    # Sample loading state
│   ├── SettingsPanel.tsx    # Settings UI (slide-out animated)
│   ├── ProgressPanel.tsx    # Progress/stats UI (slide-out animated)
│   ├── TheoryCard.tsx       # Theory snippet with guitar diagrams
│   ├── GuitarFretboard.tsx  # Visual chord diagrams
│   └── TutorialOverlay.tsx  # First-time user tutorial
└── games/tonic-target/      # Game-specific
    ├── TonicTargetGame.tsx  # Main orchestrator
    ├── KeyDisplay.tsx       # Shows current key
    ├── ChordGrid.tsx        # Selectable chord buttons (plays on click)
    ├── ProgressionSlots.tsx # Shows ii → V → I selection
    ├── PlaybackControls.tsx # Hear tonic, submit
    ├── FeedbackDisplay.tsx  # Correct/incorrect feedback
    └── SessionStats.tsx     # Rounds, accuracy
```

## Key Concepts

### Tonic Target Game Flow

1. `generateRound()` picks random key + target degree (I or vii)
2. For target I: correct progression is ii-V-I
3. For target vii: correct progression is vi-IV-vii
4. User clicks chords from grid (7 diatonic options)
5. Chords play on click and fill slots in order
6. `validateAnswer()` checks against correct progression
7. Feedback shows, then next round

### Data Types

```typescript
// A chord in context
interface Chord {
  root: NoteName;      // 'C', 'F#', etc.
  quality: ChordQuality; // 'maj7', 'min7', '7', 'min7b5'
  degree: ScaleDegree;   // 1-7
}

// User's answer (slots map to progression positions)
interface Answer {
  ii: Chord | null;  // First slot (prep chord)
  V: Chord | null;   // Second slot (dominant)
  I: Chord | null;   // Third slot (target)
}

// Round state
interface TonicTargetRound {
  key: Key;
  correctProgression: Progression;
  availableChords: Chord[];
  targetDegree: TargetDegree; // 1 or 7
}
```

### Audio

- Uses Tone.js with Salamander piano samples
- Samples lazy-loaded on first interaction
- `playChord(voicing, duration)` - Play single chord
- `playProgression(prog, tempo, withBass)` - Play ii-V-I sequence
- Voicings generated from `getSimpleVoicing()` or `getSimpleVoicingWithBass()`

## Current Implementation Status

### Implemented
- Core music theory library (scales, chords, keys, progressions, voicings)
- Audio engine with Tone.js integration
- Tonic Target game with full round flow
- Random key selection (all 12 major keys)
- Random target degree (I or vii)
- Chord playback on option click
- Keyboard shortcuts
- Settings with difficulty levels and slide-out animation
- Session stats tracking
- Guitar voicing theory cards with visual fretboard diagrams
- Progress tracking with:
  - Session history (persisted to localStorage)
  - Per-key accuracy stats
  - Weakest/strongest key insights
  - Progress panel with slide-out animation

### Missing (from initial_design.md)
- Help modal with keyboard shortcuts reference
- E2E tests with Playwright
- Component tests

## Design Decisions

1. **Slot naming**: Answer slots are named `ii`, `V`, `I` but represent "prep", "dominant", "target" positions. When targeting vii, labels change but slot keys remain the same.

2. **Voicings**: Using simple close-position voicings with optional bass note. Not "rootless" jazz voicings yet.

3. **Progression for vii target**: Uses vi-IV-vii (not a traditional cadence, but provides practice identifying the leading tone).

## Testing

```bash
bun test                    # All unit tests
bun test --watch            # Watch mode
bun test src/lib/music      # Specific directory
```

Test files mirror source structure in `tests/` directory.
