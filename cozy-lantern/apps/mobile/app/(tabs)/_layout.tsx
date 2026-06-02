import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocationTracking } from '../../hooks/useLocationTracking';
import { useFamilyLocations } from '../../hooks/useFamilyLocations';

export default function TabsLayout() {
  // Start background tracking for the whole tab session
  useLocationTracking();
  useFamilyLocations();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#0f0f1a', borderTopColor: '#1e1e2e' },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#555',
        headerStyle: { backgroundColor: '#0f0f1a' },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: 'Family',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-add" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
