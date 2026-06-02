import { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { useLocationStore } from '../../store/locationStore';
import { useFamilyStore } from '../../store/familyStore';
import { useAuthStore } from '../../store/authStore';
import { classifyMovement } from '@cozy-lantern/shared';

export default function MapScreen() {
  const memberLocations = useLocationStore(s => s.memberLocations);
  const members = useFamilyStore(s => s.members);
  const currentUser = useAuthStore(s => s.user);
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const memberMap = Object.fromEntries(members.map(m => [m.userId, m]));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={false}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {Object.values(memberLocations).map(loc => {
          const member = memberMap[loc.userId];
          if (!member) return null;
          const movement = classifyMovement(loc.speed);
          return (
            <Marker
              key={loc.userId}
              coordinate={{ latitude: loc.lat, longitude: loc.lng }}
              onPress={() => router.push({
                pathname: '/modals/member-detail',
                params: { userId: loc.userId },
              })}
            >
              <View style={styles.markerContainer}>
                <View style={[
                  styles.markerDot,
                  movement === 'driving' && styles.markerDriving,
                  movement === 'walking' && styles.markerWalking,
                  loc.userId === currentUser?.uid && styles.markerSelf,
                ]}>
                  <Text style={styles.markerInitial}>
                    {member.displayName?.[0]?.toUpperCase() ?? '?'}
                  </Text>
                </View>
                <Text style={styles.markerName}>{member.displayName.split(' ')[0]}</Text>
                <Text style={styles.markerTime}>
                  {formatDistanceToNow(loc.timestamp, { addSuffix: true })}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Battery mode quick-access FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modals/battery-settings')}
      >
        <Ionicons name="battery-half" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Invite family button if alone */}
      {members.length <= 1 && (
        <View style={styles.inviteBanner}>
          <Text style={styles.inviteText}>Invite family members to see them on the map</Text>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={() => router.push('/modals/invite-member')}
          >
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  markerContainer: { alignItems: 'center' },
  markerDot: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#4f46e5',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
  markerDriving: { backgroundColor: '#059669' },
  markerWalking: { backgroundColor: '#d97706' },
  markerSelf: { backgroundColor: '#7c3aed' },
  markerInitial: { color: '#fff', fontWeight: '700', fontSize: 16 },
  markerName: {
    color: '#fff', fontSize: 11, fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 4, paddingVertical: 1,
    borderRadius: 4, marginTop: 2,
  },
  markerTime: {
    color: '#ccc', fontSize: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 4, paddingVertical: 1,
    borderRadius: 4, marginTop: 1,
  },
  fab: {
    position: 'absolute', right: 20, bottom: 100,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
  },
  inviteBanner: {
    position: 'absolute', bottom: 100, left: 20, right: 80,
    backgroundColor: 'rgba(15,15,26,0.9)', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  inviteText: { flex: 1, color: '#ccc', fontSize: 13 },
  inviteButton: {
    backgroundColor: '#4f46e5', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  inviteButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
