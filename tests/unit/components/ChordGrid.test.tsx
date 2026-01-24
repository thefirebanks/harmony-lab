/**
 * Tests for ChordGrid component
 */

import { describe, expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChordGrid } from '@/components/games/tonic-target/ChordGrid';
import { getAllDiatonicChords, DEGREE_TO_ROMAN } from '@/lib/music';
import type { ChordOption } from '@/games/tonic-target/types';

describe('ChordGrid', () => {
  test('renders all seven diatonic chords', () => {
    const chords: ChordOption[] = getAllDiatonicChords('C').map((chord) => ({
      id: `diatonic-${chord.degree}`,
      chord,
      label: DEGREE_TO_ROMAN[chord.degree],
      degree: chord.degree,
      group: 'diatonic',
    }));

    render(
      <ChordGrid
        chords={chords}
        onChordSelect={() => {}}
        showChordNames
        showRomanNumerals={false}
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
    const chords: ChordOption[] = getAllDiatonicChords('C').map((chord) => ({
      id: `diatonic-${chord.degree}`,
      chord,
      label: DEGREE_TO_ROMAN[chord.degree],
      degree: chord.degree,
      group: 'diatonic',
    }));
    let selected = '';

    render(
      <ChordGrid
        chords={chords}
        onChordSelect={(chord) => {
          selected = chord.root;
        }}
        showChordNames
        showRomanNumerals={false}
        showColors
        disabled={false}
        selectedChords={{ ii: null, V: null, I: null }}
      />
    );

    await user.click(screen.getByText('Dm7'));
    expect(selected).toBe('D');
  });

  test('shows roman numerals when chord names are hidden', () => {
    const chords: ChordOption[] = getAllDiatonicChords('C').map((chord) => ({
      id: `diatonic-${chord.degree}`,
      chord,
      label: DEGREE_TO_ROMAN[chord.degree],
      degree: chord.degree,
      group: 'diatonic',
    }));

    render(
      <ChordGrid
        chords={chords}
        onChordSelect={() => {}}
        showChordNames={false}
        showRomanNumerals={true}
        showColors
        disabled={false}
        selectedChords={{ ii: null, V: null, I: null }}
      />
    );

    expect(screen.getByText('I')).toBeVisible();
    expect(screen.getByText('ii')).toBeVisible();
  });
});
