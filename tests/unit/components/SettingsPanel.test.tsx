/**
 * Tests for SettingsPanel component
 */

import { describe, expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPanel } from '@/components/shared/SettingsPanel';
import { defaultTonicTargetSettings } from '@/games/tonic-target/types';

describe('SettingsPanel', () => {
  test('renders difficulty buttons and toggles', () => {
    render(
      <SettingsPanel
        isOpen
        settings={defaultTonicTargetSettings}
        onClose={() => {}}
        onDifficultyChange={() => {}}
        onSettingChange={() => {}}
        onReset={() => {}}
      />
    );

    expect(screen.getByText('Settings')).toBeVisible();
    expect(screen.getByTestId('difficulty-1')).toBeVisible();
    expect(screen.getByTestId('setting-show-chord-names')).toBeVisible();
    expect(screen.getByTestId('tempo-slider')).toBeVisible();
  });

  test('fires onDifficultyChange when clicked', async () => {
    const user = userEvent.setup();
    let selected = 0;

    render(
      <SettingsPanel
        isOpen
        settings={defaultTonicTargetSettings}
        onClose={() => {}}
        onDifficultyChange={(level) => {
          selected = level;
        }}
        onSettingChange={() => {}}
        onReset={() => {}}
      />
    );

    await user.click(screen.getByTestId('difficulty-3'));
    expect(selected).toBe(3);
  });
});
