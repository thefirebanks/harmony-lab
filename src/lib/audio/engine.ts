/**
 * Audio Engine
 * Tone.js wrapper for sample loading and playback
 */

import * as Tone from 'tone';

// Module state
let pianoSampler: Tone.Sampler | null = null;
let isLoading = false;
let isLoaded = false;
let loadingProgress = 0;

// Use Tone.js CDN for Salamander piano samples (for development)
// In production, self-host for better performance
const SAMPLE_BASE_URL = 'https://tonejs.github.io/audio/salamander/';

// Reduced sample set for faster loading (every 3rd semitone)
const PIANO_SAMPLES: Record<string, string> = {
  'A0': 'A0.mp3',
  'C1': 'C1.mp3',
  'D#1': 'Ds1.mp3',
  'F#1': 'Fs1.mp3',
  'A1': 'A1.mp3',
  'C2': 'C2.mp3',
  'D#2': 'Ds2.mp3',
  'F#2': 'Fs2.mp3',
  'A2': 'A2.mp3',
  'C3': 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  'A3': 'A3.mp3',
  'C4': 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  'A4': 'A4.mp3',
  'C5': 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  'A5': 'A5.mp3',
  'C6': 'C6.mp3',
  'D#6': 'Ds6.mp3',
  'F#6': 'Fs6.mp3',
  'A6': 'A6.mp3',
  'C7': 'C7.mp3',
  'D#7': 'Ds7.mp3',
  'F#7': 'Fs7.mp3',
  'A7': 'A7.mp3',
  'C8': 'C8.mp3',
};

/**
 * Initialize the audio engine and load piano samples
 * Must be called after a user interaction (browser autoplay policy)
 */
export async function initAudio(): Promise<void> {
  if (isLoaded || isLoading) return;
  
  isLoading = true;
  loadingProgress = 0;
  
  return new Promise((resolve, reject) => {
    pianoSampler = new Tone.Sampler({
      urls: PIANO_SAMPLES,
      release: 1,
      baseUrl: SAMPLE_BASE_URL,
      onload: () => {
        isLoaded = true;
        isLoading = false;
        loadingProgress = 100;
        resolve();
      },
      onerror: (error) => {
        isLoading = false;
        reject(error);
      },
    }).toDestination();
  });
}

/**
 * Get the current loading state
 */
export function getLoadingState(): {
  isLoading: boolean;
  isLoaded: boolean;
  progress: number;
} {
  return { isLoading, isLoaded, progress: loadingProgress };
}

/**
 * Get the piano sampler (for direct access if needed)
 * Returns null if not initialized
 */
export function getSampler(): Tone.Sampler | null {
  return pianoSampler;
}

/**
 * Check if audio is ready for playback
 */
export function isAudioReady(): boolean {
  return isLoaded && pianoSampler !== null;
}

/**
 * Start the Tone.js audio context
 * Must be called from a user interaction handler
 */
export async function startAudioContext(): Promise<void> {
  await Tone.start();
}

/**
 * Get the current Tone.js context state
 */
export function getContextState(): string {
  return Tone.context.state;
}

/**
 * Dispose of the sampler and clean up
 */
export function disposeAudio(): void {
  if (pianoSampler) {
    pianoSampler.dispose();
    pianoSampler = null;
  }
  isLoaded = false;
  isLoading = false;
  loadingProgress = 0;
}
