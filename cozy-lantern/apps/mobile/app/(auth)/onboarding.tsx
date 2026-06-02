import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { doc as firestoreDoc } from 'firebase/firestore';
import { nanoid } from 'expo-crypto';
import { auth, db } from '../../firebase';
import { createFamily, getFamilyByInviteCode, joinFamily, updateUserFamilyId } from '@cozy-lantern/shared';
import { useAuthStore } from '../../store/authStore';

export default function OnboardingScreen() {
  const [mode, setMode] = useState<'pick' | 'create' | 'join'>('pick');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  async function handleCreate() {
    if (!familyName.trim() || !user) return;
    setLoading(true);
    setError('');
    try {
      const familyId = Math.random().toString(36).slice(2, 18);
      await createFamily(db, familyId, familyName.trim(), user.uid, user.displayName ?? 'You', user.photoURL ?? undefined);
      await updateUserFamilyId(db, user.uid, familyId);
      router.replace('/(tabs)/map');
    } catch (err: any) {
      setError(err.message ?? 'Could not create family.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!inviteCode.trim() || !user) return;
    setLoading(true);
    setError('');
    try {
      const family = await getFamilyByInviteCode(db, inviteCode.trim());
      if (!family) {
        setError('Invite code not found. Please check and try again.');
        setLoading(false);
        return;
      }
      await joinFamily(db, family.id, {
        userId: user.uid,
        displayName: user.displayName ?? 'Member',
        photoURL: user.photoURL ?? undefined,
        role: 'member',
        joinedAt: Date.now(),
      });
      await updateUserFamilyId(db, user.uid, family.id);
      router.replace('/(tabs)/map');
    } catch (err: any) {
      setError(err.message ?? 'Could not join family.');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'pick') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to CozyLantern</Text>
        <Text style={styles.sub}>Set up your family group to get started.</Text>
        <TouchableOpacity style={styles.button} onPress={() => setMode('create')}>
          <Text style={styles.buttonText}>Create a Family</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => setMode('join')}>
          <Text style={[styles.buttonText, styles.secondaryText]}>Join with Invite Code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mode === 'create') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Name Your Family</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. The Smiths"
          placeholderTextColor="#888"
          value={familyName}
          onChangeText={setFamilyName}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Family</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode('pick')}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Invite Code</Text>
      <TextInput
        style={styles.input}
        placeholder="6-character code"
        placeholderTextColor="#888"
        autoCapitalize="characters"
        maxLength={6}
        value={inviteCode}
        onChangeText={setInviteCode}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleJoin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Join Family</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMode('pick')}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 12 },
  sub: { color: '#888', fontSize: 15, marginBottom: 36 },
  input: {
    backgroundColor: '#1e1e2e', borderRadius: 12, padding: 16,
    color: '#fff', fontSize: 16, marginBottom: 16,
  },
  button: {
    backgroundColor: '#4f46e5', borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 12,
  },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#4f46e5' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryText: { color: '#818cf8' },
  error: { color: '#f87171', fontSize: 14, marginBottom: 8 },
  back: { color: '#818cf8', textAlign: 'center', marginTop: 12, fontSize: 15 },
});
