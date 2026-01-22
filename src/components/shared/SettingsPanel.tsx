/**
 * Settings Panel Component
 * Slide-over for configuring game settings
 */

'use client';

import type { DifficultyLevel } from '@/lib/game-engine/types';
import type { TonicTargetSettings } from '@/games/tonic-target/types';

interface SettingsPanelProps {
  isOpen: boolean;
  settings: TonicTargetSettings;
  onClose: () => void;
  onDifficultyChange: (level: DifficultyLevel) => void;
  onSettingChange: <K extends keyof TonicTargetSettings>(
    key: K,
    value: TonicTargetSettings[K]
  ) => void;
  onReset: () => void;
}

const difficultyDescriptions: Record<DifficultyLevel, string> = {
  1: 'Full training wheels',
  2: 'Start associating',
  3: 'Names hidden',
  4: 'Pure function',
  5: 'Derive key by ear',
};

export function SettingsPanel({
  isOpen,
  settings,
  onClose,
  onDifficultyChange,
  onSettingChange,
  onReset,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close settings"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-text-muted/20 shadow-xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
            data-testid="settings-close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm uppercase tracking-wide text-text-muted">Difficulty</h3>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => {
                const isSelected = settings.difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onDifficultyChange(level as DifficultyLevel)}
                    data-testid={`difficulty-${level}`}
                    data-selected={isSelected}
                    className={
                      `px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                        isSelected
                          ? 'bg-accent text-background border-accent'
                          : 'bg-background-elevated border-text-muted/30 text-text-primary hover:border-accent/60'
                      }`
                    }
                  >
                    {level}
                  </button>
                );
              })}
            </div>
            <p className="text-text-secondary text-sm">
              {difficultyDescriptions[settings.difficulty]}
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm uppercase tracking-wide text-text-muted">Display</h3>
            <label className="flex items-center justify-between gap-3 bg-background-elevated p-3 rounded-lg border border-text-muted/20">
              <span className="text-text-primary">Show chord names</span>
              <input
                type="checkbox"
                checked={settings.showChordNames}
                onChange={(event) => onSettingChange('showChordNames', event.target.checked)}
                data-testid="setting-show-chord-names"
                className="h-4 w-4 accent-accent"
              />
            </label>
            <label className="flex items-center justify-between gap-3 bg-background-elevated p-3 rounded-lg border border-text-muted/20">
              <span className="text-text-primary">Show degree colors</span>
              <input
                type="checkbox"
                checked={settings.showColors}
                onChange={(event) => onSettingChange('showColors', event.target.checked)}
                data-testid="setting-show-colors"
                className="h-4 w-4 accent-accent"
              />
            </label>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm uppercase tracking-wide text-text-muted">Audio</h3>
            <label className="flex items-center justify-between gap-3 bg-background-elevated p-3 rounded-lg border border-text-muted/20">
              <span className="text-text-primary">Include bass note</span>
              <input
                type="checkbox"
                checked={settings.includeBassNote}
                onChange={(event) => onSettingChange('includeBassNote', event.target.checked)}
                data-testid="setting-include-bass"
                className="h-4 w-4 accent-accent"
              />
            </label>
            <label className="flex items-center justify-between gap-3 bg-background-elevated p-3 rounded-lg border border-text-muted/20">
              <span className="text-text-primary">Auto-play tonic</span>
              <input
                type="checkbox"
                checked={settings.autoPlayTonic}
                onChange={(event) => onSettingChange('autoPlayTonic', event.target.checked)}
                data-testid="setting-auto-play-tonic"
                className="h-4 w-4 accent-accent"
              />
            </label>
            <div className="space-y-2 bg-background-elevated p-3 rounded-lg border border-text-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-text-primary">Playback tempo</span>
                <span className="text-text-secondary text-sm">{settings.playbackTempo} BPM</span>
              </div>
              <input
                type="range"
                min={60}
                max={160}
                step={5}
                value={settings.playbackTempo}
                onChange={(event) => onSettingChange('playbackTempo', Number(event.target.value))}
                data-testid="tempo-slider"
                className="w-full accent-accent"
              />
            </div>
          </section>

          <button
            type="button"
            onClick={onReset}
            className="w-full py-2 rounded-lg border border-text-muted/30 text-text-primary hover:border-accent/60 transition-colors"
          >
            Reset to defaults
          </button>
        </div>
      </aside>
    </div>
  );
}
