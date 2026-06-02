import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@circlsquad/shared';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  profile: null,
  initialized: false,
  setUser: user => set({ user }),
  setProfile: profile => set({ profile }),
  setInitialized: () => set({ initialized: true }),
}));
