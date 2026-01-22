/**
 * Tests for ChordGrid component
 */

import { describe, expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChordGrid } from '@/components/games/tonic-target/ChordGrid';
import { getAllDiatonicChords } from '@/lib/music';

describe('ChordGrid', () => {
  test('renders all seven diatonic chords', () => {
    const chords = getAllDiatonicChords('C');

    render(
      <ChordGrid
        chords={chords}
        onChordSelect={() => {}}
        showChordNames
        showColors
        disabled={false}
        selectedChords={{ ii: null, V: null, I: null }}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(7);
  });

  test('fires onChordSelect when a chord is clicked', async () => {
    const user = userEvent.setup();
    const chords = getAllDiatonicChords('C');
    let selected = '';

    render(
      <ChordGrid
        chords={chords}
        onChordSelect={(chord) => {
          selected = chord.root;
        }}
        showChordNames
        showColors
        disabled={false}
        selectedChords={{ ii: null, V: null, I: null }}
      />
    );

    await user.click(screen.getByText('Dm7'));
    expect(selected).toBe('D');
  });

  test('shows roman numerals when chord names are hidden', () => {
    const chords = getAllDiatonicChords('C');

    render(
      <ChordGrid
        chords={chords}
        onChordSelect={() => {}}
        showChordNames={false}
        showColors
        disabled={false}
        selectedChords={{ ii: null, V: null, I: null }}
      />
    );

    expect(screen.getByText('I')).toBeVisible();
    expect(screen.getByText('ii')).toBeVisible();
  });
});
