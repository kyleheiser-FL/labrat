import { useState, useEffect } from 'react';
import { 
  Beaker, 
  Syringe, 
  HelpCircle, 
  BookOpen, 
  CalendarDays, 
  FlaskConical, 
  Github, 
  Heart, 
  Layers, 
  PlayCircle, 
  LogIn, 
  ChevronRight, 
  Activity, 
  Share2, 
  Compass, 
  Cpu, 
  Settings,
  Bell,
  BellRing,
  LogOut,
  Trash2,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Loader2,
  Download,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Compound, DoseLog, DailyMetric, LibraryItem, AppNotification } from './types';
import CycleDashboard from './components/CycleDashboard';
import CyclePlanner from './components/CyclePlanner';
import ReconstitutionCalculator from './components/ReconstitutionCalculator';
import PeptideLibrary from './components/PeptideLibrary';

// Firebase Setup
import { auth, signInWithPopup, googleProvider } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  fetchUserCompounds, 
  saveUserCompound, 
  deleteUserCompound,
  fetchUserLogs,
  saveUserLog,
  deleteUserLog,
  fetchUserMetrics,
  saveUserMetric,
  fetchUserNotifications,
  saveUserNotification,
  deleteUserNotification,
  uploadLocalDataToCloud
} from './lib/db';

// Initial dummy/placeholder compounds for immediate visual playground exploration
const SEED_COMPOUNDS: Compound[] = [
  {
    id: 'seed-bpc-157',
    name: 'BPC-157 (Tendon Recovery)',
    type: 'peptide',
    vialSizeMg: 5,
    bacWaterMl: 2,
    doseAmount: 250,
    doseUnit: 'mcg',
    frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    durationWeeks: 8,
    color: '#06b6d4',
    notes: 'Primary healing peptide for high structural tendon repair. Morning dosage injection systemically.',
    isCompleted: false
  },
  {
    id: 'seed-ghk-cu',
    name: 'GHK-Cu (Skin Vitality)',
    type: 'peptide',
    vialSizeMg: 50,
    bacWaterMl: 2,
    doseAmount: 2.5,
    doseUnit: 'mg',
    frequency: 'twice_weekly',
    startDate: new Date().toISOString().split('T')[0],
    durationWeeks: 6,
    color: '#10b981',
    notes: 'Copper peptide formulation to promote deep cellular vitality and hair growth multipliers.',
    isCompleted: false
  }
];

let hasShownSyncReadyMessage = false;

const TRANSIENT_NOTIF_TITLES = [
  'Cloud Sync Configured',
  'Cloud Sync Session Ready',
  'Sync Interruption',
  'Installation Success',
  'Alert Feed Cleared',
  'Database Reset Complete'
];

const filterTransientNotifs = (notifs: AppNotification[]): AppNotification[] => {
  return (notifs || []).filter(n => !TRANSIENT_NOTIF_TITLES.includes(n.title));
};

