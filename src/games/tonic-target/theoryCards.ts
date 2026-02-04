/**
 * Theory Cards for Tonic Target
 * Educational content displayed contextually with visual guitar diagrams
 */

import type { TheoryCard } from '@/lib/game-engine/types';

export const theoryCards: TheoryCard[] = [
  {
    id: 'shell-voicings-5th',
    title: 'ii-V-I Shell Voicings (Root on 5th String)',
    guitarVoicing: {
      title: 'Shell Voicings in C (Root on A string)',
      chords: [
        {
          name: 'Dm7 (ii)',
          startFret: 5,
          positions: [
            { string: 5, fret: 5, label: 'R' },
            { string: 3, fret: 5, label: '7' },
            { string: 2, fret: 6, label: '3' },
          ],
        },
        {
          name: 'G7 (V)',
          startFret: 3,
          positions: [
            { string: 5, fret: 3, label: 'R' },
            { string: 3, fret: 3, label: '7' },
            { string: 2, fret: 3, label: '3' },
          ],
        },
        {
          name: 'Cmaj7 (I)',
          startFret: 3,
          positions: [
            { string: 5, fret: 3, label: 'R' },
            { string: 3, fret: 4, label: '7' },
            { string: 2, fret: 5, label: '3' },
          ],
        },
      ],
    },
    content: `Move this shape up/down for any key.
The guide tones (3 & 7) swap positions between chords.`,
  },
  {
    id: 'shell-voicings-6th',
    title: 'ii-V-I Shell Voicings (Root on 6th String)',
    guitarVoicing: {
      title: 'Shell Voicings in C (Root on E string)',
      chords: [
        {
          name: 'Dm7 (ii)',
          startFret: 10,
          positions: [
            { string: 6, fret: 10, label: 'R' },
            { string: 4, fret: 10, label: '7' },
            { string: 3, fret: 10, label: '3' },
          ],
        },
        {
          name: 'G7 (V)',
          startFret: 3,
          positions: [
            { string: 6, fret: 3, label: 'R' },
            { string: 4, fret: 3, label: '7' },
            { string: 3, fret: 4, label: '3' },
          ],
        },
        {
          name: 'Cmaj7 (I)',
          startFret: 8,
          positions: [
            { string: 6, fret: 8, label: 'R' },
            { string: 4, fret: 9, label: '7' },
            { string: 3, fret: 9, label: '3' },
          ],
        },
      ],
    },
    content: `Same principle: 3rds and 7ths create the movement.`,
  },
  {
    id: 'voice-leading',
    title: 'The 3-7 Voice Leading Trick',
    content: `The magic of ii-V-I: the 3rd of one chord becomes 
the 7th of the next.

ii chord: 3rd = F
 V chord: 7th = F (same note!)
 V chord: 3rd = B  
 I chord: 7th = B (same note!)

This is why the progression feels so smooth.
Your fingers barely move.`,
  },
  {
    id: 'drop-2',
    title: 'Drop 2 Voicings for Fuller Sound',
    guitarVoicing: {
      title: 'Drop 2 Voicings in C (Root on 4th string)',
      chords: [
        {
          name: 'Dm7 (ii)',
          startFret: 1,
          positions: [
            { string: 4, fret: 3 },
            { string: 3, fret: 2 },
            { string: 2, fret: 1 },
            { string: 1, fret: 1 },
          ],
        },
        {
          name: 'G7 (V)',
          startFret: 3,
          positions: [
            { string: 4, fret: 3 },
            { string: 3, fret: 4 },
            { string: 2, fret: 3 },
            { string: 1, fret: 4 },
          ],
        },
        {
          name: 'Cmaj7 (I)',
          startFret: 1,
          positions: [
            { string: 4, fret: 2 },
            { string: 3, fret: 4 },
            { string: 2, fret: 1 },
            { string: 1, fret: 3 },
          ],
        },
      ],
    },
    content: `Take a close voicing, drop the 2nd-from-top note
down an octave. Instant jazz guitar sound.

Cmaj7 close:    E B C G (top to bottom)
Cmaj7 drop 2:   E B G C`,
  },
  {
    id: 'all-keys-reference',
    title: 'Quick Reference: All 12 ii-V-I\'s',
    content: `Key     ii        V         I
─────────────────────────────────
C       Dm7       G7        Cmaj7
Db      Ebm7      Ab7       Dbmaj7
D       Em7       A7        Dmaj7
Eb      Fm7       Bb7       Ebmaj7
E       F#m7      B7        Emaj7
F       Gm7       C7        Fmaj7
Gb      Abm7      Db7       Gbmaj7
G       Am7       D7        Gmaj7
Ab      Bbm7      Eb7       Abmaj7
A       Bm7       E7        Amaj7
Bb      Cm7       F7        Bbmaj7
B       C#m7      F#7       Bmaj7`,
  },
  {
    id: 'finding-ii',
    title: 'Finding the ii Chord',
    content: `The ii chord is always:
• A minor 7th chord
• Built on the 2nd degree of the scale
• One whole step above the tonic

In C major: C → D (one whole step)
So ii = Dm7

Quick trick: Find the I chord, go up one letter name,
make it minor 7. That's your ii!`,
  },
  {
    id: 'finding-v',
    title: 'Finding the V Chord',
    content: `The V chord is always:
• A dominant 7th chord (major with b7)
• Built on the 5th degree of the scale
• A perfect 5th above the tonic

In C major: C → G (count up 5 letters)
So V = G7

Quick trick: The V chord root is the same as
the 5th of the I chord!`,
  },
];

/**
 * Get a random theory card
 */
export function getRandomTheoryCard(): TheoryCard {
  const index = Math.floor(Math.random() * theoryCards.length);
  return theoryCards[index];
}


