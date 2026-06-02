import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyStore } from '../../store/familyStore';

export default function InviteMemberModal() {
  const family = useFamilyStore(s => s.family);

  async function handleShare() {
    if (!family) return;
    await Share.share({
      message: `Join my family on CirclSquad! Use invite code: ${family.inviteCode}\n\nDownload the app at circlsquad.app`,
      title: 'Join my CirclSquad family',
    });
  }

  if (!family) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>No family set up yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invite Family Members</Text>
      <Text style={styles.sub}>Share this code with family to let them join your group.</Text>

      <View style={styles.codeBox}>
        <Text style={styles.code}>{family.inviteCode}</Text>
      </View>

      <Text style={styles.hint}>Code is case-insensitive and can be reused.</Text>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-social" size={20} color="#fff" />
        <Text style={styles.shareButtonText}>Share Invite</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 24, alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  sub: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 40, lineHeight: 20 },
  codeBox: {
    backgroundColor: '#1e1e2e', borderRadius: 16, paddingHorizontal: 40, paddingVertical: 32,
    borderWidth: 2, borderColor: '#4f46e5', marginBottom: 16,
  },
  code: { color: '#fff', fontSize: 36, fontWeight: '800', letterSpacing: 8 },
  hint: { color: '#555', fontSize: 12, marginBottom: 40 },
  shareButton: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#4f46e5', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 16,
  },
  shareButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  empty: { color: '#555', fontSize: 14 },
});
