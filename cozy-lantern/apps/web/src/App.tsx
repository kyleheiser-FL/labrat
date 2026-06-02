import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { APIProvider } from '@vis.gl/react-google-maps';
import { auth } from './firebase';
import MapPage from './pages/MapPage';
import CalendarPage from './pages/CalendarPage';
import TasksPage from './pages/TasksPage';
import FamilyPage from './pages/FamilyPage';
import LoginPage from './pages/LoginPage';

type Tab = 'map' | 'calendar' | 'tasks' | 'family';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [tab, setTab] = useState<Tab>('map');

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  if (!authReady) return null;
  if (!user) return <LoginPage />;

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''}>
      <div className="flex h-screen bg-[#0f0f1a]">
        {/* Sidebar */}
        <nav className="w-16 flex flex-col items-center py-6 gap-4 bg-[#1e1e2e] border-r border-[#2e2e3e]">
          {(['map', 'calendar', 'tasks', 'family'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors
                ${tab === t ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white hover:bg-[#2e2e3e]'}`}
              title={t.charAt(0).toUpperCase() + t.slice(1)}
            >
              {t === 'map' ? '🗺' : t === 'calendar' ? '📅' : t === 'tasks' ? '✓' : '👨‍👩‍👧'}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {tab === 'map' && <MapPage />}
          {tab === 'calendar' && <CalendarPage />}
          {tab === 'tasks' && <TasksPage />}
          {tab === 'family' && <FamilyPage />}
        </main>
      </div>
    </APIProvider>
  );
}
