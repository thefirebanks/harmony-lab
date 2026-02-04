# Creative Practice Games - Design Exploration (v2)

## User's Refined Focus

Based on feedback, the user wants:

1. **Fretboard visualization for custom progressions** - Select 2-4 chords, see which notes to play for soloing on the fretboard. Extension: randomly limit to certain scale notes to focus practice.

2. **Scale position tool & game** - View all notes of a scale on the fretboard per position. Game: app says "play scale in position X", user verifies they got it right.

3. **Backing tracks** - Generate simple backing tracks for custom progressions (e.g., "I-ii in D major")

4. **Instrument input** - Connect guitar via audio interface, get feedback on what you're playing

---

## Technical Feasibility Research

### Backing Track Generation - ✅ FEASIBLE

**Approach**: Tone.js can generate backing tracks programmatically using:
- `MembraneSynth` - Kicks/toms
- `MetalSynth` - Hi-hats/cymbals
- `NoiseSynth` - Snares
- `MonoSynth` - Bass lines
- Existing Salamander piano - Chord comping

**Looping**: `Tone.Transport` synchronizes all instruments. Use `Tone.Part` for chord changes, `Tone.Loop` for drums.

**Bundle impact**:
- Pure synthesis: ~0KB additional (uses existing Tone.js)
- Sample-based bass/drums: ~1-2MB

**Recommendation**: Start with synth drums + synth bass + existing piano. Add samples later for realism.

### Instrument Input - ✅ FEASIBLE (Monophonic)

**How it works**:
- `navigator.mediaDevices.getUserMedia()` captures audio from any interface
- Pitch detection libraries analyze the signal in real-time
- Must disable browser audio processing (echoCancellation, autoGainControl, noiseSuppression)

**Recommended library**: **Pitchy** (McLeod Pitch Method)
- Real-time capable (~10-30ms latency)
- Includes "clarity" metric to filter noise
- Works well for guitar frequencies

**Limitations**:
- **Single notes only** - Polyphonic chord detection is extremely difficult
- Lower frequencies = slower detection (physics)
- Requires HTTPS (or localhost)

**Use cases that work well**:
- Verify user played the correct note
- Fretboard trainer (app says "play G on 3rd fret", user plays, app verifies)
- Scale position practice with real-time feedback

**Use cases that DON'T work**:
- Detecting full chords
- Real-time chord recognition

---

## Proposed Features (Refined)

### Feature 1: Solo Note Visualizer (Tool)

**Concept**: For a custom chord progression, see which notes "work" on the fretboard.

**UI**:
1. User selects key (e.g., D major)
2. User builds progression by clicking chords: I → ii → V → I
3. Fretboard displays:
   - **Chord tones** (highlighted strongly) - root, 3rd, 5th, 7th of current chord
   - **Scale tones** (highlighted lightly) - other notes in the scale
   - **Avoid tones** (grayed/marked) - notes that clash

**Interaction modes**:
- **View mode**: Just see the notes, no game element
- **Focus mode**: App randomly picks 3-4 notes from the scale to highlight. Forces you to explore limited note choices (builds melodic vocabulary).

**Value**: This is the "reference tool" - always available when practicing.

---

### Feature 2: Scale Position Trainer (Tool + Game)

**Concept**: Learn all 5 CAGED positions of major/minor scales on the fretboard.

**Tool mode**:
1. User selects scale (e.g., G major)
2. User selects position (1-5, or "full fretboard")
3. Fretboard shows all notes in that scale/position
4. Can click notes to hear them

**Game mode**:
1. App picks a scale + position: "Play G major, Position 3"
2. User plays on their physical guitar (with audio input)
3. App detects each note and provides feedback:
   - Green dot: correct note in position
   - Red dot: wrong note
   - Yellow dot: correct note but wrong position
4. User "completes" the position by playing all notes correctly
5. No time pressure - this is about correctness, not speed

**Without audio input** (fallback):
- User clicks notes on the fretboard in order
- Or: user self-reports "I got it" / "I missed some"

---

### Feature 3: Progression Backing Track Generator

**Concept**: Generate a simple backing track for any chord progression.

