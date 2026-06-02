import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { auth, db } from '../firebase';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { getUser } from '@cozy-lantern/shared';

export default function RootLayout() {
  const { setUser, setProfile, setInitialized, initialized } = useAuthStore();
  const loadFromStorage = useSettingsStore(s => s.loadFromStorage);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      setUser(user);
      if (user) {
        const profile = await getUser(db, user.uid);
        setProfile(profile);
      } else {
        setProfile(null);
      }
      setInitialized();
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const inAuth = segments[0] === '(auth)';
    const user = useAuthStore.getState().user;
    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)/map');
    }
  }, [initialized, segments]);

  if (!initialized) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modals/member-detail" options={{ presentation: 'modal', title: 'Member' }} />
        <Stack.Screen name="modals/add-event" options={{ presentation: 'modal', title: 'New Event' }} />
        <Stack.Screen name="modals/add-task" options={{ presentation: 'modal', title: 'New Task' }} />
        <Stack.Screen name="modals/invite-member" options={{ presentation: 'modal', title: 'Invite Family' }} />
        <Stack.Screen name="modals/friend-request" options={{ presentation: 'modal', title: 'Add Friend' }} />
        <Stack.Screen name="modals/battery-settings" options={{ presentation: 'modal', title: 'Location Accuracy' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
