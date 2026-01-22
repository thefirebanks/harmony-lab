/**
 * Keyboard shortcuts hook
 */

'use client';

import { useEffect } from 'react';
import type { ScaleDegree } from '@/lib/music/types';

interface KeyboardShortcutsOptions {
  enabled: boolean;
  onSelectDegree: (degree: ScaleDegree) => void;
  onSubmit: () => void;
  onNextRound: () => void;
  onHearTonic: () => void;
  onPlayAnswer: () => void;
  onClearLast: () => void;
  showFeedback: boolean;
}

const isEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || target.isContentEditable;
};

export function useKeyboardShortcuts({
  enabled,
  onSelectDegree,
  onSubmit,
  onNextRound,
  onHearTonic,
  onPlayAnswer,
  onClearLast,
  showFeedback,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableElement(event.target)) return;

      if (event.key >= '1' && event.key <= '7') {
        onSelectDegree(Number(event.key) as ScaleDegree);
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'r':
          onHearTonic();
          break;
        case 'p':
          onPlayAnswer();
          break;
        case ' ': {
          event.preventDefault();
          if (showFeedback) {
            onNextRound();
          } else {
            onSubmit();
          }
          break;
        }
        case 'backspace':
          event.preventDefault();
          onClearLast();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    onSelectDegree,
    onSubmit,
    onNextRound,
    onHearTonic,
    onPlayAnswer,
    onClearLast,
    showFeedback,
  ]);
}
