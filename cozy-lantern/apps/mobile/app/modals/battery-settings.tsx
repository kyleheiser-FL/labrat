import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { BATTERY_MODE_CONFIGS, updateUserSettings, type BatteryMode } from '@cozy-lantern/shared';
import { db } from '../../firebase';

const MODE_ICONS: Record<BatteryMode, keyof typeof Ionicons.glyphMap> = {
  high: 'battery-full',
  balanced: 'battery-half',
  saver: 'battery-low',
  off: 'battery-dead',
};

const MODE_COLORS: Record<BatteryMode, string> = {
  high: '#ef4444',
  balanced: '#f59e0b',
  saver: '#10b981',
  off: '#6b7280',
};

export default function BatterySettingsModal() {
  const { batteryMode, setBatteryMode } = useSettingsStore();
  const user = useAuthStore(s => s.user);
  const router = useRouter();

  async function selectMode(mode: BatteryMode) {
    await setBatteryMode(mode);
    if (user) {
      await updateUserSettings(db, user.uid, { batteryMode: mode });
    }
    router.back();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Location Accuracy</Text>
      <Text style={styles.subtitle}>
        Higher accuracy keeps your family better informed but uses more battery.
      </Text>

      {(Object.keys(BATTERY_MODE_CONFIGS) as BatteryMode[]).map(mode => {
        const config = BATTERY_MODE_CONFIGS[mode];
        const isSelected = batteryMode === mode;
        return (
          <TouchableOpacity
            key={mode}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => selectMode(mode)}
          >
            <Ionicons
              name={MODE_ICONS[mode]}
              size={28}
              color={isSelected ? '#fff' : MODE_COLORS[mode]}
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                {config.label}
              </Text>
              <Text style={[styles.cardDesc, isSelected && styles.cardDescSelected]}>
                {config.description}
              </Text>
              {mode !== 'off' && (
                <Text style={styles.cardMeta}>
                  Updates every {config.timeInterval >= 60_000
                    ? `${config.timeInterval / 60_000} min`
                    : `${config.timeInterval / 1_000}s`} or {config.distanceInterval}m
                </Text>
              )}
            </View>
            {isSelected && <Ionicons name="checkmark-circle" size={22} color="#fff" />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 24, lineHeight: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e1e2e', borderRadius: 14, padding: 18,
    marginBottom: 12, borderWidth: 2, borderColor: 'transparent',
  },
  cardSelected: { backgroundColor: '#4f46e5', borderColor: '#6366f1' },
  cardTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: '700' },
  cardTitleSelected: { color: '#fff' },
  cardDesc: { color: '#888', fontSize: 13, marginTop: 4, lineHeight: 18 },
  cardDescSelected: { color: 'rgba(255,255,255,0.8)' },
  cardMeta: { color: '#555', fontSize: 12, marginTop: 6 },
});
