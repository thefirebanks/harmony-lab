/**
 * Theory Cards for Tonic Target
 * Educational content displayed contextually
 */

import type { TheoryCard } from '@/lib/game-engine/types';

export const theoryCards: TheoryCard[] = [
  {
    id: 'shell-voicings-5th',
    title: 'ii-V-I Shell Voicings (Root on 5th String)',
    content: `Position: Root on A string

ii (Dm7)         V (G7)          I (Cmaj7)
x-5-x-5-6-x      x-10-x-10-10-x   x-3-x-4-5-x
  R   7 3          R    7  3        R   7 3

Move this shape up/down for any key.
The guide tones (3 & 7) swap positions between chords.`,
  },
  {
    id: 'shell-voicings-6th',
    title: 'ii-V-I Shell Voicings (Root on 6th String)',
    content: `Position: Root on E string

ii (Dm7)         V (G7)          I (Cmaj7)
x-x-10-10-9-10   3-x-3-4-3-x     8-x-9-9-8-x
     R  7 3 5    R   7 3 5       R   7 3 5

Same principle: 3rds and 7ths create the movement.`,
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
    content: `Take a close voicing, drop the 2nd-from-top note 
down an octave. Instant jazz guitar sound.

Cmaj7 close:    E B C G (top to bottom)
Cmaj7 drop 2:   E B G C

ii-V-I in C (Drop 2, root on 4th string):

Dm7: x-x-3-2-1-1
G7:  x-x-3-4-3-4  
Cmaj7: x-x-2-4-1-3`,
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

/**
 * Get a theory card by ID
 */
export function getTheoryCardById(id: string): TheoryCard | undefined {
  return theoryCards.find(card => card.id === id);
}

/**
 * Get all theory cards
 */
export function getAllTheoryCards(): TheoryCard[] {
  return theoryCards;
}
