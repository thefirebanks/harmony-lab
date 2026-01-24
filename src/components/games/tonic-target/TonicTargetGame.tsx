/**
 * Tonic Target Game Component
 * Main game orchestrator
 */

'use client';

import { useEffect } from 'react';
import { useTonicTargetStore, useSettingsStore, useAudioStore } from '@/stores';
import { getAnswerDisplayString } from '@/lib/music';
import type { TargetDegree } from '@/games/tonic-target/types';
import { KeyDisplay } from './KeyDisplay';
import { ChordGrid } from './ChordGrid';
import { ProgressionSlots } from './ProgressionSlots';
import { PlaybackControls } from './PlaybackControls';
import { FeedbackDisplay } from './FeedbackDisplay';
import { SessionStatsDisplay } from './SessionStats';
import { SessionSummary } from './SessionSummary';
import { Card } from '@/components/ui';

interface TonicTargetGameProps {
  onViewProgress: () => void;
}

export function TonicTargetGame({ onViewProgress }: TonicTargetGameProps) {
  const {
    round,
    answer,
    feedback,
    session,
    theoryCard,
    isPlaying,
    showFeedback,
    isSessionComplete,
    startNewRound,
    selectChord,
    clearSlot,
    submitAnswer,
    skipRound,
    nextRound,
    resetSession,
    playTonic,
    playTarget,
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

  // Get target degree display name
  const getTargetDegreeLabel = (degree: TargetDegree): string => {
    const labels: Record<TargetDegree, string> = {
      1: 'I (Tonic)',
      2: 'ii',
      3: 'iii',
      4: 'IV',
      5: 'V',
      6: 'vi',
    };
    return labels[degree];
  };

  const getTargetDegreeShortLabel = (degree: TargetDegree): string => {
    const labels: Record<TargetDegree, string> = {
      1: 'I',
      2: 'ii',
      3: 'iii',
      4: 'IV',
      5: 'V',
      6: 'vi',
    };
    return labels[degree];
  };

  // Show session summary if complete
  if (isSessionComplete) {
    return (
      <div className="space-y-8 py-8">
        <SessionSummary
          session={session}
          onStartNewSession={resetSession}
          onViewProgress={onViewProgress}
        />
      </div>
    );
  }

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
        onHearTarget={playTarget}
        targetLabel={round.targetDegree ? getTargetDegreeShortLabel(round.targetDegree) : undefined}
        isPlaying={isPlaying}
      />

      {/* Main game area */}
      <Card className="p-6 space-y-6">
        {/* Target Degree Display */}
        {round.targetDegree && (
          <div className="text-center mb-2">
            <span className="text-sm text-text-muted">Target: </span>
            <span className="text-lg font-bold text-accent">
              {getTargetDegreeLabel(round.targetDegree)}
            </span>
          </div>
        )}

        {/* Progression Slots */}
        <ProgressionSlots
          answer={answer}
          onSlotClick={clearSlot}
          disabled={showFeedback}
          targetDegree={round.targetDegree}
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
              showRomanNumerals={settings.showRomanNumerals}
              showColors={settings.showColors}
              disabled={showFeedback}
              selectedChords={answer}
            />

            {/* Playback Controls */}
            <PlaybackControls
              onHearTonic={playTonic}
              onPlayAnswer={playUserAnswer}
              onSubmit={submitAnswer}
              onSkip={skipRound}
              canSubmit={canSubmit}
              canPlayAnswer={canPlayAnswer}
              isPlaying={isPlaying}
            />
          </>
        )}
      </Card>

      {/* Session Stats */}
      <SessionStatsDisplay
        session={session}
        totalRounds={settings.sessionMode === 'rounds' ? settings.roundsPerSession : undefined}
        sessionMode={settings.sessionMode}
        timeLimitSeconds={settings.timeLimitSeconds}
      />
    </div>
  );
}
