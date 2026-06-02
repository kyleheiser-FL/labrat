import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFamilyStore } from '../../store/familyStore';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../firebase';
import {
  subscribeFamilyTasks, subscribeFamilyAnnouncements, completeTask,
  type FamilyTask, type FamilyAnnouncement,
} from '@circlsquad/shared';

export default function FamilyScreen() {
  const family = useFamilyStore(s => s.family);
  const members = useFamilyStore(s => s.members);
  const user = useAuthStore(s => s.user);
  const [tasks, setTasks] = useState<FamilyTask[]>([]);
  const [announcements, setAnnouncements] = useState<FamilyAnnouncement[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!family) return;
    const unsubTasks = subscribeFamilyTasks(db, family.id, setTasks);
    const unsubAnn = subscribeFamilyAnnouncements(db, family.id, setAnnouncements);
    return () => { unsubTasks(); unsubAnn(); };
  }, [family?.id]);

  const pinnedAnnouncements = announcements.filter(a => a.pinned);
  const openTasks = tasks.filter(t => !t.completed);

  return (
    <ScrollView style={styles.container}>
      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pinned</Text>
          {pinnedAnnouncements.map(ann => (
            <View key={ann.id} style={styles.announcementCard}>
              <Ionicons name="megaphone" size={16} color="#f59e0b" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.annTitle}>{ann.title}</Text>
                <Text style={styles.annBody} numberOfLines={2}>{ann.body}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Members */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Family Members</Text>
          <TouchableOpacity onPress={() => router.push('/modals/invite-member')}>
            <Ionicons name="person-add" size={20} color="#4f46e5" />
          </TouchableOpacity>
        </View>
        {members.map(member => (
          <TouchableOpacity
            key={member.userId}
            style={styles.memberRow}
            onPress={() => router.push({ pathname: '/modals/member-detail', params: { userId: member.userId } })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{member.displayName[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>
                {member.displayName}
                {member.userId === user?.uid ? '  (you)' : ''}
              </Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#555" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Tasks */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tasks ({openTasks.length})</Text>
          <TouchableOpacity onPress={() => router.push('/modals/add-task')}>
            <Ionicons name="add-circle" size={22} color="#4f46e5" />
          </TouchableOpacity>
        </View>
        {openTasks.length === 0 && (
          <Text style={styles.empty}>No open tasks</Text>
        )}
        {openTasks.map(task => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskRow}
            onPress={() => user && completeTask(db, task.id, user.uid)}
          >
            <Ionicons name="radio-button-off" size={20} color="#555" />
            <Text style={styles.taskTitle}>{task.title}</Text>
            {task.assignedTo && (
              <Text style={styles.taskAssignee}>
                {members.find(m => m.userId === task.assignedTo)?.displayName.split(' ')[0]}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e1e2e' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  announcementCard: {
    backgroundColor: '#1e1e2e', borderRadius: 10, padding: 12,
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8,
  },
  annTitle: { color: '#fff', fontWeight: '600', fontSize: 14 },
  annBody: { color: '#888', fontSize: 13, marginTop: 2 },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#1e1e2e', gap: 12,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  memberName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  memberRole: { color: '#888', fontSize: 12, textTransform: 'capitalize', marginTop: 2 },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10,
    borderBottomWidth: 1, borderBottomColor: '#1e1e2e',
  },
  taskTitle: { flex: 1, color: '#e2e8f0', fontSize: 15 },
  taskAssignee: {
    color: '#818cf8', fontSize: 12,
    backgroundColor: '#1e1e2e', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  empty: { color: '#555', fontSize: 14, paddingVertical: 8 },
});
