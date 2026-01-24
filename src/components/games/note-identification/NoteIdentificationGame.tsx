/**
 * Note Identification Game Component
 */

'use client';

import { useEffect } from 'react';
import { useNoteIdentificationStore, useSettingsStore } from '@/stores';
import { Card, Button } from '@/components/ui';
import { SessionStatsDisplay } from '@/components/games/tonic-target/SessionStats';
import { SessionSummary } from '@/components/games/tonic-target/SessionSummary';

interface NoteIdentificationGameProps {
  onViewProgress: () => void;
}

export function NoteIdentificationGame({ onViewProgress }: NoteIdentificationGameProps) {
  const {
    round,
    feedback,
    session,
    isPlaying,
    showFeedback,
    isSessionComplete,
    startNewRound,
    submitAnswer,
    nextRound,
    resetSession,
    playTarget,
  } = useNoteIdentificationStore();

  const settings = useSettingsStore((state) => state.noteIdentification);

  useEffect(() => {
    if (!round) {
      startNewRound();
    }
  }, [round, startNewRound]);

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
    <div className="space-y-8 py-8" data-testid="note-identification-ready">
      <Card className="p-6 space-y-6">
        <div className="text-center space-y-3">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Identify the note</h2>
            <p className="text-text-muted text-sm">Listen carefully, then choose the pitch.</p>
          </div>
          <Button variant="secondary" onClick={playTarget} disabled={isPlaying}>
            {isPlaying ? 'Playing...' : 'Play note'}
          </Button>
          {!settings.autoPlayNote && (
            <p className="text-xs text-text-muted">Auto-play is off. Tap to hear it.</p>
          )}
        </div>

        {showFeedback && feedback ? (
          <div className="space-y-4 text-center">
            <div className={`text-lg font-semibold ${feedback.isCorrect ? 'text-success' : 'text-error'}`}>
              {feedback.isCorrect ? 'Correct!' : 'Not quite'}
            </div>
            <div className="text-text-secondary">
              Correct note: <span className="text-text-primary font-semibold">{round.targetNote}</span>
            </div>
            {feedback.feedback && (
              <div className="text-text-muted text-sm">{feedback.feedback}</div>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="secondary" onClick={playTarget} disabled={isPlaying}>
                Hear again
              </Button>
              <Button onClick={nextRound}>Next note</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {round.options.map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => submitAnswer(note)}
                disabled={showFeedback}
                className="px-4 py-3 rounded-xl border border-text-muted/20 bg-background-elevated text-text-primary font-semibold hover:border-accent/60 hover:bg-background-hover transition-colors"
              >
                {note}
              </button>
            ))}
          </div>
        )}
      </Card>

      <SessionStatsDisplay
        session={session}
        totalRounds={settings.sessionMode === 'rounds' ? settings.roundsPerSession : undefined}
        sessionMode={settings.sessionMode}
        timeLimitSeconds={settings.timeLimitSeconds}
      />
    </div>
  );
}
