import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebase';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { updateUserSettings } from '@cozy-lantern/shared';
import { BATTERY_MODE_CONFIGS } from '@cozy-lantern/shared';

export default function SettingsScreen() {
  const user = useAuthStore(s => s.user);
  const { batteryMode, locationSharing, setBatteryMode, setLocationSharing } = useSettingsStore();
  const router = useRouter();

  const modeConfig = BATTERY_MODE_CONFIGS[batteryMode];

  async function handleSignOut() {
    await signOut(auth);
    router.replace('/(auth)/login');
  }

  async function handleLocationSharingToggle(value: boolean) {
    setLocationSharing(value);
    if (user) {
      await updateUserSettings(db, user.uid, { locationSharing: value });
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile */}
      <View style={styles.section}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.displayName?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <View>
            <Text style={styles.displayName}>{user?.displayName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Share My Location</Text>
            <Text style={styles.rowSub}>Pause all location sharing</Text>
          </View>
          <Switch
            value={locationSharing}
            onValueChange={handleLocationSharingToggle}
            trackColor={{ true: '#4f46e5', false: '#333' }}
          />
        </View>

        <TouchableOpacity style={styles.row} onPress={() => router.push('/modals/battery-settings')}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Location Accuracy</Text>
            <Text style={styles.rowSub}>{modeConfig.label} — {modeConfig.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Family */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family</Text>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/modals/invite-member')}>
          <Text style={styles.rowLabel}>Invite Family Member</Text>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Sign out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color="#f87171" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e1e2e' },
  sectionTitle: { color: '#888', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  displayName: { color: '#fff', fontSize: 17, fontWeight: '600' },
  email: { color: '#888', fontSize: 14, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e1e2e' },
  rowLabel: { color: '#e2e8f0', fontSize: 15 },
  rowSub: { color: '#888', fontSize: 12, marginTop: 2 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  signOutText: { color: '#f87171', fontSize: 15, fontWeight: '600' },
});
