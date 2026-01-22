/**
 * Tonic Target Practice Game Page
 */

'use client';

import { useEffect, useState } from 'react';
import { GameShell, SettingsPanel, TutorialOverlay } from '@/components/shared';
import { TonicTargetGame } from '@/components/games/tonic-target';
import { LoadingScreen } from '@/components/shared';
import { useAudioStore, useSettingsStore } from '@/stores';

export default function TonicTargetPage() {
  const { isLoaded, isLoading, loadAudio, error, loadingProgress } = useAudioStore();
  const settings = useSettingsStore((state) => state.tonicTarget);
  const setTonicTargetSetting = useSettingsStore((state) => state.setTonicTargetSetting);
  const setDifficulty = useSettingsStore((state) => state.setDifficulty);
  const resetTonicTargetSettings = useSettingsStore((state) => state.resetTonicTargetSettings);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);

  // Start loading audio after user interaction
  const handleStart = async () => {
    setHasInteracted(true);
    await loadAudio();
  };

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
        onHelpClick={() => setShowTutorial(true)}
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
        onHelpClick={() => setShowTutorial(true)}
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
        onHelpClick={() => setShowTutorial(true)}
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
        <TutorialOverlay isOpen={showTutorial} onClose={handleCloseTutorial} />
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Tonic Target Practice"
      onSettingsClick={() => setSettingsOpen(true)}
      onHelpClick={() => setShowTutorial(true)}
    >
      <TonicTargetGame />
      <SettingsPanel
        isOpen={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onDifficultyChange={setDifficulty}
        onSettingChange={setTonicTargetSetting}
        onReset={resetTonicTargetSettings}
      />
      <TutorialOverlay isOpen={showTutorial} onClose={handleCloseTutorial} />
    </GameShell>
  );
}
