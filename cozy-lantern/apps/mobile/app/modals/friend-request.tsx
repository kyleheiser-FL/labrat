import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuthStore } from '../../store/authStore';
import { sendFriendRequest } from '@circlsquad/shared';

export default function FriendRequestModal() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const user = useAuthStore(s => s.user);

  async function handleSend() {
    if (!email.trim() || !user) return;
    setLoading(true);
    setError('');
    try {
      // Look up user by email
      const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError('No user found with that email address.');
        return;
      }
      const targetUid = snap.docs[0].id;
      if (targetUid === user.uid) {
        setError("You can't add yourself.");
        return;
      }
      await sendFriendRequest(db, user.uid, targetUid);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? 'Could not send request.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={styles.container}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.title}>Request Sent!</Text>
        <Text style={styles.sub}>{email} will see your request in their Friends tab.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Friend</Text>
      <Text style={styles.sub}>Enter their email address to send a friend request.</Text>
      <TextInput
        style={styles.input}
        placeholder="friend@example.com"
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSend} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Request</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 24, justifyContent: 'center' },
  successIcon: { fontSize: 48, textAlign: 'center', color: '#10b981', marginBottom: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  sub: { color: '#888', fontSize: 14, marginBottom: 32, lineHeight: 20 },
  input: { backgroundColor: '#1e1e2e', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, marginBottom: 12 },
  button: { backgroundColor: '#4f46e5', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#f87171', fontSize: 14, marginBottom: 8 },
});
