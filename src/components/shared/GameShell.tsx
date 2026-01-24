/**
 * Game Shell Component
 * Generic container for games with header
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useProfileStore } from '@/stores';
import { getProfileImage } from '@/lib/storage/profileImage';
import Link from 'next/link';

interface GameShellProps {
  title: string;
  children: ReactNode;
  onSettingsClick?: () => void;
  onProgressClick?: () => void;
  onHelpClick?: () => void;
  onProfileClick?: () => void;
}

export function GameShell({
  title,
  children,
  onSettingsClick,
  onProgressClick,
  onHelpClick,
  onProfileClick,
}: GameShellProps) {
  const profileName = useProfileStore((state) => state.name);
  const photoId = useProfileStore((state) => state.photoId);
  const firstName = profileName.trim().split(/\s+/)[0];
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!photoId) {
      setPhotoUrl(null);
      return undefined;
    }

    getProfileImage(photoId)
      .then((url) => {
        if (isActive) {
          setPhotoUrl(url);
        }
      })
      .catch(() => {
        if (isActive) {
          setPhotoUrl(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [photoId]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-text-muted/10 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onProgressClick && (
              <button
                onClick={onProgressClick}
                className="p-2 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Progress"
                data-testid="progress-button"
                title="View Progress"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </button>
            )}
            <Link href="/" className="text-xl font-bold text-text-primary hover:text-text-primary/80 transition-colors">
              {title}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {onProfileClick && (
              <button
                onClick={onProfileClick}
                className="flex items-center gap-2 p-2 rounded-full text-text-muted hover:text-text-primary hover:bg-background-elevated transition-colors"
                aria-label="Profile"
                data-testid="profile-button"
                title="Profile"
              >
                <span className="h-7 w-7 rounded-full bg-background-elevated border border-text-muted/20 flex items-center justify-center overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 12a4 4 0 100-8 4 4 0 000 8zm7 8a7 7 0 10-14 0"
                      />
                    </svg>
                  )}
                </span>
                {firstName && <span className="text-sm text-text-secondary">Hi {firstName}</span>}
              </button>
            )}
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
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
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
