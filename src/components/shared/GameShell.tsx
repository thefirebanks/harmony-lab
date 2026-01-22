/**
 * Game Shell Component
 * Generic container for games with header
 */

'use client';

import { ReactNode } from 'react';

interface GameShellProps {
  title: string;
  children: ReactNode;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
}

export function GameShell({ title, children, onSettingsClick, onHelpClick }: GameShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-text-muted/10 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">{title}</h1>
          
          <div className="flex items-center gap-2">
            {onHelpClick && (
              <button
                onClick={onHelpClick}
                className="p-2 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Help"
                data-testid="help-button"
              >
                ?
              </button>
            )}
            {onSettingsClick && (
              <button
                onClick={onSettingsClick}
                className="p-2 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Settings"
                data-testid="settings-button"
              >
                ⚙
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 w-full">
        {children}
      </main>
    </div>
  );
}
