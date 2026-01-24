# Harmony Lab - Music Practice Games Platform

## Overview

**Harmony Lab** is a personal platform for music practice games, designed to build functional harmony intuition through focused, beautiful, non-gamified exercises. The platform is architected to support multiple games that share a common foundation: music theory primitives, audio engine, and UI components.

**Phase 1 (this spec)** delivers the first game, **Tonic Target Practice**, while establishing the extensible architecture for future games.

### Platform Vision

```
┌─────────────────────────────────────────────────────────────┐
│                      HARMONY LAB                            │
│                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │   Tonic     │  │   Chord     │  │  Modal      │  ...   │
│   │   Target    │  │   Crush     │  │  Interchange│        │
│   │   Practice  │  │   Clone     │  │  Spotter    │        │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│          │                │                │                │
│   ┌──────┴────────────────┴────────────────┴──────┐        │
│   │              Game Engine Layer                 │        │
│   │   (state machine, round flow, scoring, config) │        │
│   └──────────────────────┬────────────────────────┘        │
│                          │                                  │
│   ┌──────────────────────┴────────────────────────┐        │
│   │            Shared Foundation                   │        │
│   │  ┌────────────┐ ┌────────────┐ ┌────────────┐ │        │
│   │  │   Music    │ │   Audio    │ │    UI      │ │        │
│   │  │   Theory   │ │   Engine   │ │ Components │ │        │
│   │  │   Core     │ │  (Tone.js) │ │  (shared)  │ │        │
│   │  └────────────┘ └────────────┘ └────────────┘ │        │
│   └────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Future Games (Out of Scope, but Architecture Must Support)

| Game | Concept | Shared Components Used |
|------|---------|------------------------|
| **Chord Crush Clone** | Identify missing chord in progression | ChordGrid, Audio, Progression types |
| **Modal Interchange Spotter** | Identify borrowed chords | ChordGrid, Theory cards, Key/Scale types |
| **Voice Leading Puzzle** | Find smoothest path between chords | Voicing utilities, Audio, custom UI |
| **Tritone Sub Trainer** | Identify tritone substitutions | Audio, Chord types, A/B comparison UI |
| **Reharmonization Challenge** | Suggest richer substitutions for basic changes | All theory primitives, LLM integration |

The architecture must make adding a new game as simple as:
1. Define game config (prompts, validation logic, difficulty curve)
2. Compose existing UI components (or build game-specific ones)
3. Plug into shared audio and theory layers

---

## Phase 1: Tonic Target Practice

### Core Concept

**The Problem**: Musicians with perfect pitch often process harmony through absolute note identification, then calculate intervals/function. This is slow and doesn't build intuition.

**The Solution**: Rapid, randomized ii-V-I drills that make absolute pitch useless (because the key changes constantly) and reinforce the *feeling* of the progression.

**The Flow**:
1. App displays a random key
2. User hears the I chord as reference
3. User selects three chords (ii → V → I) from a grid
4. App plays back their selection
5. Feedback: correct/incorrect with visual + audio confirmation
6. Repeat in a new random key

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | Bun | Fast, modern, built-in test runner |
| Framework | Next.js 14 (App Router) | Easy Vercel deployment, good DX, React Server Components |
| Language | TypeScript (strict mode) | Type safety for music theory primitives |
| Styling | Tailwind CSS | Rapid iteration, consistent design tokens |
| Components | shadcn/ui (selective) | Clean, minimal, customizable - not the whole library |
| Audio | Tone.js + Salamander Piano Samples | Industry standard, high-quality sampled piano |
| State | Zustand | Lightweight, simple, no boilerplate |
| Testing | Bun test + Playwright | Unit tests + browser/UI testing |
| Deployment | Vercel | Zero-config, instant deploys |

### Testing Strategy

Tests are first-class citizens. We use a layered approach:

1. **Unit Tests (Bun test)**: Pure logic - music theory functions, validation, state transitions
2. **Component Tests (Bun test + React Testing Library)**: Isolated component behavior
3. **Integration/E2E Tests (Playwright)**: Full user flows in real browser
4. **Manual Browser Testing via MCP**: Interactive testing during development

```
┌─────────────────────────────────────────────────────────────┐
│                     Testing Pyramid                         │
│                                                             │
│                        ┌─────┐                              │
│                       /  E2E  \         (Playwright)        │
│                      /─────────\                            │
│                     / Component \       (Bun + RTL)         │
│                    /─────────────\                          │
│                   /     Unit      \     (Bun test)          │
│                  /─────────────────\                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

The structure separates **platform foundation** (shared across all games) from **game-specific code**.

