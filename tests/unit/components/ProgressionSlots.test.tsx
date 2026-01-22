/**
 * Tests for ProgressionSlots component
 */

import { describe, expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressionSlots } from '@/components/games/tonic-target/ProgressionSlots';
import { createChord } from '@/lib/music';

describe('ProgressionSlots', () => {
  test('renders empty slots with placeholders', () => {
    render(
      <ProgressionSlots
        answer={{ ii: null, V: null, I: null }}
        onSlotClick={() => {}}
        disabled={false}
      />
    );

    expect(screen.getAllByText('___')).toHaveLength(3);
  });

  test('clears a slot when clicked', async () => {
    const user = userEvent.setup();
    let cleared: string | null = null;

    render(
      <ProgressionSlots
        answer={{
          ii: createChord('D', 'min7', 2),
          V: null,
          I: createChord('C', 'maj7', 1),
        }}
        onSlotClick={(slot) => {
          cleared = slot;
        }}
        disabled={false}
      />
    );

    await user.click(screen.getByText('Dm7'));
    expect(cleared).toBe('ii');
  });
});
