/**
 * Settings Panel Component
 * Slide-over for configuring game settings with smooth animations
 */

'use client';

import { useEffect, useState } from 'react';
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
  // Track mount state for exit animation
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to trigger enter animation
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      // Wait for exit animation before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop with fade animation */}
      <button
        type="button"
        aria-label="Close settings"
        className={`
          absolute inset-0 bg-black transition-opacity duration-300 ease-out
          ${isAnimating ? 'opacity-50' : 'opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Panel with slide animation */}
      <aside
        className={`
          absolute right-0 top-0 h-full w-full max-w-md bg-background
          border-l border-text-muted/20 shadow-xl p-6 overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isAnimating ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
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
              <span className="text-text-primary">Show roman numerals</span>
              <input
                type="checkbox"
                checked={settings.showRomanNumerals}
                onChange={(event) => onSettingChange('showRomanNumerals', event.target.checked)}
                data-testid="setting-show-roman-numerals"
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

          <section className="space-y-3">
            <h3 className="text-sm uppercase tracking-wide text-text-muted">Session</h3>
            <div className="space-y-2 bg-background-elevated p-3 rounded-lg border border-text-muted/20">
              <span className="text-text-primary">Session mode</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(['rounds', 'time'] as const).map((mode) => {
                  const isSelected = settings.sessionMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onSettingChange('sessionMode', mode)}
                      data-testid={`session-mode-${mode}`}
                      data-selected={isSelected}
                      className={
                        `px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                          isSelected
                            ? 'bg-accent text-background border-accent'
                            : 'bg-background border-text-muted/30 text-text-primary hover:border-accent/60'
                        }`
                      }
                    >
                      {mode === 'rounds' ? 'Rounds' : 'Timer'}
                    </button>
                  );
                })}
              </div>
              {settings.sessionMode === 'rounds' ? (
                <>
                  <span className="text-text-primary">Rounds per session</span>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {([1, 2, 5, 10, 15, 20] as const).map((option) => {
                      const isSelected = settings.roundsPerSession === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => onSettingChange('roundsPerSession', option)}
                          data-testid={`rounds-${option}`}
                          data-selected={isSelected}
                          className={
                            `px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                              isSelected
                                ? 'bg-accent text-background border-accent'
                                : 'bg-background border-text-muted/30 text-text-primary hover:border-accent/60'
                            }`
                          }
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <span className="text-text-primary">Time limit</span>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {([60, 300, 600, 900] as const).map((seconds) => {
                      const isSelected = settings.timeLimitSeconds === seconds;
                      return (
                        <button
                          key={seconds}
                          type="button"
                          onClick={() => onSettingChange('timeLimitSeconds', seconds)}
                          data-testid={`time-limit-${seconds}`}
                          data-selected={isSelected}
                          className={
                            `px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                              isSelected
                                ? 'bg-accent text-background border-accent'
                                : 'bg-background border-text-muted/30 text-text-primary hover:border-accent/60'
                            }`
                          }
                        >
                          {Math.round(seconds / 60)} min
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm uppercase tracking-wide text-text-muted">Target Degrees</h3>
            <div className="bg-background-elevated p-3 rounded-lg border border-text-muted/20">
              <div className="mb-3">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={settings.targetDegrees === 'random'}
                    onChange={() => onSettingChange('targetDegrees', 'random')}
                    data-testid="target-degrees-random"
                    className="h-4 w-4 accent-accent"
                  />
                  <span className="text-text-primary">Random (all degrees)</span>
                </label>
              </div>
              <div className="mb-2">
                <span className="text-text-primary">Or choose specific degrees:</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((degree) => {
                  const typedDegree = degree as 1 | 2 | 3 | 4 | 5 | 6;
                  const isSelected = Array.isArray(settings.targetDegrees) && settings.targetDegrees.includes(typedDegree);
                  return (
                    <button
                      key={degree}
                      type="button"
                      onClick={() => {
                        const current = settings.targetDegrees === 'random' ? [] : settings.targetDegrees;
                        if (current.includes(typedDegree)) {
                          if (current.length > 1) {
                            onSettingChange('targetDegrees', current.filter((d) => d !== typedDegree));
                          }
                        } else {
                          onSettingChange('targetDegrees', [...current, typedDegree]);
                        }
                      }}
                      data-testid={`target-degree-${degree}`}
                      data-selected={isSelected}
                      disabled={settings.targetDegrees === 'random'}
                      className={
                        `px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                          isSelected
                            ? 'bg-accent text-background border-accent'
                            : 'bg-background border-text-muted/30 text-text-primary hover:border-accent/60'
                        } ${settings.targetDegrees === 'random' ? 'opacity-50' : ''}`
                      }
                    >
                      {degree}
                    </button>
                  );
                })}
              </div>
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
