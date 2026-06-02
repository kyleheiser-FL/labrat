import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { useFamilyStore } from '../../store/familyStore';
import { db } from '../../firebase';
import { subscribeFamilyEvents, type FamilyEvent } from '@circlsquad/shared';

export default function CalendarScreen() {
  const family = useFamilyStore(s => s.family);
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    if (!family) return;
    return subscribeFamilyEvents(db, family.id, setEvents);
  }, [family?.id]);

  const monthStart = startOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const selectedDayEvents = events.filter(e =>
    isSameDay(new Date(e.startDate), selectedDay)
  );

  return (
    <View style={styles.container}>
      {/* Month header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => setCurrentMonth(m => subMonths(m, 1))}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={() => setCurrentMonth(m => addMonths(m, 1))}>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Day-of-week labels */}
      <View style={styles.weekRow}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <Text key={i} style={styles.weekLabel}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {days.map(day => {
          const hasEvent = events.some(e => isSameDay(new Date(e.startDate), day));
          const isSelected = isSameDay(day, selectedDay);
          const isToday = isSameDay(day, new Date());
          const inMonth = isSameMonth(day, currentMonth);
          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[styles.dayCell, isSelected && styles.selectedDay]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[
                styles.dayText,
                !inMonth && styles.outOfMonth,
                isToday && styles.todayText,
                isSelected && styles.selectedDayText,
              ]}>
                {format(day, 'd')}
              </Text>
              {hasEvent && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected day events */}
      <View style={styles.agendaHeader}>
        <Text style={styles.agendaTitle}>{format(selectedDay, 'EEEE, MMMM d')}</Text>
        <TouchableOpacity onPress={() => router.push('/modals/add-event')}>
          <Ionicons name="add-circle" size={22} color="#4f46e5" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {selectedDayEvents.length === 0 && (
          <Text style={styles.noEvents}>No events</Text>
        )}
        {selectedDayEvents.map(event => (
          <View key={event.id} style={[styles.eventCard, event.color ? { borderLeftColor: event.color } : null]}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventTime}>
              {event.allDay
                ? 'All day'
                : `${format(new Date(event.startDate), 'h:mm a')} – ${format(new Date(event.endDate), 'h:mm a')}`}
            </Text>
            {event.location && (
              <Text style={styles.eventLocation}>{event.location}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  monthTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  weekRow: { flexDirection: 'row', paddingHorizontal: 8 },
  weekLabel: { flex: 1, textAlign: 'center', color: '#555', fontSize: 12, fontWeight: '600', paddingBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  selectedDay: { backgroundColor: '#4f46e5' },
  dayText: { color: '#e2e8f0', fontSize: 14 },
  outOfMonth: { color: '#333' },
  todayText: { color: '#818cf8', fontWeight: '700' },
  selectedDayText: { color: '#fff', fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#4f46e5', marginTop: 2 },
  dotSelected: { backgroundColor: '#fff' },
  agendaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: '#1e1e2e' },
  agendaTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  noEvents: { color: '#555', textAlign: 'center', padding: 24 },
  eventCard: {
    marginHorizontal: 16, marginBottom: 8, backgroundColor: '#1e1e2e',
    borderRadius: 10, padding: 14, borderLeftWidth: 3, borderLeftColor: '#4f46e5',
  },
  eventTitle: { color: '#fff', fontWeight: '600', fontSize: 15 },
  eventTime: { color: '#888', fontSize: 13, marginTop: 4 },
  eventLocation: { color: '#818cf8', fontSize: 12, marginTop: 4 },
});
