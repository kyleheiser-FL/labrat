import { create } from 'zustand';
import type { Family, FamilyMember } from '@cozy-lantern/shared';

interface FamilyState {
  family: Family | null;
  members: FamilyMember[];
  setFamily: (family: Family | null) => void;
  setMembers: (members: FamilyMember[]) => void;
}

export const useFamilyStore = create<FamilyState>(set => ({
  family: null,
  members: [],
  setFamily: family => set({ family }),
  setMembers: members => set({ members }),
}));
