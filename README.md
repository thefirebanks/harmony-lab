# Harmony Lab

A personal platform for music practice games, designed to build functional harmony intuition through focused, beautiful, non-gamified exercises.

## Current Game: Tonic Target Practice

**The Problem**: Musicians with perfect pitch often process harmony through absolute note identification, then calculate intervals/function. This is slow and doesn't build intuition.

**The Solution**: Rapid, randomized progression drills that make absolute pitch useless (because the key changes constantly) and reinforce the *feeling* of the progression.

### Game Flow
1. App displays a random key and target degree (I or vii)
2. User hears the tonic chord as reference
3. User selects three chords to build the progression
4. App plays back their selection
5. Feedback: correct/incorrect with visual + audio confirmation
6. Repeat in a new random key

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Audio | Tone.js + Salamander Piano Samples |
| State | Zustand |

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Run tests
bun test
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── games/
│   │   └── tonic-target/   # Tonic Target game page
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # Shared UI primitives (Button, Card)
│   ├── shared/             # Platform-wide components (GameShell, TheoryCard)
│   └── games/
│       └── tonic-target/   # Game-specific components
├── lib/
│   ├── music/              # Music theory primitives (scales, chords, keys)
│   ├── audio/              # Tone.js audio engine
│   └── game-engine/        # Generic game types
├── games/
│   └── tonic-target/       # Game logic, config, types
├── stores/                 # Zustand stores
└── hooks/                  # Custom React hooks
```

## Architecture

The platform is designed to support multiple music practice games sharing:
- **Music Theory Core** (`lib/music/`): Pure functions for scales, chords, progressions
- **Audio Engine** (`lib/audio/`): Tone.js wrapper for chord/progression playback
- **UI Components** (`components/shared/`): Reusable game UI elements

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Submit answer / Next round |
| `1-7` | Select chord by degree |
| `R` | Hear tonic reference |
| `P` | Play current selection |
| `Backspace` | Clear last selection |

## Difficulty Levels

| Level | Key Shown | Chord Display | Colors | Auto Tonic |
|-------|-----------|---------------|--------|------------|
| 1 | Yes | Names (Dm7) | Yes | Yes |
| 2 | Yes | Names + Degrees | Yes | Yes |
| 3 | Yes | Degrees only (ii7) | Yes | Yes |
| 4 | Yes | Degrees only | No | Yes |
| 5 | No | Degrees only | No | No |
