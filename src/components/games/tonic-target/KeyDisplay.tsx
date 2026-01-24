/**
 * Key Display Component
 * Shows the current key prominently
 */

'use client';

import type { Key } from '@/lib/music/types';
import { getKeyDisplayName } from '@/lib/music';
import { Button } from '@/components/ui';

interface KeyDisplayProps {
  keySignature: Key;
  showKey: boolean;
  onHearTonic: () => void;
  onHearTarget?: () => void;
  targetLabel?: string;
  isPlaying: boolean;
}

export function KeyDisplay({ keySignature, showKey, onHearTonic, onHearTarget, targetLabel, isPlaying }: KeyDisplayProps) {
  return (
    <div className="text-center space-y-4">
      <div className="space-y-1">
        <p className="text-text-muted text-sm uppercase tracking-wider">Current Key</p>
        <h2 className="text-4xl font-bold text-text-primary">
          {showKey ? getKeyDisplayName(keySignature) : '?'}
        </h2>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={onHearTonic}
          disabled={isPlaying}
          className="gap-2"
        >
          <span className="text-lg">&#9654;</span>
          Hear Tonic
        </Button>
        {onHearTarget && targetLabel && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onHearTarget}
            disabled={isPlaying}
            className="gap-2"
          >
            <span className="text-lg">&#9654;</span>
            Hear Target ({targetLabel})
          </Button>
        )}
      </div>
    </div>
  );
}
