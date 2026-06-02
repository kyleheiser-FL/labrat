import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase';
import { useFamilyStore } from '../../store/familyStore';
import { useLocationStore } from '../../store/locationStore';
import {
  getLocationHistory, classifyMovement,
  type LocationHistoryPoint,
} from '@circlsquad/shared';

const PLAYBACK_SPEEDS = [1, 2, 4, 8];
const TICK_MS = 100; // update marker every 100ms of real time

export default function MemberDetailModal() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const members = useFamilyStore(s => s.members);
  const liveLocation = useLocationStore(s => s.memberLocations[userId ?? '']);
  const member = members.find(m => m.userId === userId);

  const [historyDate, setHistoryDate] = useState(new Date());
  const [history, setHistory] = useState<LocationHistoryPoint[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadHistory(historyDate);
  }, [historyDate, userId]);

  useEffect(() => {
    if (isPlaying) {
      tickRef.current = setInterval(() => {
        setPlaybackIndex(i => {
          if (i >= history.length - 1) {
            setIsPlaying(false);
            return history.length - 1;
          }
          return i + 1;
        });
      }, TICK_MS / PLAYBACK_SPEEDS[speedIndex]);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [isPlaying, speedIndex, history.length]);

  async function loadHistory(date: Date) {
    if (!userId) return;
    setLoadingHistory(true);
    setIsPlaying(false);
    setPlaybackIndex(0);
    try {
      const points = await getLocationHistory(
        db, userId,
        startOfDay(date).getTime(),
        endOfDay(date).getTime(),
      );
      setHistory(points);
    } finally {
      setLoadingHistory(false);
    }
  }

  const playbackPoint = history[playbackIndex];
  const polylineColors = history.map(p => {
    const m = classifyMovement(p.speed);
    return m === 'driving' ? '#059669' : m === 'walking' ? '#d97706' : '#6b7280';
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{member?.displayName[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <View>
          <Text style={styles.name}>{member?.displayName}</Text>
          {liveLocation && (
            <Text style={styles.address} numberOfLines={1}>
              {liveLocation.address ?? `${liveLocation.lat.toFixed(4)}, ${liveLocation.lng.toFixed(4)}`}
            </Text>
          )}
          {liveLocation && (
            <Text style={styles.battery}>🔋 {liveLocation.batteryLevel}%</Text>
          )}
        </View>
      </View>

      {/* Date picker arrows */}
      <View style={styles.datePicker}>
        <TouchableOpacity onPress={() => setHistoryDate(d => subDays(d, 1))}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.dateText}>{format(historyDate, 'EEEE, MMM d')}</Text>
        <TouchableOpacity
          onPress={() => setHistoryDate(d => {
            const next = new Date(d);
            next.setDate(next.getDate() + 1);
            return next > new Date() ? d : next;
          })}
        >
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {loadingHistory && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#4f46e5" />
          </View>
        )}
        {(liveLocation || history.length > 0) && (
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
            region={{
              latitude: playbackPoint?.lat ?? liveLocation?.lat ?? 37.78825,
              longitude: playbackPoint?.lng ?? liveLocation?.lng ?? -122.4324,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {/* Path polyline — draw segments colored by movement type */}
            {history.length > 1 && history.slice(0, playbackIndex + 1).map((point, i) => {
              if (i === 0) return null;
              const prev = history[i - 1];
              const movement = classifyMovement(point.speed);
              const color = movement === 'driving' ? '#059669'
                : movement === 'walking' ? '#d97706'
                : '#6b7280';
              return (
                <Polyline
                  key={i}
                  coordinates={[
                    { latitude: prev.lat, longitude: prev.lng },
                    { latitude: point.lat, longitude: point.lng },
                  ]}
                  strokeColor={color}
                  strokeWidth={3}
                />
              );
            })}

            {/* Playback or live marker */}
            {(playbackPoint || liveLocation) && (
              <Marker
                coordinate={{
                  latitude: playbackPoint?.lat ?? liveLocation!.lat,
                  longitude: playbackPoint?.lng ?? liveLocation!.lng,
                }}
              >
                <View style={styles.markerDot}>
                  <Text style={styles.markerInitial}>{member?.displayName[0]?.toUpperCase()}</Text>
                </View>
              </Marker>
            )}
          </MapView>
        )}
        {history.length === 0 && !loadingHistory && (
          <View style={styles.noHistory}>
            <Text style={styles.noHistoryText}>No location history for this day</Text>
          </View>
        )}
      </View>

      {/* Playback controls */}
      {history.length > 1 && (
        <View style={styles.playbackControls}>
          <TouchableOpacity
            onPress={() => { setPlaybackIndex(0); setIsPlaying(false); }}
          >
            <Ionicons name="play-skip-back" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playPauseBtn}
            onPress={() => setIsPlaying(p => !p)}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSpeedIndex(i => (i + 1) % PLAYBACK_SPEEDS.length)}
          >
            <Text style={styles.speedText}>{PLAYBACK_SPEEDS[speedIndex]}×</Text>
          </TouchableOpacity>

          <View style={styles.scrubberContainer}>
            {/* Simple progress bar — tappable for scrubbing */}
            <View style={styles.scrubberTrack}>
              <View
                style={[
                  styles.scrubberFill,
                  { width: `${history.length > 1 ? (playbackIndex / (history.length - 1)) * 100 : 0}%` },
                ]}
              />
            </View>
            {playbackPoint && (
              <Text style={styles.playbackTime}>
                {format(new Date(playbackPoint.timestamp), 'h:mm a')}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#059669' }]} /><Text style={styles.legendLabel}>Driving</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#d97706' }]} /><Text style={styles.legendLabel}>Walking</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#6b7280' }]} /><Text style={styles.legendLabel}>Stationary</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  name: { color: '#fff', fontSize: 17, fontWeight: '700' },
  address: { color: '#888', fontSize: 13, marginTop: 2, maxWidth: 260 },
  battery: { color: '#888', fontSize: 12, marginTop: 2 },
  datePicker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: '#1e1e2e',
  },
  dateText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  mapContainer: { flex: 1, position: 'relative' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,15,26,0.7)',
    justifyContent: 'center', alignItems: 'center', zIndex: 10,
  },
  noHistory: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noHistoryText: { color: '#555', fontSize: 14 },
  markerDot: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#4f46e5',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff',
  },
  markerInitial: { color: '#fff', fontWeight: '700', fontSize: 14 },
  playbackControls: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#1e1e2e',
  },
  playPauseBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center',
  },
  speedText: { color: '#818cf8', fontSize: 15, fontWeight: '700', width: 32, textAlign: 'center' },
  scrubberContainer: { flex: 1 },
  scrubberTrack: { height: 4, backgroundColor: '#333', borderRadius: 2 },
  scrubberFill: { height: 4, backgroundColor: '#4f46e5', borderRadius: 2 },
  playbackTime: { color: '#888', fontSize: 11, marginTop: 4 },
  legend: { flexDirection: 'row', gap: 16, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#0f0f1a' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: '#888', fontSize: 12 },
});
