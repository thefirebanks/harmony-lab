/**
 * Theory Card Component
 * Displays contextual theory tips
 */

'use client';

import type { TheoryCard as TheoryCardType } from '@/lib/game-engine/types';
import { Card } from '@/components/ui';

interface TheoryCardProps {
  card: TheoryCardType;
}

export function TheoryCard({ card }: TheoryCardProps) {
  return (
    <Card className="p-4 mt-4">
      <h4 className="text-accent font-semibold mb-2">{card.title}</h4>
      <pre className="text-text-secondary text-sm whitespace-pre-wrap font-mono">
        {card.content}
      </pre>
    </Card>
  );
}
