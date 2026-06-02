import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Battery from 'expo-battery';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { BATTERY_MODE_CONFIGS } from '@cozy-lantern/shared';
import { LOCATION_TASK_NAME } from '../tasks/locationTask';

export function useLocationTracking() {
  const user = useAuthStore(s => s.user);
  const batteryMode = useSettingsStore(s => s.batteryMode);
  const locationSharing = useSettingsStore(s => s.locationSharing);
  const prevModeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      stopTracking();
      return;
    }
    if (!locationSharing || batteryMode === 'off') {
      stopTracking();
      return;
    }
    // Restart tracking whenever mode changes
    if (prevModeRef.current !== batteryMode) {
      prevModeRef.current = batteryMode;
      startTracking(batteryMode);
    }
  }, [user, batteryMode, locationSharing]);

  // Poll battery level every 60s and write to Firestore
  useEffect(() => {
    if (!user || !locationSharing || batteryMode === 'off') return;
    const interval = setInterval(async () => {
      try {
        const level = await Battery.getBatteryLevelAsync();
        await updateDoc(doc(db, 'locations', user.uid), {
          batteryLevel: Math.round(level * 100),
          updatedAt: Date.now(),
        });
      } catch {
        // Non-critical
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [user, locationSharing, batteryMode]);
}

async function startTracking(mode: string) {
  const config = BATTERY_MODE_CONFIGS[mode as keyof typeof BATTERY_MODE_CONFIGS];
  if (!config) return;

  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== 'granted') return;

  const { status: bg } = await Location.requestBackgroundPermissionsAsync();
  if (bg !== 'granted') return;

  const isRunning = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (isRunning) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: config.accuracy,
    timeInterval: config.timeInterval,
    distanceInterval: config.distanceInterval,
    showsBackgroundLocationIndicator: true,
    activityType: Location.ActivityType.Other,
    pausesUpdatesAutomatically: false,
    foregroundService: {
      notificationTitle: 'CozyLantern',
      notificationBody: 'Sharing location with your family',
      notificationColor: '#4f46e5',
    },
  });
}

async function stopTracking() {
  const isRunning = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (isRunning) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
}
