/**
 * Solo Note Visualizer Tool
 * See which notes work for soloing over chord progressions
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { NoteName, Chord, ChordExtensionLevel } from '@/lib/music/types';
import { FretboardDisplay } from '@/components/shared/FretboardDisplay';
import { ProgressionBuilder } from '@/components/shared/ProgressionBuilder';
import type { FretboardNote } from '@/lib/music/fretboard';
import { getScaleOnFretboard, getNoteFretboardPositions } from '@/lib/music/fretboard';
import { getChordTonesWithRoles, getAvoidNotes, selectFocusNotes } from '@/lib/music/chordTones';

interface ProgressionChord {
  chord: Chord;
  beats: number;
}

export default function SoloVisualizerPage() {
  // State
  const [keyTonic, setKeyTonic] = useState<NoteName>('C');
  const [keyMode, setKeyMode] = useState<'major' | 'minor'>('major');
  const [progression, setProgression] = useState<ProgressionChord[]>([]);
  const [activeChordIndex, setActiveChordIndex] = useState<number>(0);
  const [showChordTones, setShowChordTones] = useState(true);
  const [showScaleTones, setShowScaleTones] = useState(true);
  const [showAvoidTones, setShowAvoidTones] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusNoteCount, setFocusNoteCount] = useState(4);
  const [fretRange, setFretRange] = useState({ min: 0, max: 15 });
  const [extensionLevel, setExtensionLevel] = useState<ChordExtensionLevel>('7ths');

  // Get the currently active chord
  const activeChord = progression[activeChordIndex]?.chord ?? null;

  // Calculate notes to display on fretboard
  const fretboardNotes = useMemo(() => {
    if (!activeChord) {
      // No chord selected - show full scale
      return getScaleOnFretboard(keyTonic, keyMode, fretRange.min, fretRange.max);
    }

    const notes: FretboardNote[] = [];
    const chordTones = getChordTonesWithRoles(activeChord);
    const avoidNotes = getAvoidNotes(activeChord, keyTonic, keyMode);
    const scaleNotes = getScaleOnFretboard(keyTonic, keyMode, fretRange.min, fretRange.max);

    // Process each scale note
    for (const scaleNote of scaleNotes) {
      const chordToneInfo = chordTones.find(ct => ct.note === scaleNote.note);
      const isChordTone = !!chordToneInfo;
      const isAvoid = avoidNotes.includes(scaleNote.note);

      // Filter based on settings
      if (isChordTone && !showChordTones) continue;
      if (!isChordTone && !isAvoid && !showScaleTones) continue;
      if (isAvoid && !showAvoidTones) continue;

      notes.push({
        ...scaleNote,
        isChordTone,
        isRoot: chordToneInfo?.type === 'root',
        label: isChordTone ? chordToneInfo?.label : String(scaleNote.scaleDegree),
        opacity: isChordTone ? 1 : (isAvoid ? 0.4 : 0.85),
        color: isAvoid ? 'var(--error)' : (!isChordTone ? '#93c5fd' : undefined), // Light blue for scale tones
      });
    }

    return notes;
  }, [activeChord, keyTonic, keyMode, showChordTones, showScaleTones, showAvoidTones, fretRange]);

  // Apply focus mode filtering
  const displayedNotes = useMemo(() => {
    if (!focusMode) return fretboardNotes;
    return selectFocusNotes(fretboardNotes, focusNoteCount, true);
  }, [fretboardNotes, focusMode, focusNoteCount]);

  // Generate a new random focus selection
  const shuffleFocusNotes = () => {
    // Force re-render by toggling focus mode
    setFocusMode(false);
    setTimeout(() => setFocusMode(true), 0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-text-muted/10 shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-text-primary">Solo Note Visualizer</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full overflow-auto">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          {/* Left column: Fretboard and controls */}
          <div className="space-y-6">
            {/* Fretboard */}
            <div className="bg-background-elevated rounded-xl p-4 overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  {activeChord 
                    ? `Soloing over ${activeChord.root}${activeChord.quality === 'maj7' ? 'maj7' : activeChord.quality === 'min7' ? 'm7' : activeChord.quality}` 
                    : `${keyTonic} ${keyMode === 'major' ? 'Major' : 'Minor'} Scale`}
                </h2>
                {progression.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <span>Chord:</span>
                    {progression.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveChordIndex(i)}
                        className={`px-2 py-1 rounded transition-colors ${
                          i === activeChordIndex 
                            ? 'bg-accent text-background' 
                            : 'bg-background-hover hover:bg-background-hover/80'
                        }`}
                      >
                        {item.chord.root}{item.chord.quality === 'min7' ? 'm7' : item.chord.quality === 'maj7' ? 'maj7' : item.chord.quality}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <FretboardDisplay
                frets={fretRange.max}
                startFret={fretRange.min}
                highlightedNotes={displayedNotes}
                noteColorScheme={activeChord ? 'chord-tones' : 'scale-degrees'}
                showFretNumbers={true}
                showStringNames={true}
                showFretMarkers={true}
              />
            </div>

            {/* Display Controls */}
            <div className="bg-background-elevated rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Display Options</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Note visibility toggles */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showChordTones}
                      onChange={(e) => setShowChordTones(e.target.checked)}
                      className="rounded"
                    />
                    Show chord tones
                  </label>
                  <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showScaleTones}
                      onChange={(e) => setShowScaleTones(e.target.checked)}
                      className="rounded"
                    />
                    Show scale tones
                  </label>
                  <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAvoidTones}
                      onChange={(e) => setShowAvoidTones(e.target.checked)}
                      className="rounded"
                    />
                    Show avoid tones
                  </label>
                </div>

                {/* Focus mode */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={focusMode}
                      onChange={(e) => setFocusMode(e.target.checked)}
                      className="rounded"
                    />
                    Focus mode (limit notes)
                  </label>
                  
                  {focusMode && (
                    <div className="flex items-center gap-2 ml-6">
                      <select
                        value={focusNoteCount}
                        onChange={(e) => setFocusNoteCount(Number(e.target.value))}
                        className="px-2 py-1 text-sm rounded bg-background border border-text-muted/30 text-text-primary"
                      >
                        <option value={3}>3 notes</option>
                        <option value={4}>4 notes</option>
                        <option value={5}>5 notes</option>
                      </select>
                      <button
                        onClick={shuffleFocusNotes}
                        className="px-2 py-1 text-sm rounded bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
                      >
                        Shuffle
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Fret range */}
              <div className="mt-4 pt-4 border-t border-text-muted/10">
                <label className="text-sm text-text-secondary mb-2 block">
                  Fret range: {fretRange.min} - {fretRange.max}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={12}
                    value={fretRange.min}
                    onChange={(e) => setFretRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min={5}
                    max={24}
                    value={fretRange.max}
                    onChange={(e) => setFretRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Legend */}
            {activeChord && (
              <div className="bg-background-elevated rounded-xl p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Legend</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#fef3c7]"></span>
                    <span className="text-text-secondary">Root (R)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-accent"></span>
                    <span className="text-text-secondary">Chord tones (3, 5, 7)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#93c5fd]"></span>
                    <span className="text-text-secondary">Scale tones</span>
                  </div>
                  {showAvoidTones && (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-error/40"></span>
                      <span className="text-text-secondary">Avoid tones</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Progression Builder */}
          <div className="bg-background-elevated rounded-xl p-4 h-fit lg:sticky lg:top-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Build Progression</h3>
            <ProgressionBuilder
              keyTonic={keyTonic}
              onKeyChange={setKeyTonic}
              progression={progression}
              onProgressionChange={(newProg) => {
                setProgression(newProg);
                // Reset to first chord if current index is out of bounds
                if (activeChordIndex >= newProg.length) {
                  setActiveChordIndex(Math.max(0, newProg.length - 1));
                }
              }}
              maxChords={8}
              showChordNames={true}
              showColors={true}
              extensionLevel={extensionLevel}
              onExtensionLevelChange={(level) => {
                setExtensionLevel(level);
                // Clear progression when changing extension level to avoid mismatched chords
                setProgression([]);
              }}
              mode={keyMode}
              onModeChange={(newMode) => {
                setKeyMode(newMode);
                // Clear progression when changing mode to avoid mismatched chords
                setProgression([]);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
