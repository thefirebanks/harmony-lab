/**
 * Tonic Target Practice Game Page
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { GameShell, SettingsPanel, TutorialOverlay, ProgressPanel, ProfileModal } from '@/components/shared';
import { TonicTargetGame } from '@/components/games/tonic-target';
import { LoadingScreen } from '@/components/shared';
import { useAudioStore, useSettingsStore, useTonicTargetStore } from '@/stores';

export default function TonicTargetPage() {
  const { isLoaded, isLoading, loadAudio, error, loadingProgress } = useAudioStore();
  const settings = useSettingsStore((state) => state.tonicTarget);
  const setTonicTargetSetting = useSettingsStore((state) => state.setTonicTargetSetting);
  const setDifficulty = useSettingsStore((state) => state.setDifficulty);
  const resetTonicTargetSettings = useSettingsStore((state) => state.resetTonicTargetSettings);

  const hasPausedSession = useTonicTargetStore((state) => state.hasPausedSession);
  const restoreSession = useTonicTargetStore((state) => state.restoreSession);
  const pauseSession = useTonicTargetStore((state) => state.pauseSession);
  const startNewRound = useTonicTargetStore((state) => state.startNewRound);

  const [hasInteracted, setHasInteracted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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

  // Check for paused session after audio loads
  useEffect(() => {
    if (!isLoaded || sessionChecked) return;

    if (hasPausedSession()) {
      setShowResumePrompt(true);
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

  useEffect(() => {
    if (!hasInteracted || !isLoaded || tutorialChecked) return;

    const dismissed = window.localStorage.getItem('harmony-lab-tonic-target-tutorial');
    setShowTutorial(!dismissed);
    setTutorialChecked(true);
  }, [hasInteracted, isLoaded, tutorialChecked]);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    window.localStorage.setItem('harmony-lab-tonic-target-tutorial', 'dismissed');
  };

  // Show start screen if not interacted
  if (!hasInteracted) {
    return (
        <GameShell
          title="Tonic Target Practice"
          onSettingsClick={() => setSettingsOpen(true)}
          onProgressClick={() => setProgressOpen(true)}
          onHelpClick={() => setShowTutorial(true)}
          onProfileClick={() => setProfileOpen(true)}
        >
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-text-primary">Tonic Target Practice</h2>
            <p className="text-text-secondary max-w-md">
              Build ii-V-I progressions in random keys to develop your functional harmony intuition.
            </p>
          </div>

          <button
            onClick={handleStart}
            className="px-8 py-4 bg-accent text-background font-bold text-lg rounded-xl hover:bg-accent-hover transition-colors"
          >
            Start Practice
          </button>

          <p className="text-text-muted text-sm">
            Click to load piano samples and begin
          </p>
        </div>
        <SettingsPanel
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onDifficultyChange={setDifficulty}
          onSettingChange={setTonicTargetSetting}
          onReset={resetTonicTargetSettings}
        />
        <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        <TutorialOverlay isOpen={showTutorial} onClose={handleCloseTutorial} />
      </GameShell>
    );
  }

  // Show loading screen while samples load
  if (isLoading) {
    return (
        <GameShell
          title="Tonic Target Practice"
          onSettingsClick={() => setSettingsOpen(true)}
          onProgressClick={() => setProgressOpen(true)}
          onHelpClick={() => setShowTutorial(true)}
          onProfileClick={() => setProfileOpen(true)}
        >
        <LoadingScreen message="Loading piano samples..." progress={loadingProgress} />
        <SettingsPanel
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onDifficultyChange={setDifficulty}
          onSettingChange={setTonicTargetSetting}
          onReset={resetTonicTargetSettings}
        />
        <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        <TutorialOverlay isOpen={showTutorial} onClose={handleCloseTutorial} />
      </GameShell>
    );
  }

  // Show error if loading failed
  if (error) {
    return (
        <GameShell
          title="Tonic Target Practice"
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
        <SettingsPanel
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onDifficultyChange={setDifficulty}
          onSettingChange={setTonicTargetSetting}
          onReset={resetTonicTargetSettings}
        />
        <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        <TutorialOverlay isOpen={showTutorial} onClose={handleCloseTutorial} />
      </GameShell>
    );
  }

  // Show resume prompt if there's a paused session
  if (showResumePrompt) {
    return (
      <GameShell
        title="Tonic Target Practice"
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
        <SettingsPanel
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onDifficultyChange={setDifficulty}
          onSettingChange={setTonicTargetSetting}
          onReset={resetTonicTargetSettings}
        />
        <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        <TutorialOverlay isOpen={showTutorial} onClose={handleCloseTutorial} />
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Tonic Target Practice"
      onSettingsClick={() => setSettingsOpen(true)}
      onProgressClick={() => setProgressOpen(true)}
      onHelpClick={() => setShowTutorial(true)}
      onProfileClick={() => setProfileOpen(true)}
    >
      <TonicTargetGame onViewProgress={() => setProgressOpen(true)} />
      <SettingsPanel
        isOpen={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onDifficultyChange={setDifficulty}
        onSettingChange={setTonicTargetSetting}
        onReset={resetTonicTargetSettings}
      />
      <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <TutorialOverlay isOpen={showTutorial} onClose={handleCloseTutorial} />
    </GameShell>
  );
}
