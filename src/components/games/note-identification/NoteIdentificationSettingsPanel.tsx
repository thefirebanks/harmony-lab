/**
 * Note Identification Settings Panel
 */

'use client';

import { useEffect, useState } from 'react';
import type { DifficultyLevel } from '@/lib/game-engine/types';
import type { NoteIdentificationSettings } from '@/games/note-identification/types';

interface NoteIdentificationSettingsPanelProps {
  isOpen: boolean;
  settings: NoteIdentificationSettings;
  onClose: () => void;
  onDifficultyChange: (level: DifficultyLevel) => void;
  onSettingChange: <K extends keyof NoteIdentificationSettings>(
    key: K,
    value: NoteIdentificationSettings[K]
  ) => void;
  onReset: () => void;
}

const difficultyDescriptions: Record<DifficultyLevel, string> = {
  1: 'Naturals only',
  2: 'Chromatic set',
  3: 'More options',
  4: 'Maximum choices',
  5: 'No auto-play',
};

export function NoteIdentificationSettingsPanel({
  isOpen,
  settings,
  onClose,
  onDifficultyChange,
  onSettingChange,
  onReset,
}: NoteIdentificationSettingsPanelProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close settings"
        className={`
          absolute inset-0 bg-black transition-opacity duration-300 ease-out
          ${isAnimating ? 'opacity-50' : 'opacity-0'}
        `}
        onClick={onClose}
      />

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
            <h3 className="text-sm uppercase tracking-wide text-text-muted">Answer Options</h3>
            <div className="space-y-3 bg-background-elevated p-3 rounded-lg border border-text-muted/20">
              <div>
                <span className="text-text-primary">Note pool</span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(['natural', 'chromatic'] as const).map((pool) => {
                    const isSelected = settings.notePool === pool;
                    return (
                      <button
                        key={pool}
                        type="button"
                        onClick={() => onSettingChange('notePool', pool)}
                        data-selected={isSelected}
                        className={
                          `px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                            isSelected
                              ? 'bg-accent text-background border-accent'
                              : 'bg-background border-text-muted/30 text-text-primary hover:border-accent/60'
                          }`
                        }
                      >
                        {pool === 'natural' ? 'Naturals' : 'Chromatic'}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <span className="text-text-primary">Choices per round</span>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[3, 4, 6, 8].map((option) => {
                    const isSelected = settings.optionsCount === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => onSettingChange('optionsCount', option)}
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
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm uppercase tracking-wide text-text-muted">Audio</h3>
            <label className="flex items-center justify-between gap-3 bg-background-elevated p-3 rounded-lg border border-text-muted/20">
              <span className="text-text-primary">Auto-play note</span>
              <input
                type="checkbox"
                checked={settings.autoPlayNote}
                onChange={(event) => onSettingChange('autoPlayNote', event.target.checked)}
                className="h-4 w-4 accent-accent"
              />
            </label>
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
                    {[1, 2, 5, 10, 15, 20].map((option) => {
                      const isSelected = settings.roundsPerSession === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => onSettingChange('roundsPerSession', option)}
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
                    {[60, 300, 600, 900].map((seconds) => {
                      const isSelected = settings.timeLimitSeconds === seconds;
                      return (
                        <button
                          key={seconds}
                          type="button"
                          onClick={() => onSettingChange('timeLimitSeconds', seconds)}
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