const timeoutPromise = <T,>(promise: Promise<T>, ms: number, message = 'Operation timed out'): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'calculator' | 'library'>('dashboard');

  // Core authenticated user from Firebase
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Core offline/online synchronised database states
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);

  // Notifications states
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);

  // Transport transport item from Library tab directly to Planner form
  const [activeFromLibrary, setActiveFromLibrary] = useState<LibraryItem | null>(null);

  // Legal Liability disclaimers modal overlay state
  const [showLegalModal, setShowLegalModal] = useState(false);

  // PWA Setup & Home-Screen Install Prompt registers
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      triggerNotification(
        'Installation Success',
        'LabRat Helix is now integrated on your active device home screen.',
        'success',
        false
      );
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  // Trigger custom animated toaster notifications & persistent alerts helper
  const triggerNotification = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'reminder',
    persist: boolean = true
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      type,
      isRead: false
    };

    if (persist) {
      setNotifications(prev => {
        const updated = [newNotif, ...prev];
        if (!auth.currentUser) {
          localStorage.setItem('labrat_notifications', JSON.stringify(updated));
        } else {
          saveUserNotification(auth.currentUser.uid, newNotif).catch(e => console.error('Cloud notification log failed', e));
        }
        return updated;
      });
    }

    // Spark animated screen toast alert
    setActiveToasts(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== newNotif.id));
    }, 4500);
  };

  // Google Provider Auth Trigger Actions
  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Failed to authenticate Google user:', err);
      setAuthLoading(false);
      triggerNotification(
        'Authentication Blocked',
        'Unable to complete sign in. Please verify popup blockers are deactivated.',
        'warning'
      );
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setNotificationsOpen(false);
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  // Synchronise User session registers & Cloud Data listeners
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(true);

      if (currentUser) {
        try {
          // Pull cloud backups from Firestore securely with a 4.5 second safety timeout limit
          const [cCompounds, cLogs, cMetrics, cNotifs] = await timeoutPromise(
            Promise.all([
              fetchUserCompounds(currentUser.uid),
              fetchUserLogs(currentUser.uid),
              fetchUserMetrics(currentUser.uid),
              fetchUserNotifications(currentUser.uid)
            ]),
            4500,
            'Cloud sync timed out'
          );

          // Detect offline local storage caches
          const localCompounds = localStorage.getItem('labrat_compounds');
          const localLogs = localStorage.getItem('labrat_logs');
          const localMetrics = localStorage.getItem('labrat_metrics');
          const localNotifications = localStorage.getItem('labrat_notifications');

          const pLocals = localCompounds ? JSON.parse(localCompounds) : [];
          const pLogs = localLogs ? JSON.parse(localLogs) : [];
          const pMetrics = localMetrics ? JSON.parse(localMetrics) : [];
          const pNotifs = localNotifications ? JSON.parse(localNotifications) : [];

          // Seamless transition check: If user cloud records are 100% empty, upload current offline data to avoid data loss!
          const hasOfflineRecords = pLocals.length > 0 && !(pLocals.length === SEED_COMPOUNDS.length && pLocals[0]?.id === SEED_COMPOUNDS[0]?.id);
          
          let finalCompounds = cCompounds;
          let finalLogs = cLogs;
          let finalMetrics = cMetrics;
          let finalNotifs = cNotifs;

          if (cCompounds.length === 0 && hasOfflineRecords) {
            await uploadLocalDataToCloud(currentUser.uid, pLocals, pLogs, pMetrics, pNotifs);
            finalCompounds = pLocals;
            finalLogs = pLogs;
            finalMetrics = pMetrics;
            finalNotifs = pNotifs;

            setTimeout(() => {
              triggerNotification(
                'Cloud Sync Configured',
                'Successfully initialised Google cloud database backups for your active records.',
                'success',
                false
              );
            }, 1000);
          } else {
            if (!hasShownSyncReadyMessage) {
              hasShownSyncReadyMessage = true;
              setTimeout(() => {
                triggerNotification(
                  'Cloud Sync Session Ready',
                  `Synchronised profile registers for ${currentUser.email}.`,
                  'info',
                  false
                );
              }, 800);
            }
          }

          setCompounds(finalCompounds);
          setLogs(finalLogs);
          setMetrics(finalMetrics);
          setNotifications(filterTransientNotifs(finalNotifs).sort((a,b) => b.timestamp.localeCompare(a.timestamp)));
        } catch (err) {
          console.error('Error fetching user registers during sync:', err);
          triggerNotification('Sync Interruption', 'Failed fetching cloud records. Cache fallback activated.', 'warning', false);
          
          // Robust client-side LocalStorage fallback under slow network/timeouts
          const storedCompounds = localStorage.getItem('labrat_compounds');
          const storedLogs = localStorage.getItem('labrat_logs');
          const storedMetrics = localStorage.getItem('labrat_metrics');
          const storedNotifications = localStorage.getItem('labrat_notifications');

          if (storedCompounds) {
            setCompounds(JSON.parse(storedCompounds));
          } else {
            setCompounds(SEED_COMPOUNDS);
            localStorage.setItem('labrat_compounds', JSON.stringify(SEED_COMPOUNDS));
          }

          setLogs(storedLogs ? JSON.parse(storedLogs) : []);
          setMetrics(storedMetrics ? JSON.parse(storedMetrics) : []);
          setNotifications(filterTransientNotifs(storedNotifications ? JSON.parse(storedNotifications) : []));
        }
      } else {
        hasShownSyncReadyMessage = false;
        // Fallback to strict client-side LocalStorage
        const storedCompounds = localStorage.getItem('labrat_compounds');
        const storedLogs = localStorage.getItem('labrat_logs');
        const storedMetrics = localStorage.getItem('labrat_metrics');
        const storedNotifications = localStorage.getItem('labrat_notifications');

        if (storedCompounds) {
          setCompounds(JSON.parse(storedCompounds));
        } else {
          setCompounds(SEED_COMPOUNDS);
          localStorage.setItem('labrat_compounds', JSON.stringify(SEED_COMPOUNDS));
        }

        setLogs(storedLogs ? JSON.parse(storedLogs) : []);
        setMetrics(storedMetrics ? JSON.parse(storedMetrics) : []);
        setNotifications(filterTransientNotifs(storedNotifications ? JSON.parse(storedNotifications) : []));
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle syncing state changes based on current auth layer helper
  const handleAddCompound = (comp: Compound) => {
    const updated = [...compounds, comp];
    setCompounds(updated);
    if (user) {
      saveUserCompound(user.uid, comp).catch(e => console.error(e));
    } else {
      localStorage.setItem('labrat_compounds', JSON.stringify(updated));
    }
    triggerNotification('Compound Scheduled', `Scheduled target parameters for ${comp.name}.`, 'success');
  };

  const handleUpdateCompound = (updatedComp: Compound) => {
    const updatedList = compounds.map(c => c.id === updatedComp.id ? updatedComp : c);
    setCompounds(updatedList);
    if (user) {
      saveUserCompound(user.uid, updatedComp).catch(e => console.error(e));
    } else {
      localStorage.setItem('labrat_compounds', JSON.stringify(updatedList));
    }
    triggerNotification('Schedule Parameter Adjustment', `Modified dosing schedule parameters for ${updatedComp.name}.`, 'info');
  };

  const handleDeleteCompound = (id: string) => {
    const targetComp = compounds.find(c => c.id === id);
    if (confirm(`Confirm termination of ${targetComp?.name || 'compound'} from schedules? Logs will be archived.`)) {
      const updated = compounds.filter(c => c.id !== id);
      setCompounds(updated);
      if (user) {
        deleteUserCompound(user.uid, id).catch(e => console.error(e));
      } else {
        localStorage.setItem('labrat_compounds', JSON.stringify(updated));
      }
      triggerNotification('Compound Terminated', `${targetComp?.name || 'Substance'} removed from active schedule queues.`, 'warning');
    }
  };

  const handleLogDose = (newLog: DoseLog) => {
    const updated = [...logs, newLog];
    setLogs(updated);
    if (user) {
      saveUserLog(user.uid, newLog).catch(e => console.error(e));
    } else {
      localStorage.setItem('labrat_logs', JSON.stringify(updated));
    }
    triggerNotification('Dose Administered', `Successfully logged administration of ${newLog.doseAmount} ${newLog.doseUnit} ${newLog.compoundName}.`, 'success');
  };

  const handleUndoDose = (logId: string) => {
    const targetLog = logs.find(l => l.id === logId);
    const updated = logs.filter(l => l.id !== logId);
    setLogs(updated);
    if (user) {
      deleteUserLog(user.uid, logId).catch(e => console.error(e));
    } else {
      localStorage.setItem('labrat_logs', JSON.stringify(updated));
    }
    triggerNotification('Administration Revoked', `Undo triggered for dose logs of ${targetLog?.compoundName}.`, 'info');
  };

  const handleAddOrUpdateMetrics = (newMetric: DailyMetric) => {
    const exists = metrics.some(m => m.date === newMetric.date);
    let updated;
    if (exists) {
      updated = metrics.map(m => m.date === newMetric.date ? newMetric : m);
    } else {
      updated = [...metrics, newMetric];
    }
    setMetrics(updated);
    if (user) {
      saveUserMetric(user.uid, newMetric).catch(e => console.error(e));
    } else {
      localStorage.setItem('labrat_metrics', JSON.stringify(updated));
    }
    triggerNotification('Biometrics Captured', `Secured weight and wellbeing indicators for ${newMetric.date}.`, 'success');
  };

  const handleImportDatabase = (importJson: string) => {
    try {
      const parsed = JSON.parse(importJson);
      setCompounds(parsed);
      if (user) {
        parsed.forEach((c: Compound) => {
          saveUserCompound(user.uid, c).catch(e => console.error(e));
        });
      } else {
        localStorage.setItem('labrat_compounds', JSON.stringify(parsed));
      }
      triggerNotification('Database Import Success', 'Restored compound parameters successfully.', 'success');
      return true;
    } catch {
      triggerNotification('Import Failed', 'Invalid chemical structure or string parsing fault.', 'warning');
      return false;
    }
  };

  const handleResetAllData = () => {
    if (confirm('CRITICAL DATABASE RESET: Wiping current profile cycle timelines? This cannot be undone.')) {
      setCompounds([]);
      setLogs([]);
      setMetrics([]);
      setNotifications([]);
      
      if (user) {
        compounds.forEach(c => deleteUserCompound(user.uid, c.id).catch(e => console.error(e)));
        logs.forEach(l => deleteUserLog(user.uid, l.id).catch(e => console.error(e)));
        notifications.forEach(n => deleteUserNotification(user.uid, n.id).catch(e => console.error(e)));
      } else {
        localStorage.removeItem('labrat_compounds');
        localStorage.removeItem('labrat_logs');
        localStorage.removeItem('labrat_metrics');
        localStorage.removeItem('labrat_notifications');
      }
      triggerNotification('Database Reset Complete', 'All active rosters and biometrics wiped clean.', 'warning', false);
    }
  };

  // Notification action controls
  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, isRead: true };
        if (user) {
          saveUserNotification(user.uid, updated).catch(e => console.error(e));
        } else {
          const allUpdated = prev.map(item => item.id === id ? updated : item);
          localStorage.setItem('labrat_notifications', JSON.stringify(allUpdated));
        }
        return updated;
      }
      return n;
    }));
  };

  const handleClearAllNotifications = () => {
    if (user) {
      notifications.forEach(n => {
        deleteUserNotification(user.uid, n.id).catch(e => console.error(e));
      });
    } else {
      localStorage.removeItem('labrat_notifications');
    }
    setNotifications([]);
    triggerNotification('Alert Feed Cleared', 'In-app notification records disengaged successfully.', 'info', false);
  };

  // Callback to carry a peptide item over from library to the planner
  const handleAddLibraryItemToCycle = (item: LibraryItem) => {
    setActiveFromLibrary(item);
    setActiveTab('planner');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/35 selection:text-cyan-200" id="labrat-app-shell">
      {/* Outer Glow Cyber Ambient Background Highlights */}
      <div className="fixed top-[-100px] left-1/4 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Floating Animated Toast Toaster Container */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-2.5 max-w-[340px] pointer-events-none" id="toasters-wrapper">
        <AnimatePresence>
          {activeToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="pointer-events-auto bg-slate-900/95 border border-slate-800 rounded-xl p-3.5 shadow-2xl flex items-start gap-3 backdrop-blur-md"
            >
              <div className="mt-0.5">
                {toast.type === 'success' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></div>}
                {toast.type === 'warning' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]"></div>}
                {toast.type === 'info' && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.7)]"></div>}
                {toast.type === 'reminder' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]"></div>}
              </div>
              <div className="flex-1">
                <h6 className="text-xs font-bold text-slate-100 font-sans tracking-tight">{toast.title}</h6>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Primary Navigation Top Header */}
      <header className="sticky top-0 bg-[#030712]/80 backdrop-blur-md border-b border-[#1e293b]/70 py-4 px-6 shrink-0 z-40" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-cyan-950/45 border border-cyan-500/35 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.15)] flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-cyan-400 rotate-12 transition-transform hover:rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent font-sans uppercase">LabRat</span>
                <span className="bg-[#1e293b]/80 border border-slate-700/60 text-slate-400 text-[9px] font-mono px-1.5 py-0.5 rounded-md">V2.5 HELIX</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-medium uppercase font-mono mt-0.5">Cycle Architecture For The Enhanced</p>
            </div>
          </div>

          {/* User Sign-In Action Bar and Notification Icon */}
          <div className="flex items-center gap-4 flex-wrap" id="header-indicators-bar">
            
            {/* Install PWA Button (Hidden if already standalone) */}
            {!isStandalone && (
              <button
                onClick={handleInstallApp}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-indigo-500/5 hover:from-cyan-500/20 hover:to-indigo-500/15 text-cyan-400 hover:text-cyan-300 border border-cyan-500/25 hover:border-cyan-500/40 rounded-xl transition-all cursor-pointer text-[11px] font-bold font-mono tracking-wide shadow-[0_0_12px_rgba(6,182,212,0.06)]"
                id="pwa-install-header-btn"
                title="Install LabRat application"
              >
                <Download className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}
            
            {/* Notification Bell Badge Trigger button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                  notificationsOpen 
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' 
                    : 'bg-[#0f172a]/60 border-[#1e293b]/50 text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]/50'
                }`}
                aria-label="Notification center"
                id="bell-notification-trigger"
              >
                {unreadCount > 0 ? (
                  <BellRing className="w-4 h-4 text-cyan-400 animate-pulse" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-bold flex items-center justify-center font-mono ring-4 ring-[#030712]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    {/* Responsive Backdrop on Mobile Viewports to dismiss the tray naturally */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-[#020617]/70 backdrop-blur-xs z-40 md:hidden"
                      onClick={() => setNotificationsOpen(false)}
                      id="notifications-mobile-backdrop"
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="fixed md:absolute inset-x-4 md:inset-x-auto top-24 md:top-full md:mt-3 md:right-0 md:left-auto mx-auto md:mx-0 w-auto md:w-80 max-w-[350px] bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] md:shadow-2xl overflow-hidden z-50 text-slate-100"
                      id="notification-hub-panel"
                    >
                      <div className="p-3.5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center gap-3">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">System Notification Feed</span>
                        <div className="flex items-center gap-2">
                          {notifications.length > 0 && (
                            <button 
                              onClick={handleClearAllNotifications}
                              className="text-[10px] text-red-400 hover:text-red-300 transition flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Clear all
                            </button>
                          )}
                          <button
                            onClick={() => setNotificationsOpen(false)}
                            className="md:hidden text-slate-500 hover:text-slate-300 p-1.5 hover:bg-slate-800/60 rounded-lg transition cursor-pointer"
                            aria-label="Close notification center"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[280px] sm:max-h-[300px] overflow-y-auto divide-y divide-slate-800/80 custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="py-12 px-4 text-center">
                            <Bell className="w-7 h-7 text-slate-600 mx-auto mb-2 opacity-50" />
                            <p className="text-xs text-slate-500">No recent notifications</p>
                            <span className="text-[9px] font-mono text-slate-600 tracking-normal leading-normal mt-1 block px-2">Warnings related to active schedules will be displayed here dynamically.</span>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => {
                                handleMarkNotificationRead(notif.id);
                              }}
                              className={`p-3.5 text-left transition-colors duration-200 cursor-pointer hover:bg-slate-800/30 relative ${
                                !notif.isRead ? 'bg-[#06b6d4]/5 border-l-2 border-cyan-500' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start gap-1">
                                <span className="text-[11px] font-bold text-slate-200 leading-normal">{notif.title}</span>
                                <span className="text-[8px] font-mono text-slate-500 mt-0.5 select-none shrink-0">
                                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-normal mt-1 pr-6">{notif.message}</p>
                              {!notif.isRead && (
                                <span className="absolute bottom-3 right-3 text-[8.5px] font-semibold text-cyan-400 flex items-center gap-0.5 opacity-60 hover:opacity-100 transition">
                                  <Check className="w-3 h-3" /> Mark read
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Google Authentication Component Widget */}
            {authLoading ? (
              <div className="flex items-center gap-2 bg-[#0f172a]/60 border border-[#1e293b]/50 py-1.5 px-3 rounded-xl text-xs text-slate-400 font-mono">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Loading Secure Keys...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2.5 bg-[#0f172a]/70 border border-[#1e293b]/80 p-1.5 pl-2.5 rounded-xl text-xs font-mono">
                {/* User Avatar Circle or LabRat logo badge */}
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-cyan-500/25 bg-cyan-950/45 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="User Profile" 
                      className="w-full h-full object-cover select-none"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <FlaskConical className="w-3.5 h-3.5 text-cyan-400 rotate-12" />
                  )}
                </div>

                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-none font-bold">LabRat Sync</span>
                  <span className="text-cyan-400 font-bold max-w-[125px] truncate mt-0.5 text-xs font-sans tracking-tight" title={user.email || ''}>
                    {user.displayName || user.email?.split('@')[0] || 'Active Agent'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 bg-[#1e293b] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/30 px-2.5 py-1 rounded-lg text-[10px] transition font-bold cursor-pointer"
                  id="google-sign-out"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-extrabold px-3 py-2 rounded-xl text-xs transition duration-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] flex-nowrap"
                id="google-sign-in"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>Google Login</span>
              </button>
            )}

            {/* Quick Status indicators */}
            <div className="hidden lg:flex items-center gap-2 bg-[#0f172a]/60 border border-[#1e293b]/50 py-2 px-3 rounded-xl text-xs font-mono">
              <div className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-cyan-500 shadow-[0_0_6px_rgba(34,211,238,0.7)] animate-pulse' : 'bg-amber-500'}`}></div>
              <span className="text-slate-400">Database Status: </span>
              <span className={user ? 'text-cyan-400 font-bold' : 'text-amber-400'}>
                {user ? 'Google Cloud Sync Active' : 'Offline Cache Sandbox'}
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* Main Responsive Layout Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 z-10 flex flex-col gap-6 overflow-hidden">
        
        {/* Navigation Tab selection Rail Bar */}
        <nav className="bg-[#0f172a]/70 border border-[#1e293b]/80 p-1.5 rounded-2xl flex flex-wrap gap-1.5 w-fit" id="navigation-tabs-rail">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/55'
            }`}
            id="tab-btn-dashboard"
          >
            <CalendarDays className="w-4 h-4" /> Daily Checklist
          </button>
          
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/55'
            }`}
            id="tab-btn-planner"
          >
            <Layers className="w-4 h-4" /> Cycle Architect
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/55'
            }`}
            id="tab-btn-calculator"
          >
            <Syringe className="w-4 h-4" /> Dosage Formulation
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/55'
            }`}
            id="tab-btn-library"
          >
            <BookOpen className="w-4 h-4" /> Compound Encyclopedia
          </button>
        </nav>

        {/* Dynamic Display workspace rendering */}
        <div className="flex-1 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <CycleDashboard
                  compounds={compounds}
                  logs={logs}
                  metrics={metrics}
                  onLogDose={handleLogDose}
                  onUndoDose={handleUndoDose}
                  onSaveMetrics={handleAddOrUpdateMetrics}
                />
              )}

              {activeTab === 'planner' && (
                <CyclePlanner
                  compounds={compounds}
                  onAddCompound={handleAddCompound}
                  onUpdateCompound={handleUpdateCompound}
                  onDeleteCompound={handleDeleteCompound}
                  onImportData={handleImportDatabase}
                  onResetData={handleResetAllData}
                  activeFromLibrary={activeFromLibrary}
                  clearActiveFromLibrary={() => setActiveFromLibrary(null)}
                />
              )}

              {activeTab === 'calculator' && (
                <ReconstitutionCalculator />
              )}

              {activeTab === 'library' && (
                <PeptideLibrary
                  onAddToCycle={handleAddLibraryItemToCycle}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Standard Human footer elements with persistent legal warning */}
      <footer className="py-6 px-6 border-t border-[#1e293b]/60 bg-[#030712] text-xs text-slate-500 shrink-0 z-10" id="site-footer">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="flex flex-col gap-1.5 text-center lg:text-left">
            <span className="font-semibold text-slate-400">&copy; {new Date().getFullYear()} LabRat. Persistent biochemical cycle management registers.</span>
            <p className="text-[10px] text-slate-500 max-w-3xl leading-relaxed">
              <strong>Liability Disclaimer:</strong> LabRat is strictly an educational system and laboratory calculator designed for mathematical tracking and raw historical research notation. It contains absolutely zero advice, prescriptions, or clinical diagnostic materials for consuming or compounding substances.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <button
              onClick={() => setShowLegalModal(true)}
              className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/25 hover:border-rose-500/40 rounded-xl transition-all cursor-pointer text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(244,63,94,0.05)]"
              id="footer-disclaimer-btn"
            >
              <span>⚠️ Legal Disclaimer & Indemnity</span>
            </button>
            <span className="flex items-center gap-1.5 text-slate-600 text-[11px] font-mono">
              <Compass className="w-3.5 h-3.5 text-slate-600" /> Inspired by LabRat standard formats
            </span>
          </div>
        </div>
      </footer>

      {/* Robust Legal Disclaimer & Hold-Harmless Indemnification Agreement Modal */}
      <AnimatePresence>
        {showLegalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-6 z-50 overflow-y-auto"
            id="legal-disclaimer-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#0f172a] border border-rose-500/25 rounded-2xl p-5 sm:p-7 w-full max-w-2xl shadow-2xl relative space-y-5 my-6 leading-relaxed text-slate-200"
              id="legal-disclaimer-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Title Accent */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-[#1e293b] text-rose-400">
                <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.15)] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest font-mono text-rose-400">
                    Liability Disclaimer & Indemnity Agreement
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium uppercase font-mono mt-0.5">
                    LABRAT USER TERMS • IN-FORCE SCIENTIFIC PROTECTION
                  </p>
                </div>
              </div>

              {/* Legal Text Panel */}
              <div className="bg-[#030712]/60 border border-slate-800 rounded-xl p-4 text-[11px] sm:text-xs text-slate-300 font-mono space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar" id="legal-agreement-scrollbar-panel">
                <div className="space-y-1">
                  <span className="text-rose-400 font-bold tracking-wider block">SECTION 1: NO PROVISION OF MEDICAL ADVICE</span>
                  <p className="leading-normal">
                    The software, compiled libraries, and calculator values generated by the LabRat platform are developed entirely for educational, historical tracking, and informational laboratory research purposes. They do not constitute the practice of medicine, nursing, clinical pharmacy, or the professional dispensing of medical services or substances. No physician-patient relationship is established here.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-rose-400 font-bold tracking-wider block">SECTION 2: ABSOLUTE INDEMNIFICATION & THE "HOLD HARMLESS" COVENANT</span>
                  <p className="leading-normal">
                    By launching and continuing usage of LabRat registers, you unconditionally, irrevocably agree to defend, indemnify, and hold harmless the developers, programmers, publishers, webmasters, hosting agencies, and any parent organizations of LabRat from any and all liability, damages, litigation costs, medical fees, physiological damage, acute hospital visits, permanent cardiovascular or metabolic damage, criminal charges, domestic legal proceedings, or fatalities resulting from any action you take using this program.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-rose-400 font-bold tracking-wider block">SECTION 3: INHERENT EXPERIMENTAL NATURE & RISKS</span>
                  <p className="leading-normal">
                    You explicitly acknowledge that biological research, peptide compounding, research chemicals, and endocrine management are associated with severe medical complications, biological contamination, immunological shock, infection, sepsis, and structural toxicity. All formulations, injection volumes, reconstitutions, and protocols logged are recorded at your own peril and absolute personal risk.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-rose-400 font-bold tracking-wider block">SECTION 4: SCIENTIFIC ENCYCLOPEDIA & ACCURACY WARRANTY DISMISSAL</span>
                  <p className="leading-normal">
                    The built-in compound profiles and peptide catalogs are crowdsourced compilements of theoretical textbook literature. No guarantee is made regarding the accuracy, viability, or legality of any specific compound. Under no circumstances does this resource warrant that external chemical suppliers pack sterile, safe, or unadulterated substances.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-rose-400 font-bold tracking-wider block">SECTION 5: LEGALITY, LOCAL COMPLIANCE, & BAN REGISTERS</span>
                  <p className="leading-normal">
                    Certain compounds represented herein (including SARMs, anabolic hormones, or fat-loss peptides) may be designated as Prescription-Only, prohibited for import, or strictly banned under international sports frameworks (such as WADA/USADA). Compliance with regional, state, and Olympic laws remains entirely the burden of the end-user.
                  </p>
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#1e293b]">
                <p className="text-[10.5px] text-slate-400 text-center sm:text-left">
                  Leaving this screen indicates full compliance and execution of these terms.
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowLegalModal(false)}
                    className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer"
                    id="legal-modal-agree-btn"
                  >
                    I Agree & Hold Harmless
                  </button>
                  <button
                    onClick={() => setShowLegalModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                    id="legal-modal-close-btn"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progressive Web App (PWA) Install Guide Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
            id="pwa-install-overlay"
            onClick={() => setShowInstallModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#0f172a] border border-cyan-500/20 rounded-2xl p-5 sm:p-7 w-full max-w-md shadow-2xl relative space-y-5 my-6 leading-relaxed text-slate-200 font-mono"
              id="pwa-install-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Title Accent */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-[#1e293b] text-cyan-400">
                <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest font-mono text-cyan-400">
                    Install LabRat Helix
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium uppercase font-mono mt-0.5">
                    Progressive Web App • Instant Setup
                  </p>
                </div>
              </div>

              {/* Informational Guidelines list */}
              <div className="space-y-4 text-xs text-slate-300">
                <p className="leading-relaxed text-[11px] text-slate-400">
                  Install this offline-synchronized web register directly to your device home screen to access it fullscreen, completely independent of external browser overlays.
                </p>

                <div className="bg-[#030712]/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
                  <span className="text-cyan-400 font-bold text-[10px] tracking-wider block uppercase">Device Specific Instructions</span>
                  
                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <div className="flex flex-col gap-1">
                      <span className="text-cyan-500 font-bold font-sans">Apple iOS (Safari):</span>
                      <p className="text-slate-300">
                        1. Tap the <span className="text-cyan-400 font-bold underline">Share</span> button in Safari's bottom toolbar.<br />
                        2. Scroll down and touch <strong className="text-slate-100 font-sans">"Add to Home Screen"</strong>.<br />
                        3. Customize the app name & confirm install.
                      </p>
                    </div>
                    <hr className="border-slate-800/60" />
                    <div className="flex flex-col gap-1">
                      <span className="text-cyan-500 font-bold font-sans">Android (Chrome):</span>
                      <p className="text-slate-300">
                        1. Tap Browser Menu <strong className="text-slate-100">(three vertical dots)</strong>.<br />
                        2. Select <strong className="text-slate-100 font-sans">"Install App"</strong> or <strong className="text-slate-100 font-sans">"Add to Home screen"</strong>.
                      </p>
                    </div>
                    <hr className="border-slate-800/60" />
                    <div className="flex flex-col gap-1">
                      <span className="text-cyan-500 font-bold font-sans">Desktop (Chrome/Edge):</span>
                      <p className="text-slate-300">
                        1. Click the <strong className="text-cyan-400 font-sans">Install icon</strong> inside the browser's URL address bar, or click Menu and select <strong className="text-slate-100 font-sans">"Install LabRat"</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e293b]">
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)] w-full text-center font-sans tracking-wide"
                  id="pwa-install-close-btn"
                >
                  Acknowledge & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

