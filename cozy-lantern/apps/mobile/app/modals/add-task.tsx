import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../firebase';
import { useAuthStore } from '../../store/authStore';
import { useFamilyStore } from '../../store/familyStore';
import { createFamilyTask } from '@circlsquad/shared';

export default function AddTaskModal() {
  const [title, setTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const user = useAuthStore(s => s.user);
  const family = useFamilyStore(s => s.family);
  const members = useFamilyStore(s => s.members);
  const router = useRouter();

  async function handleSave() {
    if (!title.trim() || !user || !family) return;
    setLoading(true);
    setError('');
    try {
      const now = Date.now();
      await createFamilyTask(db, {
        familyId: family.id,
        title: title.trim(),
        assignedTo: selectedAssignee ?? undefined,
        completed: false,
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
      });
      router.back();
    } catch (err: any) {
      setError(err.message ?? 'Could not save task.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Task name"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Assign to</Text>
      <View style={styles.assigneeRow}>
        {[{ userId: null, displayName: 'Anyone' }, ...members].map(m => (
          <TouchableOpacity
            key={m.userId ?? 'anyone'}
            style={[styles.assigneeChip, selectedAssignee === m.userId && styles.assigneeChipSelected]}
            onPress={() => setSelectedAssignee(m.userId)}
          >
            <Text style={[styles.assigneeText, selectedAssignee === m.userId && styles.assigneeTextSelected]}>
              {m.displayName.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Task</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 24 },
  input: { backgroundColor: '#1e1e2e', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, marginBottom: 20 },
  label: { color: '#888', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  assigneeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  assigneeChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#1e1e2e', borderWidth: 1, borderColor: '#333' },
  assigneeChipSelected: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  assigneeText: { color: '#888', fontSize: 14 },
  assigneeTextSelected: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#4f46e5', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#f87171', fontSize: 14, marginBottom: 8 },
});