```
harmony-lab/
├── public/
│   └── samples/
│       └── piano/           # Salamander piano samples (lazy-loaded)
│           ├── A1.mp3
│           ├── A2.mp3
│           └── ... (one sample per ~3 semitones, Tone.js interpolates)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout, fonts, global styles
│   │   ├── page.tsx         # Home/game selector (future: list of games)
│   │   ├── globals.css      # Tailwind imports + CSS variables
│   │   └── games/
│   │       └── tonic-target/
│   │           └── page.tsx # Tonic Target Practice game page
│   │
│   ├── components/
│   │   ├── ui/              # shadcn primitives (button, card, etc.)
│   │   │
│   │   ├── shared/          # Platform-wide shared components
│   │   │   ├── GameShell.tsx        # Generic game container (header, footer, layout)
│   │   │   ├── LoadingScreen.tsx    # Sample loading state
│   │   │   ├── SettingsPanel.tsx    # Shared settings UI
│   │   │   └── TheoryCard.tsx       # Reusable theory snippet display
│   │   │
│   │   └── games/
│   │       └── tonic-target/        # Game-specific components
│   │           ├── TonicTargetGame.tsx    # Main game orchestrator
│   │           ├── KeyDisplay.tsx         # Shows current key
│   │           ├── ChordGrid.tsx          # Selectable chord buttons
│   │           ├── ProgressionSlots.tsx   # Shows ii → V → I selection
│   │           ├── PlaybackControls.tsx   # Hear tonic, submit answer
│   │           ├── FeedbackDisplay.tsx    # Correct/incorrect + explanation
│   │           └── SessionStats.tsx       # Time, rounds, accuracy
│   │
│   ├── lib/
│   │   ├── music/                   # 🎵 PLATFORM CORE - Music theory primitives
│   │   │   ├── constants.ts         # Note names, intervals, etc.
│   │   │   ├── types.ts             # Note, Chord, Key, Progression types
│   │   │   ├── chords.ts            # Chord construction utilities
│   │   │   ├── scales.ts            # Scale generation (major, minor, modes)
│   │   │   ├── keys.ts              # Key utilities, transposition
│   │   │   ├── intervals.ts         # Interval calculation
│   │   │   ├── progressions.ts      # Progression builders (ii-V-I, etc.)
│   │   │   └── voicings.ts          # Voicing algorithms (piano, guitar)
│   │   │
│   │   ├── audio/                   # 🔊 PLATFORM CORE - Audio engine
│   │   │   ├── engine.ts            # Tone.js setup, sample loading
│   │   │   ├── playback.ts          # Play chord, play progression
│   │   │   ├── instruments.ts       # Sampler configurations
│   │   │   └── context.tsx          # React context for audio state
│   │   │
│   │   ├── game-engine/             # 🎮 PLATFORM CORE - Generic game logic
│   │   │   ├── types.ts             # GameConfig, GameState, Round types
│   │   │   ├── createGame.ts        # Factory for game instances
│   │   │   └── hooks.ts             # useGameEngine hook
│   │   │
│   │   └── utils.ts                 # General helpers
│   │
│   ├── games/                       # 🎯 GAME DEFINITIONS
│   │   └── tonic-target/
│   │       ├── config.ts            # Game configuration
│   │       ├── logic.ts             # Round generation, validation
│   │       ├── types.ts             # Game-specific types
│   │       └── theoryCards.ts       # Guitar voicing cards for this game
│   │
│   ├── stores/
│   │   ├── audioStore.ts            # Audio loading state, instrument selection
│   │   └── settingsStore.ts         # User preferences (persisted)
│   │
│   ├── data/
│   │   └── guitarVoicings.ts        # Static voicing diagrams
│   │
│   └── hooks/
│       ├── useAudio.ts              # Audio engine hook
│       └── useKeyboardShortcuts.ts  # Optional keyboard controls
│
├── tests/
│   ├── unit/                        # Bun test - pure logic
│   │   ├── music/
│   │   │   ├── scales.test.ts
│   │   │   ├── chords.test.ts
│   │   │   ├── progressions.test.ts
│   │   │   └── voicings.test.ts
│   │   └── games/
│   │       └── tonic-target/
│   │           └── logic.test.ts
│   │
│   ├── components/                  # Component tests
│   │   └── games/
│   │       └── tonic-target/
│   │           ├── ChordGrid.test.tsx
│   │           └── ProgressionSlots.test.tsx
│   │
│   └── e2e/                         # Playwright browser tests
│       ├── tonic-target.spec.ts     # Full game flow
│       └── audio.spec.ts            # Audio playback tests
│
├── playwright.config.ts
├── bunfig.toml
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Key Architecture Decisions

1. **`lib/music/`** is the foundation - pure functions, no React, no side effects. Any game can import these.

2. **`lib/audio/`** wraps Tone.js with a clean API. Games don't touch Tone directly.

3. **`lib/game-engine/`** provides a generic game loop pattern. Games define config, engine handles state.

4. **`games/[game-name]/`** contains game-specific logic separated from UI components.

5. **`components/games/[game-name]/`** contains game-specific UI, composed from shared components.

6. **Tests mirror source structure** for easy navigation.

---

## Data Models

### Core Types

```typescript
// src/lib/music/types.ts

// Chromatic note names (using sharps for simplicity)
type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

// A specific pitch (note + octave)
interface Pitch {
  note: NoteName;
  octave: number; // e.g., 4 for middle C
}

// Chord quality
type ChordQuality = 'maj7' | 'min7' | '7' | 'min7b5' | 'dim7' | 'maj' | 'min';

// A chord defined by root + quality
interface Chord {
  root: NoteName;
  quality: ChordQuality;
  degree: ScaleDegree; // What function does this serve in the current key?
}

// Scale degrees (1-indexed to match music theory convention)
type ScaleDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// Roman numeral representation
type RomanNumeral = 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'vii°';

// A key (tonic + mode, though MVP is major only)
interface Key {
  tonic: NoteName;
  mode: 'major'; // Expand later: 'minor' | 'dorian' | etc.
}

// The three chords in a ii-V-I
interface Progression {
  ii: Chord;
  V: Chord;
  I: Chord;
}

// A voicing is the specific pitches to play
interface Voicing {
  chord: Chord;
  pitches: Pitch[]; // Ordered from bass to soprano
}

// User's answer
interface Answer {
  ii: Chord | null;
  V: Chord | null;
  I: Chord | null;
}

// Round state
interface Round {
  key: Key;
  correctProgression: Progression;
  userAnswer: Answer;
  isComplete: boolean;
  isCorrect: boolean | null;
}

// Session stats
interface SessionStats {
  startTime: Date;
  roundsCompleted: number;
  roundsCorrect: number;
  currentStreak: number; // Not displayed prominently, but tracked
}
```

### Chord Grid Data

```typescript
// The 7 diatonic chords for display (will be transposed per key)
const DIATONIC_DEGREES: { degree: ScaleDegree; quality: ChordQuality; roman: RomanNumeral }[] = [
  { degree: 1, quality: 'maj7', roman: 'I' },
  { degree: 2, quality: 'min7', roman: 'ii' },
  { degree: 3, quality: 'min7', roman: 'iii' },
  { degree: 4, quality: 'maj7', roman: 'IV' },
  { degree: 5, quality: '7', roman: 'V' },
  { degree: 6, quality: 'min7', roman: 'vi' },
  { degree: 7, quality: 'min7b5', roman: 'vii°' },
];
```

---

## Game Engine Architecture

The game engine provides a generic pattern for all music practice games. Each game is defined by a **config** that the engine interprets.

### Game Config Interface

```typescript
// src/lib/game-engine/types.ts

interface GameConfig<TRound, TAnswer, TSettings> {
  // Metadata
  id: string;
  name: string;
  description: string;
  
