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
  isPlaying: boolean;
}

export function KeyDisplay({ keySignature, showKey, onHearTonic, isPlaying }: KeyDisplayProps) {
  return (
    <div className="text-center space-y-4">
      <div className="space-y-1">
        <p className="text-text-muted text-sm uppercase tracking-wider">Current Key</p>
        <h2 className="text-4xl font-bold text-text-primary">
          {showKey ? getKeyDisplayName(keySignature) : '?'}
        </h2>
      </div>
      
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
    </div>
  );
}
