import { create } from 'zustand';
import type { LiveLocation } from '@cozy-lantern/shared';

interface LocationState {
  memberLocations: Record<string, LiveLocation>;
  setMemberLocation: (uid: string, loc: LiveLocation) => void;
  removeMemberLocation: (uid: string) => void;
  clearLocations: () => void;
}

export const useLocationStore = create<LocationState>(set => ({
  memberLocations: {},

  setMemberLocation: (uid, loc) =>
    set(state => ({
      memberLocations: { ...state.memberLocations, [uid]: loc },
    })),

  removeMemberLocation: uid =>
    set(state => {
      const next = { ...state.memberLocations };
      delete next[uid];
      return { memberLocations: next };
    }),

  clearLocations: () => set({ memberLocations: {} }),
}));