  // Round lifecycle
  generateRound: (settings: TSettings) => TRound;
  validateAnswer: (round: TRound, answer: TAnswer) => ValidationResult;
  
  // Settings
  defaultSettings: TSettings;
  difficultyPresets: Record<DifficultyLevel, Partial<TSettings>>;
  
  // Audio
  getRoundAudio: (round: TRound) => AudioCue[];       // What to play for reference
  getAnswerAudio: (answer: TAnswer) => AudioCue[];    // What to play when submitted
  getCorrectAudio: (round: TRound) => AudioCue[];     // What to play as feedback
  
  // Theory integration
  getTheoryCards: (round: TRound, wasCorrect: boolean) => TheoryCard[];
}

interface ValidationResult {
  isCorrect: boolean;
  feedback?: string;
  correctAnswer?: any;  // For display
}

interface AudioCue {
  type: 'chord' | 'progression' | 'note';
  data: Voicing | Voicing[] | Pitch;
  timing?: number;  // Delay in ms
}

type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
```

### Tonic Target Config Example

```typescript
// src/games/tonic-target/config.ts

import { GameConfig } from '@/lib/game-engine/types';
import { TonicTargetRound, TonicTargetAnswer, TonicTargetSettings } from './types';
import { generateRound, validateAnswer } from './logic';

export const tonicTargetConfig: GameConfig<
  TonicTargetRound,
  TonicTargetAnswer,
  TonicTargetSettings
> = {
  id: 'tonic-target',
  name: 'Tonic Target Practice',
  description: 'Build ii-V-I progressions in random keys',
  
  generateRound,
  validateAnswer,
  
  defaultSettings: {
    showChordNames: true,
    showColors: true,
    autoPlayTonic: true,
    playbackTempo: 100,
    includeBassNote: true,
  },
  
  difficultyPresets: {
    1: { showChordNames: true, showColors: true, autoPlayTonic: true },
    2: { showChordNames: true, showColors: true, autoPlayTonic: true },
    3: { showChordNames: false, showColors: true, autoPlayTonic: true },
    4: { showChordNames: false, showColors: false, autoPlayTonic: true },
    5: { showChordNames: false, showColors: false, autoPlayTonic: false },
  },
  
  getRoundAudio: (round) => [{
    type: 'chord',
    data: getVoicingWithBass(round.correctProgression.I),
  }],
  
  getAnswerAudio: (answer) => [{
    type: 'progression',
    data: [
      getVoicing(answer.ii!),
      getVoicing(answer.V!),
      getVoicing(answer.I!),
    ],
  }],
  
  getCorrectAudio: (round) => [{
    type: 'progression',
    data: [
      getVoicing(round.correctProgression.ii),
      getVoicing(round.correctProgression.V),
      getVoicing(round.correctProgression.I),
    ],
  }],
  
  getTheoryCards: (round, wasCorrect) => {
    if (wasCorrect) return [];
    return [getRandomVoicingCard(round.key)];
  },
};
```

### useGameEngine Hook

```typescript
// src/lib/game-engine/hooks.ts

function useGameEngine<TRound, TAnswer, TSettings>(
  config: GameConfig<TRound, TAnswer, TSettings>
) {
  const [round, setRound] = useState<TRound | null>(null);
  const [answer, setAnswer] = useState<TAnswer | null>(null);
  const [feedback, setFeedback] = useState<ValidationResult | null>(null);
  const [session, setSession] = useState<SessionStats>(initialSession);
  const settings = useSettingsStore((s) => s.getGameSettings(config.id));
  const { playAudioCues } = useAudio();
  
  const startRound = useCallback(() => {
    const newRound = config.generateRound(settings);
    setRound(newRound);
    setAnswer(null);
    setFeedback(null);
    
    if (settings.autoPlayTonic) {
      playAudioCues(config.getRoundAudio(newRound));
    }
  }, [config, settings]);
  
  const submitAnswer = useCallback((ans: TAnswer) => {
    if (!round) return;
    
    const result = config.validateAnswer(round, ans);
    setFeedback(result);
    
    // Play the user's answer
    playAudioCues(config.getAnswerAudio(ans));
    
    // Update session stats
    setSession(prev => ({
      ...prev,
      roundsCompleted: prev.roundsCompleted + 1,
      roundsCorrect: prev.roundsCorrect + (result.isCorrect ? 1 : 0),
    }));
  }, [round, config]);
  
  const playCorrectAnswer = useCallback(() => {
    if (!round) return;
    playAudioCues(config.getCorrectAudio(round));
  }, [round, config]);
  
  return {
    round,
    answer,
    feedback,
    session,
    startRound,
    submitAnswer,
    playCorrectAnswer,
    theoryCards: round && feedback 
      ? config.getTheoryCards(round, feedback.isCorrect)
      : [],
  };
}
```

### Adding a New Game

To add a new game (e.g., "Chord Crush Clone"):

1. **Define types** in `src/games/chord-crush/types.ts`
2. **Implement logic** in `src/games/chord-crush/logic.ts` (generateRound, validateAnswer)
3. **Create config** in `src/games/chord-crush/config.ts` using the GameConfig interface
4. **Build UI components** in `src/components/games/chord-crush/` (can reuse ChordGrid, etc.)
5. **Add route** at `src/app/games/chord-crush/page.tsx`
6. **Write tests** in `tests/unit/games/chord-crush/`

The game engine handles state management, audio playback, and session tracking automatically.

---

## Game Logic

### Round Generation

```typescript
// src/lib/music/progressions.ts

function generateRound(): Round {
  // 1. Pick a random key (all 12 major keys equally likely)
  const key = getRandomKey();
  
  // 2. Build the correct ii-V-I for this key
  const correctProgression = buildTwoFiveOne(key);
  
  // 3. Return initial round state
  return {
    key,
    correctProgression,
    userAnswer: { ii: null, V: null, I: null },
    isComplete: false,
    isCorrect: null,
  };
}

function buildTwoFiveOne(key: Key): Progression {
  const scale = getMajorScale(key.tonic);
  
  return {
    ii: { root: scale[1], quality: 'min7', degree: 2 },  // 2nd degree
    V:  { root: scale[4], quality: '7', degree: 5 },     // 5th degree
    I:  { root: scale[0], quality: 'maj7', degree: 1 },  // 1st degree
  };
}

