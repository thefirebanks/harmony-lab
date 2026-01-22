/**
 * Playback Controls Component
 * Buttons for hearing tonic, playing answer, and submitting
 */

'use client';

import { Button } from '@/components/ui';

interface PlaybackControlsProps {
  onHearTonic: () => void;
  onPlayAnswer: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  canPlayAnswer: boolean;
  isPlaying: boolean;
}

export function PlaybackControls({
  onHearTonic,
  onPlayAnswer,
  onSubmit,
  canSubmit,
  canPlayAnswer,
  isPlaying,
}: PlaybackControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="secondary"
        onClick={onHearTonic}
        disabled={isPlaying}
        className="gap-2"
      >
        <span>&#9654;</span>
        Hear Tonic
      </Button>
      
      <Button
        variant="secondary"
        onClick={onPlayAnswer}
        disabled={isPlaying || !canPlayAnswer}
        className="gap-2"
      >
        <span>&#9654;</span>
        Play My Answer
      </Button>
      
      <Button
        variant="primary"
        onClick={onSubmit}
        disabled={!canSubmit || isPlaying}
        data-testid="submit-button"
      >
        Submit
      </Button>
    </div>
  );
}
