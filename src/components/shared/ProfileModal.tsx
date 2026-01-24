/**
 * Profile Modal Component
 * Edit user name and avatar
 */

'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Button, Card } from '@/components/ui';
import { useProfileStore } from '@/stores';
import { deleteProfileImage, getProfileImage, saveProfileImage } from '@/lib/storage/profileImage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_FILE_MB = 2;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const name = useProfileStore((state) => state.name);
  const photoId = useProfileStore((state) => state.photoId);
  const setName = useProfileStore((state) => state.setName);
  const setPhotoId = useProfileStore((state) => state.setPhotoId);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = useMemo(() => getInitials(name), [name]);

  // Animation state
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    let isActive = true;
    setError(null);

    if (!photoId) {
      setPhotoUrl(null);
      return;
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
          setError('Unable to load saved photo.');
        }
      });

    return () => {
      isActive = false;
    };
  }, [photoId, isOpen]);

  if (!shouldRender) return null;

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Please choose an image smaller than ${MAX_FILE_MB}MB.`);
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const newId = await saveProfileImage(dataUrl);
      if (photoId) {
        await deleteProfileImage(photoId);
      }
      setPhotoId(newId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update photo.');
    } finally {
      setIsSaving(false);
      event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async () => {
    if (!photoId) return;
    setIsSaving(true);
    setError(null);

    try {
      await deleteProfileImage(photoId);
      setPhotoId(null);
      setPhotoUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove photo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <button
        type="button"
        aria-label="Close profile"
        className={`
          absolute inset-0 bg-black transition-opacity duration-300 ease-out
          ${isAnimating ? 'opacity-50' : 'opacity-0'}
        `}
        onClick={onClose}
      />

      <div
        className={`
          absolute left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-lg
          -translate-x-1/2 -translate-y-1/2
          transition-all duration-300 ease-out
          ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        <Card className="p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 id="profile-title" className="text-xl font-bold text-text-primary">
              Profile
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-sm uppercase tracking-wide text-text-muted">Name</h3>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Add your name"
                className="w-full px-3 py-2 rounded-lg bg-background border border-text-muted/30 text-text-primary focus:outline-none focus:border-accent"
              />
            </section>

            <section className="space-y-4">
              <h3 className="text-sm uppercase tracking-wide text-text-muted">Photo</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-24 w-24 rounded-full bg-background-elevated border border-text-muted/20 flex items-center justify-center overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-semibold text-text-muted">{initials}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={isSaving}
                  />
                  <Button variant="secondary" size="sm" disabled={isSaving} onClick={handleUploadClick}>
                    {photoId ? 'Replace photo' : 'Upload photo'}
                  </Button>
                  {photoId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      disabled={isSaving}
                    >
                      Remove photo
                    </Button>
                  )}
                  <p className="text-xs text-text-muted">Stored locally in your browser.</p>
                </div>
              </div>
            </section>

            {error && (
              <div className="text-sm text-error bg-error/10 border border-error/20 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