function getMajorScale(tonic: NoteName): NoteName[] {
  const chromatic: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const majorIntervals = [0, 2, 4, 5, 7, 9, 11]; // W-W-H-W-W-W-H
  const tonicIndex = chromatic.indexOf(tonic);
  
  return majorIntervals.map(interval => chromatic[(tonicIndex + interval) % 12]);
}
```

### Answer Validation

```typescript
function validateAnswer(round: Round): boolean {
  const { correctProgression, userAnswer } = round;
  
  return (
    userAnswer.ii?.root === correctProgression.ii.root &&
    userAnswer.ii?.quality === correctProgression.ii.quality &&
    userAnswer.V?.root === correctProgression.V.root &&
    userAnswer.V?.quality === correctProgression.V.quality &&
    userAnswer.I?.root === correctProgression.I.root &&
    userAnswer.I?.quality === correctProgression.I.quality
  );
}
```

---

## Audio Implementation

### Sample Loading Strategy

```typescript
// src/lib/audio/engine.ts

import * as Tone from 'tone';

// Lazy-load samples - only fetch when first needed
let pianoSampler: Tone.Sampler | null = null;
let isLoading = false;
let isLoaded = false;

export async function initAudio(): Promise<void> {
  if (isLoaded || isLoading) return;
  
  isLoading = true;
  
  // Salamander Grand Piano - using a subset for faster loading
  // Full set is ~50MB, we use ~15MB by sampling every 3rd note
  pianoSampler = new Tone.Sampler({
    urls: {
      'A0': 'A0.mp3',
      'C1': 'C1.mp3',
      'D#1': 'Ds1.mp3',
      'F#1': 'Fs1.mp3',
      'A1': 'A1.mp3',
      'C2': 'C2.mp3',
      'D#2': 'Ds2.mp3',
      'F#2': 'Fs2.mp3',
      'A2': 'A2.mp3',
      'C3': 'C3.mp3',
      'D#3': 'Ds3.mp3',
      'F#3': 'Fs3.mp3',
      'A3': 'A3.mp3',
      'C4': 'C4.mp3',
      'D#4': 'Ds4.mp3',
      'F#4': 'Fs4.mp3',
      'A4': 'A4.mp3',
      'C5': 'C5.mp3',
      'D#5': 'Ds5.mp3',
      'F#5': 'Fs5.mp3',
      'A5': 'A5.mp3',
      'C6': 'C6.mp3',
      'D#6': 'Ds6.mp3',
      'F#6': 'Fs6.mp3',
      'A6': 'A6.mp3',
      'C7': 'C7.mp3',
      'D#7': 'Ds7.mp3',
      'F#7': 'Fs7.mp3',
      'A7': 'A7.mp3',
      'C8': 'C8.mp3',
    },
    release: 1,
    baseUrl: '/samples/piano/',
  }).toDestination();
  
  // Wait for all samples to load
  await Tone.loaded();
  isLoaded = true;
  isLoading = false;
}

export function getLoadingState(): { isLoading: boolean; isLoaded: boolean } {
  return { isLoading, isLoaded };
}
```

### Playback Functions

```typescript
// src/lib/audio/playback.ts

import * as Tone from 'tone';

// Play a single chord
export async function playChord(voicing: Voicing, duration: string = '2n'): Promise<void> {
  await Tone.start(); // Required for browser autoplay policy
  
  const pitchStrings = voicing.pitches.map(p => `${p.note}${p.octave}`);
  pianoSampler?.triggerAttackRelease(pitchStrings, duration);
}

// Play a ii-V-I progression with timing
export async function playProgression(
  voicings: { ii: Voicing; V: Voicing; I: Voicing },
  tempo: number = 100 // BPM
): Promise<void> {
  await Tone.start();
  
  const now = Tone.now();
  const beatDuration = 60 / tempo;
  
  // ii chord - beats 1-2
  const iiPitches = voicings.ii.pitches.map(p => `${p.note}${p.octave}`);
  pianoSampler?.triggerAttackRelease(iiPitches, '2n', now);
  
  // V chord - beats 3-4
  const vPitches = voicings.V.pitches.map(p => `${p.note}${p.octave}`);
  pianoSampler?.triggerAttackRelease(vPitches, '2n', now + beatDuration * 2);
  
  // I chord - beats 5-8 (longer for resolution)
  const iPitches = voicings.I.pitches.map(p => `${p.note}${p.octave}`);
  pianoSampler?.triggerAttackRelease(iPitches, '1n', now + beatDuration * 4);
}
```

### Voicing Algorithm

```typescript
// src/lib/music/voicings.ts

// Generate a jazz-appropriate piano voicing for a chord
// Using "rootless" voicings in the left hand range (C3-C4)
// These are the Bill Evans style voicings

export function getVoicing(chord: Chord): Voicing {
  const { root, quality } = chord;
  const rootMidi = noteToMidi(root, 3); // Start from octave 3
  
  let intervals: number[];
  
  switch (quality) {
    case 'maj7':
      // 3-5-7-9 voicing (no root)
      intervals = [4, 7, 11, 14];
      break;
    case 'min7':
      // 3-5-7-9 voicing
      intervals = [3, 7, 10, 14];
      break;
    case '7':
      // 3-7-9-13 voicing (dominant)
      intervals = [4, 10, 14, 21];
      break;
    case 'min7b5':
      // 3-5-7-11 voicing
      intervals = [3, 6, 10, 17];
      break;
    default:
      // Simple triad + 7
      intervals = [4, 7, 11];
  }
  
  const pitches = intervals.map(interval => midiToPitch(rootMidi + interval));
  
  return { chord, pitches };
}

// Include root in bass for clearer sound (optional, toggle in settings)
export function getVoicingWithBass(chord: Chord): Voicing {
  const baseVoicing = getVoicing(chord);
  const bassNote: Pitch = { note: chord.root, octave: 2 };
  
  return {
    ...baseVoicing,
    pitches: [bassNote, ...baseVoicing.pitches],
  };
}
```

---

## UI Components

### Design Tokens

```css
/* src/app/globals.css */

