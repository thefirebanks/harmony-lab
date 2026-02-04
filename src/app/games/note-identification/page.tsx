/**
 * Note Identification Game Page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameShell, ProgressPanel, ProfileModal, LoadingScreen } from '@/components/shared';
import { NoteIdentificationGame, NoteIdentificationSettingsPanel } from '@/components/games/note-identification';
import { useAudioStore, useSettingsStore, useNoteIdentificationStore } from '@/stores';

export default function NoteIdentificationPage() {
  const { isLoaded, isLoading, loadAudio, error, loadingProgress } = useAudioStore();
  const settings = useSettingsStore((state) => state.noteIdentification);
  const setNoteIdentificationSetting = useSettingsStore((state) => state.setNoteIdentificationSetting);
  const setNoteIdentificationDifficulty = useSettingsStore((state) => state.setNoteIdentificationDifficulty);
  const resetNoteIdentificationSettings = useSettingsStore((state) => state.resetNoteIdentificationSettings);

  const hasPausedSession = useNoteIdentificationStore((state) => state.hasPausedSession);
  const restoreSession = useNoteIdentificationStore((state) => state.restoreSession);
  const pauseSession = useNoteIdentificationStore((state) => state.pauseSession);
  const startNewRound = useNoteIdentificationStore((state) => state.startNewRound);

  const [hasInteracted, setHasInteracted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

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

  if (!hasInteracted) {
    return (
      <GameShell
        title="Note Identification"
        onSettingsClick={() => setSettingsOpen(true)}
        onProgressClick={() => setProgressOpen(true)}
        onProfileClick={() => setProfileOpen(true)}
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-text-primary">Note Identification</h2>
            <p className="text-text-secondary max-w-md">
              Hear a note, then select the pitch from multiple choices.
            </p>
          </div>
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-accent text-background font-bold text-lg rounded-xl hover:bg-accent-hover transition-colors"
          >
            Start Practice
          </button>
          <p className="text-text-muted text-sm">Click to load piano samples and begin</p>
        </div>
        <NoteIdentificationSettingsPanel
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onDifficultyChange={setNoteIdentificationDifficulty}
          onSettingChange={setNoteIdentificationSetting}
          onReset={resetNoteIdentificationSettings}
        />
        <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      </GameShell>
    );
  }

  if (isLoading) {
    return (
      <GameShell
        title="Note Identification"
        onSettingsClick={() => setSettingsOpen(true)}
        onProgressClick={() => setProgressOpen(true)}
        onProfileClick={() => setProfileOpen(true)}
      >
        <LoadingScreen message="Loading piano samples..." progress={loadingProgress} />
        <NoteIdentificationSettingsPanel
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onDifficultyChange={setNoteIdentificationDifficulty}
          onSettingChange={setNoteIdentificationSetting}
          onReset={resetNoteIdentificationSettings}
        />
        <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      </GameShell>
    );
  }

  if (error) {
    return (
      <GameShell
        title="Note Identification"
        onSettingsClick={() => setSettingsOpen(true)}
        onProgressClick={() => setProgressOpen(true)}
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
        <NoteIdentificationSettingsPanel
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onDifficultyChange={setNoteIdentificationDifficulty}
          onSettingChange={setNoteIdentificationSetting}
          onReset={resetNoteIdentificationSettings}
        />
        <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      </GameShell>
    );
  }

  // Show resume prompt if there's a paused session
  if (showResumePrompt) {
    return (
      <GameShell
        title="Note Identification"
        onSettingsClick={() => setSettingsOpen(true)}
        onProgressClick={() => setProgressOpen(true)}
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
        <NoteIdentificationSettingsPanel
          isOpen={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onDifficultyChange={setNoteIdentificationDifficulty}
          onSettingChange={setNoteIdentificationSetting}
          onReset={resetNoteIdentificationSettings}
        />
        <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Note Identification"
      onSettingsClick={() => setSettingsOpen(true)}
      onProgressClick={() => setProgressOpen(true)}
      onProfileClick={() => setProfileOpen(true)}
    >
      <NoteIdentificationGame onViewProgress={() => setProgressOpen(true)} />
      <NoteIdentificationSettingsPanel
        isOpen={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onDifficultyChange={setNoteIdentificationDifficulty}
        onSettingChange={setNoteIdentificationSetting}
        onReset={resetNoteIdentificationSettings}
      />
      <ProgressPanel isOpen={progressOpen} onClose={() => setProgressOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </GameShell>
  );
}
