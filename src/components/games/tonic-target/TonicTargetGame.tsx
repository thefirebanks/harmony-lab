/**
 * Tonic Target Game Component
 * Main game orchestrator
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useTonicTargetStore, useSettingsStore, useAudioStore } from '@/stores';
import { getAnswerDisplayString } from '@/lib/music';
import type { ScaleDegree } from '@/lib/music/types';
import { KeyDisplay } from './KeyDisplay';
import { ChordGrid } from './ChordGrid';
import { ProgressionSlots } from './ProgressionSlots';
import { PlaybackControls } from './PlaybackControls';
import { FeedbackDisplay } from './FeedbackDisplay';
import { SessionStatsDisplay } from './SessionStats';
import { Card } from '@/components/ui';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function TonicTargetGame() {
  const {
    round,
    answer,
    feedback,
    session,
    theoryCard,
    isPlaying,
    showFeedback,
    startNewRound,
    selectChord,
    clearSlot,
    submitAnswer,
    nextRound,
    playTonic,
    playUserAnswer,
    playCorrectAnswer,
  } = useTonicTargetStore();

  const settings = useSettingsStore((s) => s.tonicTarget);
  const { isLoaded, loadAudio } = useAudioStore();

  // Initialize game on mount
  useEffect(() => {
    if (!round) {
      startNewRound();
    }
  }, [round, startNewRound]);

  // Load audio if not loaded
  useEffect(() => {
    if (!isLoaded) {
      loadAudio();
    }
  }, [isLoaded, loadAudio]);

  // Show key based on difficulty
  const showKey = settings.difficulty < 5;
  
  // Check if answer is complete
  const canSubmit = answer.ii !== null && answer.V !== null && answer.I !== null;
  const canPlayAnswer = answer.ii !== null || answer.V !== null || answer.I !== null;

  const handleSelectDegree = useCallback(
    (degree: ScaleDegree) => {
      const chord = round?.availableChords.find((item) => item.degree === degree);
      if (chord) {
        selectChord(chord);
      }
    },
    [round, selectChord]
  );

  const handleClearLast = useCallback(() => {
    if (answer.I) {
      clearSlot('I');
    } else if (answer.V) {
      clearSlot('V');
    } else if (answer.ii) {
      clearSlot('ii');
    }
  }, [answer, clearSlot]);

  useKeyboardShortcuts({
    enabled: true,
    onSelectDegree: handleSelectDegree,
    onSubmit: submitAnswer,
    onNextRound: nextRound,
    onHearTonic: playTonic,
    onPlayAnswer: playUserAnswer,
    onClearLast: handleClearLast,
    showFeedback,
  });

  if (!round) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8" data-testid="game-ready">
      {/* Key Display */}
      <KeyDisplay
        keySignature={round.key}
        showKey={showKey}
        onHearTonic={playTonic}
        isPlaying={isPlaying}
      />

      {/* Main game area */}
      <Card className="p-6 space-y-6">
        {/* Progression Slots */}
        <ProgressionSlots
          answer={answer}
          onSlotClick={clearSlot}
          disabled={showFeedback}
        />

        {/* Divider */}
        <div className="border-t border-text-muted/10" />

        {/* Feedback or Chord Grid */}
        {showFeedback && feedback ? (
          <FeedbackDisplay
            isCorrect={feedback.isCorrect}
            userProgressionString={getAnswerDisplayString(answer)}
            correctProgression={round.correctProgression}
            theoryCard={theoryCard}
            onHearCorrect={playCorrectAnswer}
            onNextRound={nextRound}
            isPlaying={isPlaying}
          />
        ) : (
          <>
            {/* Chord Grid */}
            <ChordGrid
              chords={round.availableChords}
              onChordSelect={selectChord}
              showChordNames={settings.showChordNames}
              showColors={settings.showColors}
              disabled={showFeedback}
              selectedChords={answer}
            />

            {/* Playback Controls */}
            <PlaybackControls
              onHearTonic={playTonic}
              onPlayAnswer={playUserAnswer}
              onSubmit={submitAnswer}
              canSubmit={canSubmit}
              canPlayAnswer={canPlayAnswer}
              isPlaying={isPlaying}
            />
          </>
        )}
      </Card>

      {/* Session Stats */}
      <SessionStatsDisplay session={session} />
    </div>
  );
}