:root {
  /* Colors - Warm dark theme */
  --background: #0f0f14;
  --background-elevated: #1a1a24;
  --background-hover: #252532;
  
  --text-primary: #f5f5f7;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  
  --accent: #f4a261;          /* Warm amber */
  --accent-hover: #e8975a;
  --accent-muted: rgba(244, 162, 97, 0.15);
  
  --success: #4ade80;
  --success-muted: rgba(74, 222, 128, 0.15);
  
  --error: #f87171;
  --error-muted: rgba(248, 113, 113, 0.15);
  
  /* Scale degree colors (for color mode) */
  --degree-1: #fef3c7;  /* Warm white/yellow - home */
  --degree-2: #c4b5fd;  /* Soft purple - preparation */
  --degree-3: #bbf7d0;  /* Pale green - bittersweet */
  --degree-4: #fed7aa;  /* Orange - hopeful */
  --degree-5: #fca5a5;  /* Red - tension */
  --degree-6: #93c5fd;  /* Blue - melancholy */
  --degree-7: #d4d4d8;  /* Grey - unstable */
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing */
  --radius: 12px;
  --radius-sm: 8px;
}
```

### Component Specifications

#### GameShell.tsx
The main container that orchestrates the game flow.

```tsx
// Responsibilities:
// - Manages overall game state via useGame hook
// - Handles transitions between rounds
// - Controls layout of child components

// Layout:
// ┌─────────────────────────────────────────┐
// │  Header (settings icon, title, help)    │
// ├─────────────────────────────────────────┤
// │  KeyDisplay                             │
// │  ─────────────────────────────────────  │
// │  ProgressionSlots                       │
// │  ─────────────────────────────────────  │
// │  ChordGrid                              │
// │  ─────────────────────────────────────  │
// │  PlaybackControls                       │
// ├─────────────────────────────────────────┤
// │  SessionStats (subtle, bottom)          │
// └─────────────────────────────────────────┘
```

#### KeyDisplay.tsx
Shows the current key prominently.

```tsx
interface KeyDisplayProps {
  keySignature: Key;
  difficulty: DifficultyLevel;
}

// At Level 1-3: Shows "C Major" or "F# Major"
// At Level 4-5: Hidden or shows "?" 

// Includes "Hear Tonic" button that plays the I chord
```

#### ChordGrid.tsx
The main interaction surface.

```tsx
interface ChordGridProps {
  currentKey: Key;
  difficulty: DifficultyLevel;
  onChordSelect: (chord: Chord) => void;
  selectedChords: Answer;
  disabled: boolean; // During playback/feedback
}

// Renders 7 chord buttons in a pleasing layout:
//
//   [ Imaj7 ]  [ ii7 ]  [ iii7 ]  [ IVmaj7 ]
//
//        [ V7 ]    [ vi7 ]    [ vii°7 ]
//
// At lower difficulty: shows "Dm7", "G7", "Cmaj7"
// At higher difficulty: shows "ii7", "V7", "Imaj7"
//
// Visual states:
// - Default: dark background, subtle border
// - Hover: slight lift, brighter border
// - Selected (as ii): amber glow, "ii" badge
// - Selected (as V): amber glow, "V" badge  
// - Selected (as I): amber glow, "I" badge
// - Disabled: dimmed
```

#### ProgressionSlots.tsx
Shows the user's current selection.

```tsx
interface ProgressionSlotsProps {
  answer: Answer;
  onSlotClick: (slot: 'ii' | 'V' | 'I') => void; // To deselect
}

// Visual representation:
//
//   ┌─────┐      ┌─────┐      ┌─────┐
//   │ ii  │  →   │  V  │  →   │  I  │
//   │Dm7  │      │ G7  │      │ ___ │
//   └─────┘      └─────┘      └─────┘
//
// Empty slots show dashed border
// Filled slots show the chord name
// Click a filled slot to clear it
```

#### PlaybackControls.tsx

```tsx
interface PlaybackControlsProps {
  onHearTonic: () => void;
  onSubmit: () => void;
  onPlaySelection: () => void;
  canSubmit: boolean; // All 3 chords selected
  isPlaying: boolean;
}

// Buttons:
// [ ▶ Hear Tonic ]  [ ▶ Play My Answer ]  [ Submit ]
//
// "Hear Tonic" - always available
// "Play My Answer" - available when at least 1 chord selected
// "Submit" - available when all 3 selected, triggers validation
```

#### FeedbackDisplay.tsx

```tsx
interface FeedbackDisplayProps {
  isCorrect: boolean;
  correctProgression: Progression;
  userProgression: Progression;
  onNextRound: () => void;
  theoryCard?: TheoryCardData; // Optional contextual tip
}

// Correct state:
// ┌─────────────────────────────────────────┐
// │  ✓ Nice!                                │
// │                                          │
// │  Dm7 → G7 → Cmaj7                       │
// │                                          │
// │  [ ▶ Hear It Again ]    [ Next Round ]  │
// └─────────────────────────────────────────┘

// Incorrect state:
// ┌─────────────────────────────────────────┐
// │  ✗ Not quite                            │
// │                                          │
// │  You played:   Em7 → A7 → Dmaj7         │
// │  Correct:      Dm7 → G7 → Cmaj7         │
// │                                          │
// │  [ ▶ Hear Correct ]     [ Next Round ]  │
// │                                          │
// │  ┌─ Theory Tip ──────────────────────┐  │
// │  │ Remember: ii is always a minor    │  │
// │  │ 7th built on the 2nd degree.      │  │
// │  └───────────────────────────────────┘  │
// └─────────────────────────────────────────┘
```

#### SessionStats.tsx

```tsx
// Subtle footer showing:
// "12 min • 18 rounds • 72% accuracy"
//
// Non-prominent, no gamification emphasis
// Just useful info at a glance
```

---

## State Management

### gameStore.ts

```typescript
// src/stores/gameStore.ts

import { create } from 'zustand';

interface GameState {
  // Current round
  currentRound: Round | null;
  
  // User's in-progress answer
  answer: Answer;
  
  // Session tracking
  session: SessionStats;
  
  // UI state
  isPlaying: boolean;
  showFeedback: boolean;
  
