import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../firebase';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { createFamilyEvent } from '@circlsquad/shared';

export default function AddEventModal() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = useAuthStore(s => s.user);
  const family = useFamilyStore(s => s.family);
  const router = useRouter();

  async function handleSave() {
    if (!title.trim() || !user || !family) return;
    setLoading(true);
    setError('');
    try {
      const now = Date.now();
      await createFamilyEvent(db, {
        familyId: family.id,
        title: title.trim(),
        description: undefined,
        startDate: now,
        endDate: now + 3_600_000,
        allDay,
        location: location.trim() || undefined,
        attendees: [user.uid],
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
      });
      router.back();
    } catch (err: any) {
      setError(err.message ?? 'Could not save event.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New Event</Text>
      <TextInput
        style={styles.input}
        placeholder="Event name"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Location (optional)"
        placeholderTextColor="#888"
        value={location}
        onChangeText={setLocation}
      />
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>All Day</Text>
        <Switch value={allDay} onValueChange={setAllDay} trackColor={{ true: '#4f46e5', false: '#333' }} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Event</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 24 },
  input: { backgroundColor: '#1e1e2e', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  toggleLabel: { color: '#e2e8f0', fontSize: 16 },
  button: { backgroundColor: '#4f46e5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#f87171', fontSize: 14, marginBottom: 8 },
});
