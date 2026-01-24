/**
 * Theory Card Component
 * Displays contextual theory tips with optional guitar diagrams
 */

'use client';

import type { TheoryCard as TheoryCardType } from '@/lib/game-engine/types';
import { Card } from '@/components/ui';
import { GuitarFretboard } from './GuitarFretboard';

interface TheoryCardProps {
  card: TheoryCardType;
}

export function TheoryCard({ card }: TheoryCardProps) {
  return (
    <Card className="p-4 mt-4">
      <h4 className="text-accent font-semibold mb-2">{card.title}</h4>

      {/* Guitar voicing diagram */}
      {card.guitarVoicing && (
        <div className="mb-3 py-3 border-b border-text-muted/20">
          <GuitarFretboard
            title={card.guitarVoicing.title}
            chords={card.guitarVoicing.chords}
          />
        </div>
      )}

      {/* Text content */}
      {card.content && (
        <pre className="text-text-secondary text-sm whitespace-pre-wrap font-mono">
          {card.content}
        </pre>
      )}
    </Card>
  );
}