  // Actions
  startNewRound: () => void;
  selectChord: (chord: Chord, slot: 'ii' | 'V' | 'I') => void;
  clearSlot: (slot: 'ii' | 'V' | 'I') => void;
  submitAnswer: () => void;
  nextRound: () => void;
  resetSession: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentRound: null,
  answer: { ii: null, V: null, I: null },
  session: {
    startTime: new Date(),
    roundsCompleted: 0,
    roundsCorrect: 0,
    currentStreak: 0,
  },
  isPlaying: false,
  showFeedback: false,
  
  startNewRound: () => {
    const round = generateRound();
    set({ 
      currentRound: round, 
      answer: { ii: null, V: null, I: null },
      showFeedback: false,
    });
  },
  
  selectChord: (chord, slot) => {
    const { answer } = get();
    set({ answer: { ...answer, [slot]: chord } });
  },
  
  clearSlot: (slot) => {
    const { answer } = get();
    set({ answer: { ...answer, [slot]: null } });
  },
  
  submitAnswer: () => {
    const { currentRound, answer, session } = get();
    if (!currentRound) return;
    
    const isCorrect = validateAnswer({ ...currentRound, userAnswer: answer });
    
    set({
      currentRound: { ...currentRound, isComplete: true, isCorrect },
      showFeedback: true,
      session: {
        ...session,
        roundsCompleted: session.roundsCompleted + 1,
        roundsCorrect: session.roundsCorrect + (isCorrect ? 1 : 0),
        currentStreak: isCorrect ? session.currentStreak + 1 : 0,
      },
    });
  },
  
  nextRound: () => {
    get().startNewRound();
  },
  
  resetSession: () => {
    set({
      session: {
        startTime: new Date(),
        roundsCompleted: 0,
        roundsCorrect: 0,
        currentStreak: 0,
      },
    });
    get().startNewRound();
  },
}));
```

### settingsStore.ts

```typescript
// src/stores/settingsStore.ts

interface SettingsState {
  difficulty: DifficultyLevel;
  showChordNames: boolean;      // false = degrees only
  showColors: boolean;          // Scale degree colors
  includeBassNote: boolean;     // Fuller voicings
  playbackTempo: number;        // BPM for progression playback
  autoPlayTonic: boolean;       // Play I chord automatically each round
  
  // Actions
  setDifficulty: (level: DifficultyLevel) => void;
  toggleSetting: (key: keyof SettingsState) => void;
  setTempo: (bpm: number) => void;
}

type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// Difficulty presets:
// Level 1: showChordNames=true, showColors=true, autoPlayTonic=true
// Level 2: showChordNames=true, showColors=true, autoPlayTonic=true
// Level 3: showChordNames=false, showColors=true, autoPlayTonic=true
// Level 4: showChordNames=false, showColors=false, autoPlayTonic=true
// Level 5: showChordNames=false, showColors=false, autoPlayTonic=false
```

---

## Difficulty Levels (Detailed)

| Level | Key Shown | Chord Display | Colors | Auto Tonic | Notes |
|-------|-----------|---------------|--------|------------|-------|
| 1 | Yes | Names (Dm7) | Yes | Yes | Full training wheels |
| 2 | Yes | Names + Degrees | Yes | Yes | Start associating |
| 3 | Yes | Degrees only (ii7) | Yes | Yes | Names hidden |
| 4 | Yes | Degrees only | No | Yes | Pure function |
| 5 | No | Degrees only | No | No | Derive key from ear |

---

## Guitar Voicing Theory Cards

These appear contextually (after wrong answers, or on-demand via help).

### Card 1: "ii-V-I Shell Voicings (Root on 5th String)"
```
Position: Root on A string

ii (Dm7)         V (G7)          I (Cmaj7)
x-5-x-5-6-x      x-10-x-10-10-x   x-3-x-4-5-x
  R   7 3          R    7  3        R   7 3

Move this shape up/down for any key.
The guide tones (3 & 7) swap positions between chords.
```

### Card 2: "ii-V-I Shell Voicings (Root on 6th String)"
```
Position: Root on E string

ii (Dm7)         V (G7)          I (Cmaj7)
x-x-10-10-9-10   3-x-3-4-3-x     8-x-9-9-8-x
     R  7 3 5    R   7 3 5       R   7 3 5

Same principle: 3rds and 7ths create the movement.
```

### Card 3: "The 3-7 Voice Leading Trick"
```
The magic of ii-V-I: the 3rd of one chord becomes 
the 7th of the next.

ii chord: 3rd = F
 V chord: 7th = F (same note!)
 V chord: 3rd = B  
 I chord: 7th = B (same note!)

This is why the progression feels so smooth.
Your fingers barely move.
```

### Card 4: "Drop 2 Voicings for Fuller Sound"
```
Take a close voicing, drop the 2nd-from-top note 
down an octave. Instant jazz guitar sound.

Cmaj7 close:    E B C G (top to bottom)
Cmaj7 drop 2:   E B G C

ii-V-I in C (Drop 2, root on 4th string):

