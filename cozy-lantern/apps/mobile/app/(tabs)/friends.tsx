import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase';
import { useAuthStore } from '../../store/authStore';
import {
  subscribeFriendConnections, updateFriendStatus, toggleFriendLocationSharing,
  removeFriend, type FriendConnection,
} from '@circlsquad/shared';

export default function FriendsScreen() {
  const user = useAuthStore(s => s.user);
  const [connections, setConnections] = useState<FriendConnection[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    return subscribeFriendConnections(db, user.uid, setConnections);
  }, [user?.uid]);

  const pending = connections.filter(c => c.status === 'pending' && c.initiatedBy !== user?.uid);
  const accepted = connections.filter(c => c.status === 'accepted');

  const friendName = (conn: FriendConnection) => {
    const otherId = conn.userIds.find(id => id !== user?.uid);
    return otherId ?? 'Unknown';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/modals/friend-request')}
      >
        <Ionicons name="person-add" size={18} color="#fff" />
        <Text style={styles.addButtonText}>Add Friend</Text>
      </TouchableOpacity>

      {pending.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friend Requests</Text>
          {pending.map(conn => (
            <View key={conn.id} style={styles.requestRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>?</Text>
              </View>
              <Text style={styles.friendName}>{friendName(conn)}</Text>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => updateFriendStatus(db, conn.id, 'accepted')}
              >
                <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() => updateFriendStatus(db, conn.id, 'blocked')}
              >
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friends</Text>
        {accepted.length === 0 && (
          <Text style={styles.empty}>No friends yet. Add someone to share locations!</Text>
        )}
        {accepted.map(conn => (
          <View key={conn.id} style={styles.friendRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{friendName(conn)[0]?.toUpperCase() ?? '?'}</Text>
            </View>
            <Text style={styles.friendName}>{friendName(conn)}</Text>
            <View style={styles.shareToggle}>
              <Text style={styles.shareLabel}>Share location</Text>
              <Switch
                value={conn.locationSharingEnabled}
                onValueChange={v => toggleFriendLocationSharing(db, conn.id, v)}
                trackColor={{ true: '#4f46e5', false: '#333' }}
              />
            </View>
            <TouchableOpacity onPress={() => removeFriend(db, conn.id)}>
              <Ionicons name="trash-outline" size={18} color="#f87171" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  addButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#4f46e5', borderRadius: 12, padding: 14,
    justifyContent: 'center', marginBottom: 20,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  requestRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1e1e2e', borderRadius: 10, padding: 12, marginBottom: 8,
  },
  friendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1e1e2e', borderRadius: 10, padding: 12, marginBottom: 8,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  friendName: { flex: 1, color: '#e2e8f0', fontSize: 15, fontWeight: '500' },
  shareToggle: { alignItems: 'center' },
  shareLabel: { color: '#888', fontSize: 11, marginBottom: 2 },
  acceptBtn: { backgroundColor: '#059669', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  acceptBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  declineBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#555' },
  declineBtnText: { color: '#888', fontSize: 13 },
  empty: { color: '#555', fontSize: 14 },
});
