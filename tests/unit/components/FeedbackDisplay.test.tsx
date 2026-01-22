/**
 * Tests for FeedbackDisplay component
 */

import { describe, expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { FeedbackDisplay } from '@/components/games/tonic-target/FeedbackDisplay';
import { buildTwoFiveOne } from '@/lib/music';

describe('FeedbackDisplay', () => {
  test('renders correct state', () => {
    const progression = buildTwoFiveOne({ tonic: 'C', mode: 'major' });

    render(
      <FeedbackDisplay
        isCorrect
        userProgressionString="Dm7 → G7 → Cmaj7"
        correctProgression={progression}
        theoryCard={null}
        onHearCorrect={() => {}}
        onNextRound={() => {}}
        isPlaying={false}
      />
    );

    expect(screen.getByText('Nice!')).toBeVisible();
    expect(screen.queryByTestId('correct-answer')).toBeNull();
  });

  test('renders incorrect state with theory card', () => {
    const progression = buildTwoFiveOne({ tonic: 'C', mode: 'major' });

    render(
      <FeedbackDisplay
        isCorrect={false}
        userProgressionString="Em7 → A7 → Dmaj7"
        correctProgression={progression}
        theoryCard={{
          id: 'test',
          title: 'Test Card',
          content: 'Remember the ii chord is minor.',
        }}
        onHearCorrect={() => {}}
        onNextRound={() => {}}
        isPlaying={false}
      />
    );

    expect(screen.getByText('Not quite')).toBeVisible();
    expect(screen.getByTestId('correct-answer')).toBeVisible();
    expect(screen.getByText('Test Card')).toBeVisible();
  });
});
