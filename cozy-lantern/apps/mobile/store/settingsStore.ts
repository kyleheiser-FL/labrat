import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BatteryMode } from '@circlsquad/shared';

const STORAGE_KEY = 'circlsquad:batteryMode';

interface SettingsState {
  batteryMode: BatteryMode;
  locationSharing: boolean;
  setBatteryMode: (mode: BatteryMode) => Promise<void>;
  setLocationSharing: (enabled: boolean) => void;
  loadFromStorage: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>(set => ({
  batteryMode: 'balanced',
  locationSharing: true,

  setBatteryMode: async (mode: BatteryMode) => {
    set({ batteryMode: mode });
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  },

  setLocationSharing: (enabled: boolean) => set({ locationSharing: enabled }),

  loadFromStorage: async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY) as BatteryMode | null;
    if (stored) set({ batteryMode: stored });
  },
}));
