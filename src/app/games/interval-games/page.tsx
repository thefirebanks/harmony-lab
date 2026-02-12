/**
 * Interval Games Page
 * Interval Flash and related interval training games
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { GameShell, LoadingScreen, ProfileModal, ProgressPanel } from '@/components/shared';
import { IntervalFlashGame, IntervalGameSettingsPanel } from '@/components/games/interval-games';
import { useAudioStore, useSettingsStore, useIntervalFlashStore } from '@/stores';

export default function IntervalGamesPage() {
  const { isLoaded, isLoading, loadAudio, error, loadingProgress } = useAudioStore();
  const settings = useSettingsStore((state) => state.intervalFlash);
  const setIntervalFlashSetting = useSettingsStore((state) => state.setIntervalFlashSetting);
  const setIntervalFlashDifficulty = useSettingsStore(
    (state) => state.setIntervalFlashDifficulty
  );
  const resetIntervalFlashSettings = useSettingsStore(
    (state) => state.resetIntervalFlashSettings
  );

  const hasPausedSession = useIntervalFlashStore((state) => state.hasPausedSession);
  const restoreSession = useIntervalFlashStore((state) => state.restoreSession);
  const pauseSession = useIntervalFlashStore((state) => state.pauseSession);
  const startNewRound = useIntervalFlashStore((state) => state.startNewRound);
  const stopTimer = useIntervalFlashStore((state) => state.stopTimer);

  const [hasInteracted, setHasInteracted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Start loading audio after user interaction
  const handleStart = async () => {
    setHasInteracted(true);
    await loadAudio();
  };

  // Handle resuming a paused session
  const handleResume = useCallback(() => {
    restoreSession();
    setShowResumePrompt(false);
    setSessionChecked(true);
  }, [restoreSession]);

  // Handle starting a new session (discarding paused)
  const handleNewSession = useCallback(() => {
    setShowResumePrompt(false);
    setSessionChecked(true);
    startNewRound();
  }, [startNewRound]);

  // Check for paused session after audio loads (same pattern as tonic-target)
  useEffect(() => {
    if (!isLoaded || sessionChecked) return;

    if (hasPausedSession()) {
      setShowResumePrompt(true); // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      setSessionChecked(true);
    }
  }, [isLoaded, sessionChecked, hasPausedSession]);

  // Save session when user leaves the page
  useEffect(() => {
    if (!isLoaded) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        pauseSession();
      }
    };

    const handleBeforeUnload = () => {
      pauseSession();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoaded, pauseSession]);

  // Check tutorial state (same pattern as tonic-target)
  useEffect(() => {
    if (!hasInteracted || !isLoaded || tutorialChecked) return;

    const dismissed = window.localStorage.getItem('harmony-lab-interval-games-tutorial');
    setShowTutorial(!dismissed); // eslint-disable-line react-hooks/set-state-in-effect
    setTutorialChecked(true);
  }, [hasInteracted, isLoaded, tutorialChecked]);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    window.localStorage.setItem('harmony-lab-interval-games-tutorial', 'dismissed');
  };

  // Stop timer when leaving page
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  // Show start screen if not interacted
  if (!hasInteracted) {
    return (
      <GameShell
        title="Interval Flash"
        onSettingsClick={() => setSettingsOpen(true)}
        onProgressClick={() => setProgressOpen(true)}
        onHelpClick={() => setShowTutorial(true)}
        onProfileClick={() => setProfileOpen(true)}
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-text-primary">Interval Flash</h2>
            <p className="text-text-secondary max-w-md">
              Identify intervals under time pressure to develop intuitive interval recognition.
              Speed defeats calculation!
            </p>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-4 bg-accent text-background font-bold text-lg rounded-xl hover:bg-accent-hover transition-colors"
          >
            Start Training
          </button>

          <p className="text-text-muted text-sm">Click to load audio samples and begin</p>
        </div>
        <IntervalGameSettingsPanel
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onDifficultyChange={setIntervalFlashDifficulty}
          onSettingChange={setIntervalFlashSetting}
          onReset={resetIntervalFlashSettings}
        />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
        {showTutorial && (
          <TutorialOverlay onClose={handleCloseTutorial} />
        )}
      </GameShell>
    );
  }

  // Show loading screen while samples load
  if (isLoading) {
    return (
      <GameShell
        title="Interval Flash"
        onSettingsClick={() => setSettingsOpen(true)}
        onProgressClick={() => setProgressOpen(true)}
        onHelpClick={() => setShowTutorial(true)}
        onProfileClick={() => setProfileOpen(true)}
      >
        <LoadingScreen message="Loading piano samples..." progress={loadingProgress} />
        <IntervalGameSettingsPanel
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onDifficultyChange={setIntervalFlashDifficulty}
          onSettingChange={setIntervalFlashSetting}
          onReset={resetIntervalFlashSettings}
        />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
      </GameShell>
    );
  }

  // Show error if loading failed
  if (error) {
    return (
      <GameShell
        title="Interval Flash"
        onSettingsClick={() => setSettingsOpen(true)}
        onProgressClick={() => setProgressOpen(true)}
        onHelpClick={() => setShowTutorial(true)}
        onProfileClick={() => setProfileOpen(true)}
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
          <p className="text-error">Failed to load audio: {error}</p>
          <button
            onClick={loadAudio}
            className="px-4 py-2 bg-accent text-background rounded-xl"
          >
            Retry
          </button>
        </div>
        <IntervalGameSettingsPanel
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onDifficultyChange={setIntervalFlashDifficulty}
          onSettingChange={setIntervalFlashSetting}
          onReset={resetIntervalFlashSettings}
        />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
      </GameShell>
    );
  }

  // Show resume prompt if there's a paused session
  if (showResumePrompt) {
    return (
      <GameShell
        title="Interval Flash"
        onSettingsClick={() => setSettingsOpen(true)}
        onProgressClick={() => setProgressOpen(true)}
        onHelpClick={() => setShowTutorial(true)}
        onProfileClick={() => setProfileOpen(true)}
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary">Welcome Back</h2>
            <p className="text-text-secondary max-w-md">
              You have an unfinished practice session. Would you like to continue where you left off?
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleResume}
              className="px-6 py-3 bg-accent text-background font-bold rounded-xl hover:bg-accent-hover transition-colors"
            >
              Resume Session
            </button>
            <button
              onClick={handleNewSession}
              className="px-6 py-3 bg-background-elevated text-text-primary font-medium rounded-xl border border-text-muted/20 hover:border-accent/60 transition-colors"
            >
              Start Fresh
            </button>
          </div>
        </div>
        <IntervalGameSettingsPanel
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onDifficultyChange={setIntervalFlashDifficulty}
          onSettingChange={setIntervalFlashSetting}
          onReset={resetIntervalFlashSettings}
        />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
        {showTutorial && <TutorialOverlay onClose={handleCloseTutorial} />}
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Interval Flash"
      onSettingsClick={() => setSettingsOpen(true)}
      onProgressClick={() => setProgressOpen(true)}
      onHelpClick={() => setShowTutorial(true)}
      onProfileClick={() => setProfileOpen(true)}
    >
      <IntervalFlashGame onViewProgress={() => setProgressOpen(true)} />
      <IntervalGameSettingsPanel
        isOpen={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onDifficultyChange={setIntervalFlashDifficulty}
        onSettingChange={setIntervalFlashSetting}
        onReset={resetIntervalFlashSettings}
      />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
      {showTutorial && (
        <TutorialOverlay onClose={handleCloseTutorial} />
      )}
    </GameShell>
  );
}

/**
 * Tutorial overlay for Interval Flash
 */
function TutorialOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--background)] border border-[var(--text-muted)]/20 rounded-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--text-muted)]/10">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">How to Play</h2>
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

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Listen</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  You&apos;ll hear two notes played one after another (melodic interval).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Identify</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Before the timer runs out, identify the interval by clicking the correct
                  button (m2, M3, P5, etc.).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Learn</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  After each answer, you&apos;ll see the guitar fretboard shape for that
                  interval to reinforce the pattern.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--background-elevated)] rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-[var(--text-primary)]">Keyboard Shortcuts</h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              <li>
                <kbd className="px-1.5 py-0.5 bg-[var(--background)] rounded text-xs">1-6</kbd>{' '}
                Select answer
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-[var(--background)] rounded text-xs">R</kbd>{' '}
                Replay interval
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 bg-[var(--background)] rounded text-xs">
                  Enter
                </kbd>{' '}
                Next round (after feedback)
              </li>
            </ul>
          </div>

          <div className="bg-[var(--background-elevated)] rounded-lg p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-2">The Goal</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              The time pressure is intentional! The goal is to develop <em>intuitive</em>{' '}
              interval recognition, not calculation. With practice, you&apos;ll instantly
              recognize each interval&apos;s unique character.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[var(--accent)] text-[var(--background)] font-bold rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