**UI**:
1. User selects key
2. User builds progression (same as Solo Note Visualizer)
3. User sets tempo + style (straight, swing, etc.)
4. Press play → backing track loops

**Audio layers**:
- **Drums**: Synth drums playing a basic pattern (kick, snare, hihat)
- **Bass**: Root notes of each chord (synth bass)
- **Chords**: Piano playing the progression (existing Salamander)

**Style presets**:
- **Rock/Pop**: Straight 8ths, kick on 1 & 3, snare on 2 & 4
- **Jazz/Swing**: Swing feel, walking bass optional
- **Ballad**: Slower, sparser drums

**Controls**:
- Play/Pause
- Tempo slider
- Mute drums / mute bass / mute chords
- Loop on/off

---

### Feature 4: Chord Tone Targeting Game

**Concept**: Learn which notes to land on when chords change.

**Flow**:
1. User's progression is loaded (or picks one)
2. App plays chord 1, highlights a "starting note" on the fretboard
3. App shows: "Next chord is [X]. Pick a chord tone to land on."
4. User selects a target note (from chord tones of chord 2)
5. App plays the chord change with the melodic motion
6. Feedback explains the choice: "You landed on the 3rd - this creates a strong melodic resolution"

**With audio input**:
- User physically plays the target note on their guitar
- App verifies they hit the right pitch

**Difficulty**:
- Easy: Only show root + 5th as options
- Medium: Add 3rd + 7th
- Hard: Show all chord tones + tensions

---

## Implementation Order

### Phase 1: Core Infrastructure
**Goal**: Build the reusable pieces that all features need.
- [ ] `GuitarFretboard` component (reusable visualization)
- [ ] `ProgressionBuilder` component (click grid of diatonic chords)
- [ ] Scale-to-fretboard mapping logic (all notes for a given scale)
- [ ] Types: `CustomProgression`, `FretboardNote`, `ScalePosition`

**Key files to create**:
- `src/components/shared/GuitarFretboard.tsx`
- `src/components/shared/ProgressionBuilder.tsx`
- `src/lib/music/fretboard.ts` (fretboard math: note positions, scale mapping)

### Phase 2: Solo Note Visualizer (Tool)
**Goal**: First usable feature - see notes for a progression on fretboard.
- [ ] Page at `/tools/solo-visualizer`
- [ ] Select key, build progression via click grid
- [ ] Fretboard shows chord tones (bright) + scale tones (dim)
- [ ] "Focus mode" toggle: randomly highlight 3-4 notes to practice

**Key files**:
- `src/app/tools/solo-visualizer/page.tsx`
- `src/lib/music/chordTones.ts` (get chord tones for a chord)

### Phase 3: Scale Position Trainer (Tool + Game)
**Goal**: Learn scale shapes across the fretboard.
- [ ] Position data for both CAGED (5 positions) and 3NPS (7 positions)
- [ ] Tool mode: select scale + position, view on fretboard
- [ ] Game mode: app picks position, user clicks notes in order
- [ ] Progress tracking (which positions mastered)

**Key files**:
- `src/app/tools/scale-positions/page.tsx`
- `src/games/scale-trainer/positions.ts` (CAGED + 3NPS definitions)
- `src/stores/scaleTrainerStore.ts`

### Phase 4: Backing Track Generator
**Goal**: Practice over looping backing tracks.
- [ ] Synth setup: drums (MembraneSynth, MetalSynth, NoiseSynth) + bass (MonoSynth)
- [ ] Basic drum patterns: rock/straight, swing, ballad
- [ ] Bass follows chord roots
- [ ] Piano plays chords (existing Salamander)
- [ ] Transport: play/pause, tempo, mute individual tracks
- [ ] Integrate into Solo Note Visualizer

**Key files**:
- `src/lib/audio/backingTrack.ts`
- `src/lib/audio/drumPatterns.ts`

