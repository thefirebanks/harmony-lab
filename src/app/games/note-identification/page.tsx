/**
 * Note Identification Game Page
 */

'use client';

import { useState } from 'react';
import { GameShell, ProgressPanel, ProfileModal, LoadingScreen } from '@/components/shared';
import { NoteIdentificationGame, NoteIdentificationSettingsPanel } from '@/components/games/note-identification';
import { useAudioStore, useSettingsStore } from '@/stores';

export default function NoteIdentificationPage() {
  const { isLoaded, isLoading, loadAudio, error, loadingProgress } = useAudioStore();
  const settings = useSettingsStore((state) => state.noteIdentification);
  const setNoteIdentificationSetting = useSettingsStore((state) => state.setNoteIdentificationSetting);
  const setNoteIdentificationDifficulty = useSettingsStore((state) => state.setNoteIdentificationDifficulty);
  const resetNoteIdentificationSettings = useSettingsStore((state) => state.resetNoteIdentificationSettings);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleStart = async () => {
    setHasInteracted(true);
    await loadAudio();
  };

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
