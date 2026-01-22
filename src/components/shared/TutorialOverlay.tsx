/**
 * Tutorial Overlay Component
 * First-run guidance for the Tonic Target game
 */

'use client';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialOverlay({ isOpen, onClose }: TutorialOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="tutorial-overlay">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative max-w-xl w-full mx-4 bg-background border border-text-muted/20 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-text-primary mb-2">How it works</h2>
        <p className="text-text-secondary mb-6">
          Train your ear by building ii-V-I progressions in random keys.
        </p>

        <ol className="space-y-3 text-text-secondary">
          <li className="flex items-start gap-3">
            <span className="text-accent font-bold">1</span>
            <span>Listen to the tonic chord as your reference.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent font-bold">2</span>
            <span>Click three chords in order: ii → V → I.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent font-bold">3</span>
            <span>Submit to hear feedback, then move to a new key.</span>
          </li>
        </ol>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-accent text-background font-semibold"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-text-muted/30 text-text-primary"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