### Phase 5: Audio Input (Enhancement)
**Goal**: Detect notes from guitar input for real-time feedback.
- [ ] Audio capture via `getUserMedia`
- [ ] Pitch detection via Pitchy library
- [ ] Integrate into Scale Position Trainer (verify played notes)
- [ ] Optional: integrate into Solo Visualizer (show what you're playing)

**Key files**:
- `src/lib/audio/pitchDetection.ts`
- New dependency: `pitchy`

### Phase 6: Chord Tone Targeting Game
**Goal**: Practice landing on chord tones across changes.
- [ ] Core game logic (pick starting note, choose target for next chord)
- [ ] Integration with backing tracks
- [ ] Click-based first, optional audio input later

**Key files**:
- `src/app/games/chord-targeting/page.tsx`
- `src/games/chord-targeting/logic.ts`
- `src/stores/chordTargetingStore.ts`

---

## Guitar Fretboard Component Design

This is the central visual element. Needs to support:

```typescript
interface FretboardProps {
  // Display configuration
  frets?: number;            // Default: 15
  orientation?: 'horizontal' | 'vertical';
  showFretNumbers?: boolean;
  showStringNames?: boolean;

  // Note highlighting
  highlightedNotes?: FretboardNote[];   // Which notes to show
  noteColorScheme?: 'chord-tones' | 'scale-degrees' | 'custom';

  // Interaction
  onNoteClick?: (note: FretboardNote) => void;
  clickableNotes?: FretboardNote[];     // Which notes respond to clicks

  // Real-time feedback (for audio input)
  detectedNote?: Pitch | null;          // Currently detected pitch
  showDetectionFeedback?: boolean;
}

interface FretboardNote {
  string: 1 | 2 | 3 | 4 | 5 | 6;
  fret: number;
  note: NoteName;
  octave: number;

  // Display options
  label?: string;           // What to show on the dot ("R", "3", "5", note name)
  color?: string;           // Override color
  size?: 'small' | 'normal' | 'large';
}
```

---

## Scale Position Data Structure

Both CAGED and 3-notes-per-string systems:

```typescript
type PositionSystem = 'caged' | '3nps';

interface ScalePosition {
  system: PositionSystem;
  name: string;              // "CAGED: E Shape" or "3NPS: Position 1"
  rootString: 1 | 2 | 3 | 4 | 5 | 6;  // Which string has the root
  pattern: FretPattern;      // Relative fret positions per string
}

// CAGED example: E shape (root on string 6)
const cagedEShape = {
  system: 'caged',
  name: 'E Shape',
  rootString: 6,
  pattern: {
    string6: [0, 2, 4],      // root, 2nd, 3rd
    string5: [0, 2, 4],      // 4th, 5th, 6th
    string4: [1, 2, 4],      // 7th, root, 2nd
    string3: [1, 2, 4],      // 3rd, 4th, 5th
    string2: [0, 2, 4],      // 6th, 7th, root
    string1: [0, 2, 4],      // 2nd, 3rd, 4th
  }
};

// 3NPS example: Position 1 (Ionian from root)
const threeNpsPos1 = {
  system: '3nps',
  name: 'Position 1 (Ionian)',
  rootString: 6,
  pattern: {
    string6: [0, 2, 4],      // 3 notes per string
    string5: [0, 2, 4],
    string4: [1, 2, 4],
    string3: [1, 2, 4],
    string2: [0, 2, 4],
    string1: [0, 2, 4],
  }
};
```

---

## Design Decisions (Confirmed)

1. **Scale position system**: **Both** CAGED and 3-notes-per-string
   - Let user choose which system to practice
   - CAGED for traditional chord-based thinking
   - 3NPS for modern/shred players

2. **Progression input**: **Click grid of diatonic chords**
   - Visual picker showing I, ii, iii, IV, V, vi, vii° in selected key
   - Similar to existing Tonic Target interface
   - Simple and consistent with app patterns

3. **Audio input priority**: **Phase 5 (Later)**
   - Build all features with click-based interaction first
   - Audio input as enhancement after core features work
   - Reduces initial complexity

---

## Technical Notes

### Existing Code to Reuse
- `src/lib/music/scales.ts` - Scale generation
- `src/lib/music/chords.ts` - Chord construction
- `src/games/interval-games/types.ts` - Guitar tuning constants, fretboard positions
- `src/lib/audio/` - Tone.js integration

### New Dependencies Needed
- `pitchy` - For pitch detection (optional, Phase 5)

### Storage Considerations
- Backing tracks: Generated in real-time, no storage needed
- Custom progressions: localStorage (small JSON)
- User scale progress: localStorage
