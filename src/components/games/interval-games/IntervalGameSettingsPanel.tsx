/**
 * Interval Game Settings Panel Component
 * Settings modal for Interval Flash game
 */

'use client';

import type { DifficultyLevel } from '@/lib/game-engine/types';
import type { IntervalFlashSettings, IntervalName } from '@/games/interval-games/types';
import { INTERVAL_GROUPS } from '@/games/interval-games/types';

interface IntervalGameSettingsPanelProps {
  isOpen: boolean;
  settings: IntervalFlashSettings;
  onClose: () => void;
  onDifficultyChange: (level: DifficultyLevel) => void;
  onSettingChange: <K extends keyof IntervalFlashSettings>(
    key: K,
    value: IntervalFlashSettings[K]
  ) => void;
  onReset: () => void;
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, { name: string; description: string }> = {
  1: { name: 'Foundations', description: 'Perfect intervals, 5s timer' },
  2: { name: 'Thirds', description: 'Add major/minor 3rds, 4s' },
  3: { name: 'Seconds', description: 'Add 2nds, 4s timer' },
  4: { name: 'Extended', description: 'Add tritone & 6ths, both directions' },
  5: { name: 'Complete', description: 'All intervals, 3s timer' },
};

export function IntervalGameSettingsPanel({
  isOpen,
  settings,
  onClose,
  onDifficultyChange,
  onSettingChange,
  onReset,
}: IntervalGameSettingsPanelProps) {
  if (!isOpen) return null;

  const toggleInterval = (interval: IntervalName) => {
    const current = settings.enabledIntervals;
    if (current.includes(interval)) {
      // Don't allow removing all intervals
      if (current.length > 2) {
        onSettingChange(
          'enabledIntervals',
          current.filter((i) => i !== interval)
        );
      }
    } else {
      onSettingChange('enabledIntervals', [...current, interval]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--background)] border border-[var(--text-muted)]/20 rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--text-muted)]/10">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Difficulty */}
          <div>
            <label className="text-sm font-semibold text-[var(--text-secondary)] mb-2 block">
              Difficulty
            </label>
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => onDifficultyChange(level)}
                  className={`p-2 rounded-lg border text-center transition-colors ${
                    settings.difficulty === level
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--background)]'
                      : 'bg-[var(--background-elevated)] border-[var(--text-muted)]/20 text-[var(--text-primary)] hover:border-[var(--accent)]/50'
                  }`}
                >
                  <div className="font-bold">{level}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              {DIFFICULTY_LABELS[settings.difficulty].name}:{' '}
              {DIFFICULTY_LABELS[settings.difficulty].description}
            </p>
          </div>

          {/* Enabled Intervals */}
          <div>
            <label className="text-sm font-semibold text-[var(--text-secondary)] mb-2 block">
              Enabled Intervals
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERVAL_GROUPS.all.map((interval) => (
                <button
                  key={interval}
                  onClick={() => toggleInterval(interval)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    settings.enabledIntervals.includes(interval)
                      ? 'bg-[var(--accent)] text-[var(--background)]'
                      : 'bg-[var(--background-elevated)] text-[var(--text-muted)] border border-[var(--text-muted)]/20'
                  }`}
                >
                  {interval}
                </button>
              ))}
            </div>
          </div>

          {/* Include Descending */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] block">
                Include Descending
              </label>
              <p className="text-xs text-[var(--text-muted)]">
                Practice intervals going down as well as up
              </p>
            </div>
            <button
              onClick={() => onSettingChange('includeDescending', !settings.includeDescending)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.includeDescending ? 'bg-[var(--accent)]' : 'bg-[var(--background-elevated)]'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.includeDescending ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Time Limit */}
          <div>
            <label className="text-sm font-semibold text-[var(--text-secondary)] mb-2 block">
              Time Limit: {settings.timeLimit}s
            </label>
            <input
              type="range"
              min="2"
              max="10"
              step="0.5"
              value={settings.timeLimit}
              onChange={(e) => onSettingChange('timeLimit', parseFloat(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>

          {/* Show Semitones */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] block">
                Show Semitones
              </label>
              <p className="text-xs text-[var(--text-muted)]">
                Display semitone count on answer buttons
              </p>
            </div>
            <button
              onClick={() =>
                onSettingChange('showIntervalSemitones', !settings.showIntervalSemitones)
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.showIntervalSemitones
                  ? 'bg-[var(--accent)]'
                  : 'bg-[var(--background-elevated)]'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.showIntervalSemitones ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Show Fretboard */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] block">
                Show Fretboard
              </label>
              <p className="text-xs text-[var(--text-muted)]">
                Display guitar shapes on feedback
              </p>
            </div>
            <button
              onClick={() =>
                onSettingChange('showFretboardOnFeedback', !settings.showFretboardOnFeedback)
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.showFretboardOnFeedback
                  ? 'bg-[var(--accent)]'
                  : 'bg-[var(--background-elevated)]'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.showFretboardOnFeedback ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Session Mode */}
          <div>
            <label className="text-sm font-semibold text-[var(--text-secondary)] mb-2 block">
              Session Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSettingChange('sessionMode', 'rounds')}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  settings.sessionMode === 'rounds'
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--background)]'
                    : 'bg-[var(--background-elevated)] border-[var(--text-muted)]/20 text-[var(--text-primary)]'
                }`}
              >
                <div className="font-semibold">Rounds</div>
                <div className="text-xs opacity-75">{settings.roundsPerSession} rounds</div>
              </button>
              <button
                onClick={() => onSettingChange('sessionMode', 'time')}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  settings.sessionMode === 'time'
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--background)]'
                    : 'bg-[var(--background-elevated)] border-[var(--text-muted)]/20 text-[var(--text-primary)]'
                }`}
              >
                <div className="font-semibold">Timed</div>
                <div className="text-xs opacity-75">
                  {Math.floor(settings.timeLimitSeconds / 60)} min
                </div>
              </button>
            </div>
          </div>

          {/* Rounds per session (if rounds mode) */}
          {settings.sessionMode === 'rounds' && (
            <div>
              <label className="text-sm font-semibold text-[var(--text-secondary)] mb-2 block">
                Rounds per Session: {settings.roundsPerSession}
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={settings.roundsPerSession}
                onChange={(e) =>
                  onSettingChange('roundsPerSession', parseInt(e.target.value, 10))
                }
                className="w-full accent-[var(--accent)]"
              />
            </div>
          )}

          {/* Reset button */}
          <button
            onClick={onReset}
            className="w-full py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