Dm7: x-x-3-2-1-1
G7:  x-x-3-4-3-4  
Cmaj7: x-x-2-4-1-3
```

### Card 5: "Quick Reference: All 12 ii-V-I's"
```
Key     ii        V         I
─────────────────────────────
C       Dm7       G7        Cmaj7
Db      Ebm7      Ab7       Dbmaj7
D       Em7       A7        Dmaj7
Eb      Fm7       Bb7       Ebmaj7
E       F#m7      B7        Emaj7
F       Gm7       C7        Fmaj7
Gb      Abm7      Db7       Gbmaj7
G       Am7       D7        Gmaj7
Ab      Bbm7      Eb7       Abmaj7
A       Bm7       E7        Amaj7
Bb      Cm7       F7        Bbmaj7
B       C#m7      F#7       Bmaj7
```

---

## Sample Acquisition

### Salamander Grand Piano

**Source**: https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html

**License**: CC BY 3.0 (free for any use with attribution)

**What to download**: The "SalamanderGrandPianoV3" OGG or MP3 set

**Processing for web**:
1. Download the full set
2. Convert to MP3 if needed (for broader browser support)
3. Select a subset (every 3rd semitone) to reduce size: A0, C1, Eb1, F#1, A1, C2... etc.
4. Place in `/public/samples/piano/`

**Alternative CDN**: Use Tone.js's built-in sample CDN for prototyping:
```typescript
baseUrl: "https://tonejs.github.io/audio/salamander/"
```
This works for development but has latency. For production, self-host.

---

## User Flow (Step by Step)

### First Launch
1. User lands on page
2. Brief loading state while piano samples load (~2-3 seconds on good connection)
3. Tutorial overlay (skippable):
   - "Select the ii-V-I progression for the given key"
   - "Click three chords in order"
   - "Submit to check your answer"
4. First round begins

### Standard Round
1. Key displays: "G Major"
2. I chord (Gmaj7) plays automatically (if autoPlayTonic enabled)
3. User clicks chords from grid: Am7 → D7 → Gmaj7
4. Slots fill in as they click
5. User clicks "Submit"
6. Progression plays back
7. Feedback shows: "✓ Nice!" with green confirmation
8. User clicks "Next Round"
9. New key appears, repeat

### Wrong Answer
1. User submits wrong answer
2. Feedback shows both what they played and correct answer
3. "Hear Correct" button plays the right progression
4. Contextual theory card may appear
5. User clicks "Next Round"

### Settings Access
1. Click gear icon (top right)
2. Slide-out panel shows:
   - Difficulty level (1-5 slider with descriptions)
   - Individual toggles (colors, bass notes, etc.)
   - Playback tempo slider
3. Changes apply immediately
4. Click outside or X to close

---

## Keyboard Shortcuts (Nice to Have)

| Key | Action |
|-----|--------|
| `Space` | Submit answer / Next round |
| `1-7` | Select chord by degree |
| `R` | Hear tonic reference |
| `P` | Play current selection |
| `Backspace` | Clear last selection |
| `?` | Toggle help |

---

## Performance Considerations

1. **Sample Loading**: Show progress indicator, load samples in background, cache aggressively
2. **Audio Context**: Create on first user interaction (browser requirement)
3. **State Updates**: Zustand is already optimized, but avoid unnecessary re-renders in ChordGrid
4. **Animations**: Use CSS transforms/opacity only, avoid layout thrashing

---

## Testing Strategy

### Unit Tests (Bun test)
- `getMajorScale()` returns correct notes for all 12 keys
- `buildTwoFiveOne()` returns correct chords
- `validateAnswer()` correctly identifies right/wrong answers
- `getVoicing()` produces valid MIDI ranges

### Component Tests (Bun + React Testing Library)
- ChordGrid renders all 7 diatonic chords
- ChordGrid calls onSelect with correct chord when clicked
- ProgressionSlots displays selected chords correctly
- FeedbackDisplay shows correct/incorrect states

### E2E Tests (Playwright)
- Full round flow: start → select → submit → feedback → next
- Settings changes persist and apply correctly
- Audio plays without errors
- Keyboard shortcuts work
- Mobile responsive behavior

### Browser Testing via MCP
During development, use MCP browser tools to:
- Visually verify UI rendering and animations
- Test audio playback interactively
- Debug state transitions in real-time
- Verify responsive design at different viewports

### Test File Examples

```typescript
// tests/unit/music/scales.test.ts
import { describe, expect, test } from 'bun:test';
import { getMajorScale } from '@/lib/music/scales';

describe('getMajorScale', () => {
  test('returns correct scale for C major', () => {
    expect(getMajorScale('C')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  });

  test('returns correct scale for F# major', () => {
    expect(getMajorScale('F#')).toEqual(['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']);
  });

  test('handles all 12 keys without error', () => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    notes.forEach(note => {
      expect(() => getMajorScale(note)).not.toThrow();
      expect(getMajorScale(note)).toHaveLength(7);
    });
  });
});
```

```typescript
// tests/unit/games/tonic-target/logic.test.ts
import { describe, expect, test } from 'bun:test';
import { generateRound, validateAnswer } from '@/games/tonic-target/logic';

describe('generateRound', () => {
  test('generates valid round with correct ii-V-I', () => {
    const round = generateRound();
    
    expect(round.key).toBeDefined();
    expect(round.correctProgression.ii.quality).toBe('min7');
    expect(round.correctProgression.V.quality).toBe('7');
    expect(round.correctProgression.I.quality).toBe('maj7');
  });

  test('ii chord is built on 2nd degree', () => {
    // Test multiple times due to randomness
    for (let i = 0; i < 20; i++) {
      const round = generateRound();
      const scale = getMajorScale(round.key.tonic);
      expect(round.correctProgression.ii.root).toBe(scale[1]);
    }
  });
});

