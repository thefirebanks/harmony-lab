/**
 * Progress Panel Component
 * Displays session history and per-key statistics
 */

'use client';

import { useEffect, useState } from 'react';
import { useProgressStore } from '@/stores';
import type { NoteName } from '@/lib/music/types';
import { Card } from '@/components/ui';

interface ProgressPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_KEYS: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function AccuracyBar({ accuracy, attempts }: { accuracy: number; attempts: number }) {
  const getColor = () => {
    if (attempts < 3) return 'bg-text-muted/30';
    if (accuracy >= 80) return 'bg-success';
    if (accuracy >= 60) return 'bg-accent';
    return 'bg-error';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${attempts >= 3 ? accuracy : 0}%` }}
        />
      </div>
      <span className="text-xs text-text-muted w-12 text-right">
        {attempts >= 3 ? `${accuracy}%` : `${attempts}/3`}
      </span>
    </div>
  );
}

export function ProgressPanel({ isOpen, onClose }: ProgressPanelProps) {
  const {
    sessions,
    keyStats,
    getTotalRounds,
    getOverallAccuracy,
    getWeakestKeys,
    getStrongestKeys,
    clearAllProgress,
  } = useProgressStore();

  // Animation state
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

  const totalRounds = getTotalRounds();
  const overallAccuracy = getOverallAccuracy();
  const weakestKeys = getWeakestKeys(3);
  const strongestKeys = getStrongestKeys(3);
  const recentSessions = sessions.slice(0, 5);

  const handleClearProgress = () => {
    if (window.confirm('Are you sure you want to clear all progress? This cannot be undone.')) {
      clearAllProgress();
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close progress"
        className={`
          absolute inset-0 bg-black transition-opacity duration-300 ease-out
          ${isAnimating ? 'opacity-50' : 'opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`
          absolute left-0 top-0 h-full w-full max-w-lg bg-background
          border-r border-text-muted/20 shadow-xl p-6 overflow-y-auto
          transform transition-transform duration-300 ease-out
          ${isAnimating ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Progress</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        {totalRounds === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p className="text-lg mb-2">No progress yet</p>
            <p className="text-sm">Complete some rounds to see your stats!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Stats */}
            <section>
              <h3 className="text-sm uppercase tracking-wide text-text-muted mb-3">Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-text-primary">{totalRounds}</div>
                  <div className="text-sm text-text-muted">Total Rounds</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-3xl font-bold text-accent">{overallAccuracy}%</div>
                  <div className="text-sm text-text-muted">Accuracy</div>
                </Card>
              </div>
            </section>

            {/* Key Insights */}
            {(weakestKeys.length > 0 || strongestKeys.length > 0) && (
              <section>
                <h3 className="text-sm uppercase tracking-wide text-text-muted mb-3">Key Insights</h3>
                <div className="grid grid-cols-2 gap-3">
                  {strongestKeys.length > 0 && (
                    <Card className="p-3">
                      <div className="text-xs text-text-muted mb-2">Strongest</div>
                      <div className="flex flex-wrap gap-1">
                        {strongestKeys.map((key) => (
                          <span
                            key={key}
                            className="px-2 py-1 bg-success/20 text-success text-sm rounded font-medium"
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}
                  {weakestKeys.length > 0 && (
                    <Card className="p-3">
                      <div className="text-xs text-text-muted mb-2">Needs Practice</div>
                      <div className="flex flex-wrap gap-1">
                        {weakestKeys.map((key) => (
                          <span
                            key={key}
                            className="px-2 py-1 bg-error/20 text-error text-sm rounded font-medium"
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </section>
            )}

            {/* Per-Key Breakdown */}
            <section>
              <h3 className="text-sm uppercase tracking-wide text-text-muted mb-3">
                Accuracy by Key
              </h3>
              <Card className="p-4">
                <div className="space-y-3">
                  {ALL_KEYS.map((key) => {
                    const stats = keyStats[key];
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className="w-8 text-sm font-medium text-text-primary">{key}</span>
                        <div className="flex-1">
                          <AccuracyBar accuracy={stats.accuracy} attempts={stats.totalAttempts} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </section>

            {/* Recent Sessions */}
            {recentSessions.length > 0 && (
              <section>
                <h3 className="text-sm uppercase tracking-wide text-text-muted mb-3">
                  Recent Sessions
                </h3>
                <div className="space-y-2">
                  {recentSessions.map((session) => (
                    <Card key={session.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-text-primary">
                            {session.roundsCorrect}/{session.roundsCompleted} correct
                          </div>
                          <div className="text-xs text-text-muted">
                            {formatDate(session.date)} · {session.durationMinutes}min
                          </div>
                        </div>
                        <div
                          className={`
                            text-lg font-bold
                            ${session.accuracy >= 80 ? 'text-success' : ''}
                            ${session.accuracy >= 60 && session.accuracy < 80 ? 'text-accent' : ''}
                            ${session.accuracy < 60 ? 'text-error' : ''}
                          `}
                        >
                          {session.accuracy}%
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Clear Progress */}
            <button
              type="button"
              onClick={handleClearProgress}
              className="w-full py-2 rounded-lg border border-error/30 text-error hover:border-error/60 transition-colors text-sm"
            >
              Clear All Progress
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
