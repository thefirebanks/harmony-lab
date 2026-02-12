/**
 * Playback Functions
 * High-level functions for playing chords and progressions
 */

import * as Tone from 'tone';
import { getSampler, startAudioContext, isAudioReady } from './engine';
import type { Voicing, Progression, Chord } from '../music/types';
import { 
  getVoicing, 
  getVoicingWithBass, 
  getSimpleVoicingWithBass,
  voicingToNoteStrings 
} from '../music/voicings';

/**
 * Play a single chord
 * @param voicing - The voicing to play
 * @param duration - Duration (Tone.js notation, e.g., '2n' for half note)
 */
export async function playChord(
  voicing: Voicing,
  duration: string = '2n'
): Promise<void> {
  await startAudioContext();

  const sampler = getSampler();
  if (!sampler || !isAudioReady()) {
    console.warn('Audio not ready, cannot play chord');
    return;
  }

  const pitchStrings = voicingToNoteStrings(voicing);

  // Debug logging for A# issue
  if (voicing.chord.root === 'A#' && voicing.chord.quality === 'maj7') {
    console.log('[A# Debug] Chord:', voicing.chord);
    console.log('[A# Debug] Pitch strings:', pitchStrings);
  }

  sampler.triggerAttackRelease(pitchStrings, duration);
}

/**
 * Play a chord from a Chord object (generates voicing automatically)
 * @param chord - The chord to play
 * @param withBass - Whether to include bass note
 * @param duration - Duration in Tone.js notation
 */
export async function playChordSimple(
  chord: Chord,
  withBass: boolean = true,
  duration: string = '2n'
): Promise<void> {
  const voicing = withBass ? getSimpleVoicingWithBass(chord) : getVoicing(chord);
  await playChord(voicing, duration);
}

/**
 * Play a ii-V-I progression with timing
 * @param progression - The progression to play
 * @param tempo - BPM for playback
 * @param withBass - Whether to include bass notes
 */
export async function playProgression(
  progression: Progression,
  tempo: number = 100,
  withBass: boolean = true
): Promise<void> {
  await startAudioContext();
  
  const sampler = getSampler();
  if (!sampler || !isAudioReady()) {
    console.warn('Audio not ready, cannot play progression');
    return;
  }
  
  const now = Tone.now();
  const beatDuration = 60 / tempo;
  
  // Generate voicings
  const getVoicingFn = withBass ? getSimpleVoicingWithBass : getVoicing;
  const iiVoicing = getVoicingFn(progression.ii);
  const VVoicing = getVoicingFn(progression.V);
  const IVoicing = getVoicingFn(progression.I);
  
  // ii chord - beats 1-2
  const iiPitches = voicingToNoteStrings(iiVoicing);
  sampler.triggerAttackRelease(iiPitches, '2n', now);
  
  // V chord - beats 3-4
  const vPitches = voicingToNoteStrings(VVoicing);
  sampler.triggerAttackRelease(vPitches, '2n', now + beatDuration * 2);
  
  // I chord - beats 5-8 (longer for resolution)
  const iPitches = voicingToNoteStrings(IVoicing);
  sampler.triggerAttackRelease(iPitches, '1n', now + beatDuration * 4);
}

/**
 * Play an array of voicings in sequence
 * @param voicings - Array of voicings to play
 * @param tempo - BPM for playback
 * @param beatsPerChord - Number of beats per chord
 */
export async function playVoicingSequence(
  voicings: Voicing[],
  tempo: number = 100,
  beatsPerChord: number = 2
): Promise<void> {
  await startAudioContext();
  
  const sampler = getSampler();
  if (!sampler || !isAudioReady()) {
    console.warn('Audio not ready, cannot play sequence');
    return;
  }
  
  const now = Tone.now();
  const beatDuration = 60 / tempo;
  
  voicings.forEach((voicing, index) => {
    const pitchStrings = voicingToNoteStrings(voicing);
    const startTime = now + (index * beatsPerChord * beatDuration);
    const duration = beatsPerChord === 4 ? '1n' : '2n';
    
    sampler.triggerAttackRelease(pitchStrings, duration, startTime);
  });
}

/**
 * Play a single note
 * @param note - Note string (e.g., "C4", "F#3")
 * @param duration - Duration in Tone.js notation
 */
export async function playNote(
  note: string,
  duration: string = '4n'
): Promise<void> {
  await startAudioContext();
  
  const sampler = getSampler();
  if (!sampler || !isAudioReady()) {
    console.warn('Audio not ready, cannot play note');
    return;
  }
  
  sampler.triggerAttackRelease(note, duration);
}

/**
 * Play multiple notes simultaneously (harmonic)
 * @param notes - Array of note strings (e.g., ["C4", "E4"])
 * @param duration - Duration in Tone.js notation
 */
export async function playNotes(
  notes: string[],
  duration: string = '2n'
): Promise<void> {
  await startAudioContext();

  const sampler = getSampler();
  if (!sampler || !isAudioReady()) {
    console.warn('Audio not ready, cannot play notes');
    return;
  }

  sampler.triggerAttackRelease(notes, duration);
}

/**
 * Stop all currently playing sounds
 */
export function stopAll(): void {
  const sampler = getSampler();
  if (sampler) {
    sampler.releaseAll();
  }
}