describe('validateAnswer', () => {
  test('returns true for correct answer', () => {
    const round = generateRound();
    const answer = {
      ii: round.correctProgression.ii,
      V: round.correctProgression.V,
      I: round.correctProgression.I,
    };
    expect(validateAnswer(round, answer)).toBe(true);
  });

  test('returns false for wrong ii chord', () => {
    const round = generateRound();
    const answer = {
      ii: { ...round.correctProgression.ii, root: 'X' as any },
      V: round.correctProgression.V,
      I: round.correctProgression.I,
    };
    expect(validateAnswer(round, answer)).toBe(false);
  });
});
```

```typescript
// tests/e2e/tonic-target.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Tonic Target Practice', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/tonic-target');
    // Wait for samples to load
    await page.waitForSelector('[data-testid="game-ready"]');
  });

  test('completes a full round successfully', async ({ page }) => {
    // Get the current key displayed
    const keyDisplay = await page.locator('[data-testid="key-display"]').textContent();
    expect(keyDisplay).toMatch(/[A-G]#? Major/);

    // Click ii chord (second in grid)
    await page.click('[data-testid="chord-degree-2"]');
    
    // Click V chord (fifth in grid)
    await page.click('[data-testid="chord-degree-5"]');
    
    // Click I chord (first in grid)
    await page.click('[data-testid="chord-degree-1"]');

    // Verify slots are filled
    await expect(page.locator('[data-testid="slot-ii"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="slot-V"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="slot-I"]')).not.toBeEmpty();

    // Submit answer
    await page.click('[data-testid="submit-button"]');

    // Should show correct feedback
    await expect(page.locator('[data-testid="feedback-correct"]')).toBeVisible();
  });

  test('shows incorrect feedback for wrong answer', async ({ page }) => {
    // Select wrong chords (iii-vi-IV instead of ii-V-I)
    await page.click('[data-testid="chord-degree-3"]');
    await page.click('[data-testid="chord-degree-6"]');
    await page.click('[data-testid="chord-degree-4"]');

    await page.click('[data-testid="submit-button"]');

    // Should show incorrect feedback with correct answer
    await expect(page.locator('[data-testid="feedback-incorrect"]')).toBeVisible();
    await expect(page.locator('[data-testid="correct-answer"]')).toBeVisible();
  });

  test('keyboard shortcuts work', async ({ page }) => {
    // Press 2 for ii chord
    await page.keyboard.press('2');
    await expect(page.locator('[data-testid="slot-ii"]')).not.toBeEmpty();

    // Press 5 for V chord
    await page.keyboard.press('5');
    await expect(page.locator('[data-testid="slot-V"]')).not.toBeEmpty();

    // Press 1 for I chord
    await page.keyboard.press('1');
    await expect(page.locator('[data-testid="slot-I"]')).not.toBeEmpty();

    // Press Space to submit
    await page.keyboard.press('Space');
    await expect(page.locator('[data-testid="feedback-correct"]')).toBeVisible();
  });

  test('settings persist across page reload', async ({ page }) => {
    // Open settings
    await page.click('[data-testid="settings-button"]');
    
    // Change difficulty to 3
    await page.click('[data-testid="difficulty-3"]');
    
    // Close settings
    await page.click('[data-testid="settings-close"]');

    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="game-ready"]');

    // Open settings again
    await page.click('[data-testid="settings-button"]');
    
    // Verify difficulty is still 3
    await expect(page.locator('[data-testid="difficulty-3"]')).toHaveAttribute('data-selected', 'true');
  });
});
```

### Running Tests

```bash
# Run all unit tests
bun test

# Run unit tests in watch mode
bun test --watch

# Run specific test file
bun test tests/unit/music/scales.test.ts

# Run E2E tests
bunx playwright test

# Run E2E tests with UI
bunx playwright test --ui

# Run E2E tests in headed mode (see browser)
bunx playwright test --headed
```

### Test Coverage Requirements

Before merging any PR:
- All unit tests pass
- All E2E tests pass
- New features have corresponding tests
- Music theory functions have 100% coverage (these are critical)

### Manual Testing Checklist
- [ ] All 12 keys generate correct ii-V-I
- [ ] Audio plays cleanly, no clicks/pops
- [ ] UI is responsive on mobile (test via MCP at 375px width)
- [ ] Keyboard shortcuts work
- [ ] Settings persist across page refresh
- [ ] Loading state shows during sample fetch
- [ ] Color mode colors are visually distinct
- [ ] Feedback animations feel satisfying

---

## Future Phases

### Phase 2: Expand Tonic Target + Add Second Game
- **Tonic Target v2**: Add "target any degree" mode with secondary dominants
- **Chord Crush Clone**: New game using same ChordGrid, Audio, progression types
- Refactor any shared patterns discovered during second game development
- Add game selector to home page

### Phase 3: LLM Game Generator
- Chat interface to brainstorm game concepts
- Game config schema for dynamic rendering
- Save/share custom game configs
- Validate generated configs against platform capabilities

### Phase 4: Additional Instruments + Sound Options
- Guitar samples (nylon, steel string)
- Electric piano (Rhodes, Wurlitzer)
- Organ
- Instrument selector in settings

### Phase 5: Progress Tracking + Insights
- Local storage for session history
- Visualizations of improvement over time
- Per-key accuracy tracking
- Spaced repetition suggestions for weak areas

### Phase 6: Community + Sharing
- Share custom game configs
- Leaderboards (opt-in, non-competitive focus)
- Curated game packs for specific skills

---

## Getting Started Commands

```bash
# Create Next.js project with bun
bunx create-next-app@latest harmony-lab --typescript --tailwind --eslint --app --src-dir

# Navigate to project
cd harmony-lab

# Install dependencies
bun add tone zustand

# Install dev dependencies
bun add -d @testing-library/react @testing-library/jest-dom @playwright/test

# Install shadcn (select components as needed)
bunx shadcn-ui@latest init
bunx shadcn-ui@latest add button card slider

# Install Playwright browsers
bunx playwright install

# Create folder structure
mkdir -p src/lib/music src/lib/audio src/lib/game-engine
mkdir -p src/stores src/hooks src/data
mkdir -p src/components/shared src/components/games/tonic-target
mkdir -p src/games/tonic-target
mkdir -p src/app/games/tonic-target
mkdir -p tests/unit/music tests/unit/games/tonic-target
mkdir -p tests/components/games/tonic-target
mkdir -p tests/e2e

# Download piano samples (manual step)
# Place in public/samples/piano/

# Run dev server
bun dev

# Run tests
bun test

# Run E2E tests
bunx playwright test
```

### bunfig.toml

```toml
[test]
preload = ["./tests/setup.ts"]

[test.coverage]
enabled = true
reporter = ["text", "lcov"]
```

### Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'bun dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Success Criteria for Phase 1

### Game Quality
1. **Functional**: Can complete rounds in all 12 keys with correct validation
2. **Beautiful**: UI feels inspiring, not like homework
3. **Sound Quality**: Piano sounds real, not MIDI-y
4. **Smooth**: No jank in interactions or audio playback
5. **Useful**: Daniel actually uses it to practice and feels it helps

### Platform Foundation
6. **Extensible**: Adding a second game requires <50 lines of game-specific code (excluding UI)
7. **Tested**: Music theory core has 100% test coverage
8. **Clean Architecture**: Clear separation between platform/game code
9. **Documented**: Another developer could add a game by reading this spec

### Technical Health
10. **All tests pass**: Unit, component, and E2E
11. **Type-safe**: No `any` types in music theory core
12. **Performance**: Samples load in <3s on good connection, UI renders at 60fps

---

*Document: Harmony Lab Platform Specification - Phase 1*
*Last updated: January 2025*
*Author: Claude + Daniel*
