/**
 * Audio Store
 * Manages audio engine state
 */

import { create } from 'zustand';
import { initAudio, getLoadingState, isAudioReady } from '@/lib/audio';

interface AudioState {
  // State
  isLoading: boolean;
  isLoaded: boolean;
  loadingProgress: number;
  error: string | null;
  
  // Actions
  loadAudio: () => Promise<void>;
  checkStatus: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  // Initial state
  isLoading: false,
  isLoaded: false,
  loadingProgress: 0,
  error: null,
  
  // Actions
  loadAudio: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await initAudio();
      set({ 
        isLoading: false, 
        isLoaded: true, 
        loadingProgress: 100 
      });
    } catch (err) {
      set({ 
        isLoading: false, 
        error: err instanceof Error ? err.message : 'Failed to load audio'
      });
    }
  },
  
  checkStatus: () => {
    const state = getLoadingState();
    set({
      isLoading: state.isLoading,
      isLoaded: state.isLoaded,
      loadingProgress: state.progress,
    });
  },
}));
