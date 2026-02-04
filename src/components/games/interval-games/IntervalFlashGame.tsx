/**
 * Interval Flash Game Component
 * Main game orchestrator for Interval Flash mode
 */

'use client';

import { useEffect } from 'react';
import { useIntervalFlashStore, useSettingsStore } from '@/stores';
import { TimerDisplay } from './TimerDisplay';
import { IntervalButtons } from './IntervalButtons';
import { IntervalFeedback } from './IntervalFeedback';

interface IntervalFlashGameProps {
  onViewProgress?: () => void;
}

export function IntervalFlashGame({ onViewProgress }: IntervalFlashGameProps) {
  const settings = useSettingsStore((state) => state.intervalFlash);
  const {
    round,
    answer,
    feedback,
    session,
    timeRemaining,
    timerActive,
    isPlaying,
    showFeedback,
    isSessionComplete,
    startNewRound,
    selectAnswer,
    nextRound,
    resetSession,
    playInterval,
  } = useIntervalFlashStore();

  // Start first round on mount
  useEffect(() => {
    if (!round && !isSessionComplete) {
      startNewRound();
    }
  }, [round, isSessionComplete, startNewRound]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFeedback) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          nextRound();
        }
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          playInterval();
        }
        return;
      }

      // During gameplay
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        playInterval();
      }

      // Number keys for quick selection (1-6)
      if (round && !showFeedback) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= round.options.length) {
          e.preventDefault();
          selectAnswer(round.options[num - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFeedback, round, nextRound, playInterval, selectAnswer]);

  // Session complete screen
  if (isSessionComplete) {
    const accuracy =
      session.roundsCompleted > 0
        ? Math.round((session.roundsCorrect / session.roundsCompleted) * 100)
        : 0;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Session Complete!</h2>
          <p className="text-[var(--text-secondary)]">Great work on your interval training.</p>
        </div>

        <div className="grid grid-cols-3 gap-6 p-6 bg-[var(--background-elevated)] rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--accent)]">
              {session.roundsCorrect}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--text-primary)]">
              {session.roundsCompleted}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--accent)]">{accuracy}%</div>
            <div className="text-sm text-[var(--text-muted)]">Accuracy</div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={resetSession}
            className="px-6 py-3 bg-[var(--accent)] text-[var(--background)] font-bold rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
          >
            Play Again
          </button>
          {onViewProgress && (
            <button
              onClick={onViewProgress}
              className="px-6 py-3 bg-[var(--background-elevated)] text-[var(--text-primary)] font-medium rounded-xl border border-[var(--text-muted)]/20 hover:border-[var(--accent)]/60 transition-colors"
            >
              View Progress
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (!round) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--text-muted)]">Loading...</div>
      </div>
    );
  }

  // Feedback state
  if (showFeedback && feedback) {
    return (
      <div className="flex flex-col items-center py-4">
        <IntervalFeedback
          round={{ ...round, answer }}
          feedback={feedback}
          showFretboard={settings.showFretboardOnFeedback}
          onReplay={playInterval}
          onNext={nextRound}
        />
      </div>
    );
  }

  // Active gameplay
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Timer */}
      <TimerDisplay
        timeRemaining={timeRemaining}
        totalTime={round.timeLimit}
        isActive={timerActive}
      />

      {/* Direction indicator */}
      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
        {round.direction === 'ascending' ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            <span>Ascending</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span>Descending</span>
          </>
        )}
      </div>

      {/* Replay button */}
      <button
        onClick={playInterval}
        disabled={isPlaying}
        className="px-6 py-3 bg-[var(--background-elevated)] text-[var(--text-primary)] rounded-xl border border-[var(--text-muted)]/20 hover:border-[var(--accent)]/50 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {isPlaying ? 'Playing...' : 'Replay (R)'}
      </button>

      {/* Answer buttons */}
      <IntervalButtons
        options={round.options}
        selectedAnswer={answer}
        showCorrect={false}
        disabled={showFeedback || isPlaying}
        showSemitones={settings.showIntervalSemitones}
        onSelect={selectAnswer}
      />

      {/* Session progress */}
      <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
        <span>
          Round {session.currentRound}
          {settings.sessionMode === 'rounds' ? ` / ${settings.roundsPerSession}` : ''}
        </span>
        <span className="text-[var(--text-muted)]/50">|</span>
        <span>Streak: {session.currentStreak}</span>
        <span className="text-[var(--text-muted)]/50">|</span>
        <span>
          {session.roundsCorrect} / {session.roundsCompleted} correct
        </span>
      </div>

      {/* Keyboard hints */}
      <div className="text-xs text-[var(--text-muted)]">
        Press 1-{round.options.length} to select, R to replay
      </div>
    </div>
  );
}
