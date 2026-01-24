/**
 * Profile Store
 * User name and profile image reference persisted to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileState {
  name: string;
  photoId: string | null;
  setName: (name: string) => void;
  setPhotoId: (photoId: string | null) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: '',
      photoId: null,
      setName: (name) => set({ name }),
      setPhotoId: (photoId) => set({ photoId }),
      clearProfile: () => set({ name: '', photoId: null }),
    }),
    {
      name: 'harmony-lab-profile',
      partialize: (state) => ({
        name: state.name,
        photoId: state.photoId,
      }),
    }
  )
);
