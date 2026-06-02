import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { subscribeFamilyEvents, getUser, type FamilyEvent } from '@cozy-lantern/shared';

export default function CalendarPage() {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) return;
      const profile = await getUser(db, user.uid);
      if (!profile?.familyId) return;
      return subscribeFamilyEvents(db, profile.familyId, setEvents);
    });
    return unsub;
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const selectedEvents = events.filter(e => isSameDay(new Date(e.startDate), selectedDay));

  return (
    <div className="h-full flex flex-col bg-[#0f0f1a] p-6">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="text-white px-3 py-1 rounded hover:bg-[#1e1e2e]">‹</button>
        <h2 className="text-white text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="text-white px-3 py-1 rounded hover:bg-[#1e1e2e]">›</button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-center text-gray-500 text-xs font-semibold py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {days.map(day => {
          const hasEvent = events.some(e => isSameDay(new Date(e.startDate), day));
          const isSelected = isSameDay(day, selectedDay);
          const isToday = isSameDay(day, new Date());
          const inMonth = isSameMonth(day, currentMonth);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors
                ${isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-[#1e1e2e]'}
                ${!inMonth ? 'text-gray-700' : isToday ? 'text-indigo-400 font-bold' : 'text-gray-200'}`}
            >
              {format(day, 'd')}
              {hasEvent && (
                <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      <div>
        <h3 className="text-white font-semibold mb-3">{format(selectedDay, 'EEEE, MMMM d')}</h3>
        {selectedEvents.length === 0 && <p className="text-gray-600 text-sm">No events</p>}
        {selectedEvents.map(event => (
          <div key={event.id} className="bg-[#1e1e2e] rounded-xl p-4 mb-2 border-l-4 border-indigo-500">
            <p className="text-white font-semibold">{event.title}</p>
            <p className="text-gray-400 text-sm mt-1">
              {event.allDay ? 'All day' : format(new Date(event.startDate), 'h:mm a')}
            </p>
            {event.location && <p className="text-indigo-400 text-sm mt-1">{event.location}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
