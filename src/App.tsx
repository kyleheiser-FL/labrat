import { localDateISO, localTimeHM } from './lib/date';
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import AppHeader from './components/AppHeader';
import UpdateBanner from './components/UpdateBanner';
import ToastContainer from './components/ToastContainer';
import LegalModal from './components/LegalModal';
import AuthModal from './components/AuthModal';
import AppearanceModal from './components/AppearanceModal';
import FirstBootThemePicker from './components/FirstBootThemePicker';
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
  Smartphone,
  User as UserProfileIcon,
  ShoppingBag,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Compound, DoseLog, DailyMetric, LibraryItem, AppNotification, SegmentVisibility, DEFAULT_SEGMENT_VISIBILITY } from './types';
import { triggerHaptic } from './lib/haptics';
import { safeLocalStorage } from './lib/storage';
import { getDoseScheduleForDate } from './lib/schedule';
import DailyDosing from './components/DailyDosing';
import { PricingProvider } from './lib/pricingConfig';
import ExperienceGate from './components/ExperienceGate';
// Heavy tab views are code-split so only the Daily screen ships in the boot
// bundle. Each downloads the first time its tab is opened, then caches.
const StatsView = lazy(() => import('./components/StatsView'));
const CyclePlanner = lazy(() => import('./components/CyclePlanner'));
const PeptideLibrary = lazy(() => import('./components/PeptideLibrary'));
const MembersShop = lazy(() => import('./components/MembersShop'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
import {
  ExperienceMode, getStoredExperienceMode, setStoredExperienceMode,
} from './lib/experience';

// Firebase Setup
import { auth, db } from './firebase';
import { registerFCMToken, savePushProfile, initForegroundMessaging } from './lib/fcm';
import { 
  onAuthStateChanged, 
  signOut, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  fetchUserCompounds, 
  saveUserCompound, 
  deleteUserCompound,
  fetchUserLogs,
  saveUserLog,
  deleteUserLog,
  fetchUserMetrics,
  saveUserMetric,
  deleteUserMetric,
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
    startDate: localDateISO(),
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
    startDate: localDateISO(),
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

const migrateMetricsLegacyWeight = (metricsList: any[]): DailyMetric[] => {
  if (!Array.isArray(metricsList)) return [];
  return metricsList.map((m: any) => {
    if (m && m.weightKg !== undefined && m.weightLb === undefined) {
      return {
        ...m,
        weightLb: Math.round(m.weightKg * 2.20462)
      };
    }
    return m as DailyMetric;
  });
};

type LabRatTheme = 'clinical' | 'clinical-light';
type LabRatThemePreference = 'system' | LabRatTheme;
type LabRatBranding = 'mascot' | 'wordmark' | 'lr';

const resolveSystemTheme = (): LabRatTheme => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'clinical';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'clinical-light' : 'clinical';
};

const getInitialThemePreference = (): LabRatThemePreference => {
  const savedPreference = safeLocalStorage.getItem('labrat_theme_preference');
  if (savedPreference === 'system' || savedPreference === 'clinical' || savedPreference === 'clinical-light') {
    return savedPreference;
  }

  const legacyTheme = safeLocalStorage.getItem('labrat_ui_theme');
  if (legacyTheme === 'clinical-light') return 'clinical-light';
  if (legacyTheme === 'clinical' || legacyTheme === 'neon') return 'clinical';
  return 'system';
};

const getInitialBranding = (): LabRatBranding => {
  const saved = safeLocalStorage.getItem('labrat_in_app_branding');
  return saved === 'mascot' || saved === 'wordmark' || saved === 'lr' ? saved : 'mascot';
};

// Feature flag: set to true to re-enable shop-first onboarding for new visitors.
// While false, all tabs and tracking features are always visible (no shop-only gate).
const SHOP_FIRST_ONBOARDING_ENABLED = false;

const getInitialTrackingEnabled = (): boolean => {
  if (!SHOP_FIRST_ONBOARDING_ENABLED) return true;
  const saved = safeLocalStorage.getItem('labrat_tracking_enabled');
  if (saved === 'true') return true;
  if (saved === 'false') return false;
  return safeLocalStorage.getItem('labrat_compounds_initialized') === 'true';
};

// ── One-time repair for dose logs mis-dated by the old UTC date bug ──────────
// Before the New-York-time fix, a log's date came from `toISOString()` (UTC),
// so a late-evening Eastern dose was stamped with the *next* calendar day. The
// log's `time` was stored in Eastern wall-clock, so we can detect it: if the
// time is at/after the hour NY crosses UTC midnight (20:00 EDT / 19:00 EST),
// the stored date is one day ahead — shift it back to the correct NY day.
function easternOffsetHours(dateStr: string): number {
  try {
    const d = new Date(dateStr + 'T12:00:00Z');
    const name = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' })
      .formatToParts(d).find(p => p.type === 'timeZoneName')?.value;
    return name === 'EST' ? 5 : 4;
  } catch { return 4; }
}
function dateMinusOneDay(dateStr: string): string {
  const [y, m, dd] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(y, (m || 1) - 1, dd || 1));
  d.setUTCDate(d.getUTCDate() - 1);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}
function repairTzLogs(logs: DoseLog[]): { logs: DoseLog[]; changed: DoseLog[] } {
  const changed: DoseLog[] = [];
  const out = logs.map(l => {
    const t = /^(\d{1,2}):(\d{2})/.exec(l.time || '');
    if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(l.date || '')) return l;
    const mins = parseInt(t[1], 10) * 60 + parseInt(t[2], 10);
    if (mins >= (24 - easternOffsetHours(l.date)) * 60) {
      const nl = { ...l, date: dateMinusOneDay(l.date) };
      changed.push(nl);
      return nl;
    }
    return l;
  });
  return { logs: out, changed };
}
const TZ_FIX_KEY = 'labrat_tz_fix_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'blood' | 'library' | 'stats' | 'shop' | 'settings'>(
    () => (getInitialTrackingEnabled() ? 'dashboard' : 'shop')
  );
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(getInitialTrackingEnabled);

  // Experience mode — store | tracking | research.
  // Null means the gate hasn't been answered for this release yet.
  const [experienceMode, setExperienceMode] = useState<ExperienceMode | null>(() => getStoredExperienceMode());

  const handleSelectExperience = useCallback((mode: ExperienceMode) => {
    setStoredExperienceMode(mode);
    setExperienceMode(mode);
    if (mode === 'store') {
      setTrackingEnabled(false);
      safeLocalStorage.setItem('labrat_tracking_enabled', 'false');
      setActiveTab('shop');
      return;
    }
    // tracking + research both unlock Daily/Cycle tools; research just lands in library.
    setTrackingEnabled(true);
    safeLocalStorage.setItem('labrat_tracking_enabled', 'true');
    setActiveTab(mode === 'research' ? 'library' : 'dashboard');
  }, []);

  const handleToggleTracking = useCallback((enabled: boolean) => {
    setTrackingEnabled(enabled);
    safeLocalStorage.setItem('labrat_tracking_enabled', enabled ? 'true' : 'false');
    triggerHaptic(enabled ? 'success' : 'medium');
  }, []);

  // Push a history entry so the hardware/gesture back button navigates between tabs
  const navigateTab = useCallback((tab: 'dashboard' | 'planner' | 'blood' | 'library' | 'stats' | 'shop' | 'settings') => {
    window.history.pushState({ tab }, '');
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    // Stamp the initial history entry so there is always something to pop back to
    window.history.replaceState({ tab: 'dashboard' }, '');
    const onPop = (e: PopStateEvent) => {
      const tab = e.state?.tab;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const [themePreference, setThemePreference] = useState<LabRatThemePreference>(getInitialThemePreference);
  const [systemTheme, setSystemTheme] = useState<LabRatTheme>(resolveSystemTheme);
  const labratTheme: LabRatTheme = themePreference === 'system' ? systemTheme : themePreference;
  const [labratBranding, setLabratBranding] = useState<LabRatBranding>(getInitialBranding);
  const [showFirstBootThemePicker, setShowFirstBootThemePicker] = useState<boolean>(() => {
    return safeLocalStorage.getItem('labrat_theme_selected') !== 'true';
  });
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);

  const applyThemeSelection = (preference: LabRatThemePreference) => {
    setThemePreference(preference);
    setLabratBranding('lr');
    safeLocalStorage.setItem('labrat_in_app_branding', 'lr');
    safeLocalStorage.setItem('labrat_theme_preference', preference);
    safeLocalStorage.setItem('labrat_theme_selected', 'true');
    setShowFirstBootThemePicker(false);
    triggerHaptic('success');
  };

  const applyBrandingSelection = (branding: LabRatBranding) => {
    setLabratBranding(branding);
    safeLocalStorage.setItem('labrat_in_app_branding', branding);
    triggerHaptic('light');
  };

  // Handle startup deep-linking/PWA shortcuts parsing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab') || params.get('shortcut');
      if (urlTab) {
        const lowerTab = urlTab.toLowerCase();
        if (lowerTab === 'planner' || lowerTab === 'calculator') {
          setActiveTab('planner');
        } else if (lowerTab === 'library' || lowerTab === 'encyclopedia') {
          setActiveTab('library');
        } else if (lowerTab === 'shop' || lowerTab === 'store') {
          setActiveTab('shop');
        } else if (lowerTab === 'dashboard' || lowerTab === 'checklist') {
          setActiveTab('dashboard');
        }
      }
    }
  }, []);

  // Theme support visual attributes syncing
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const sync = () => setSystemTheme(media.matches ? 'clinical-light' : 'clinical');
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (labratTheme === 'clinical-light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    }
    root.setAttribute('data-labrat-theme', labratTheme);
    root.setAttribute('data-labrat-branding', labratBranding);

    safeLocalStorage.setItem('labrat_theme_preference', themePreference);
    safeLocalStorage.setItem('labrat_theme_mode', labratTheme === 'clinical-light' ? 'light' : 'dark');
    safeLocalStorage.setItem('labrat_ui_theme', labratTheme);
    safeLocalStorage.setItem('labrat_in_app_branding', labratBranding);

    const manifestHref = '/manifest-clinical.json?v=lr-clinical-final-20260528-live-refine-v2';
    let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    if (manifestLink.getAttribute('href') !== manifestHref) {
      manifestLink.setAttribute('href', manifestHref);
    }

    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', labratTheme === 'clinical-light' ? '#f0f4f8' : '#000000');
    }
  }, [labratTheme, labratBranding, themePreference]);

  // Core authenticated user from Firebase
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Core database states
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);

  // Notifications states
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);

  // Transport state from Library directly to Planner
  const [activeFromLibrary, setActiveFromLibrary] = useState<LibraryItem | null>(null);

  // Disclaimer overlay status
  const [showLegalModal, setShowLegalModal] = useState(false);

  // Hardcompiled App Store compliance configurations
  const isHardcompiledAppStore = (import.meta as any).env.VITE_APP_STORE_COMPLIANT === 'true';

  const [hideShop, setHideShop] = useState<boolean>(() => {
    if (isHardcompiledAppStore) return true;
    const localVal = safeLocalStorage.getItem('labrat_hide_shop');
    if (localVal !== null) {
      return localVal === 'true';
    }
    return false;
  });

  // Listen to Firestore system config in real-time for global shop visibility
  useEffect(() => {
    if (isHardcompiledAppStore) {
      setHideShop(true);
      return;
    }

    const unsub = onSnapshot(doc(db, 'systemConfig', 'shop'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (typeof data.hideShop === 'boolean') {
          setHideShop(data.hideShop);
          safeLocalStorage.setItem('labrat_hide_shop', data.hideShop ? 'true' : 'false');
        }
      }
    }, (err) => {
      console.warn("Could not read remote systemConfig (could be a guest user/offline):", err);
    });

    return () => unsub();
  }, [isHardcompiledAppStore]);

  // Fallback structural safety routing adjustments — redirect away from any tab
  // that's currently hidden (shop disabled globally, or tracking features opted out)
  useEffect(() => {
    const isTabVisible = (tab: typeof activeTab) => {
      if (tab === 'shop') return !hideShop;
      if (tab === 'settings') return true;
      // Compound Research (library) is reached from the Shop, so it's available
      // to everyone — including store-only users who have tracking turned off.
      if (tab === 'library') return true;
      return trackingEnabled;
    };
    if (!isTabVisible(activeTab)) {
      setActiveTab(trackingEnabled ? 'dashboard' : (!hideShop ? 'shop' : 'settings'));
    }
  }, [hideShop, trackingEnabled, activeTab]);

  const handleToggleHideShop = async (hide: boolean) => {
    if (isHardcompiledAppStore) return;
    try {
      setHideShop(hide);
      safeLocalStorage.setItem('labrat_hide_shop', hide ? 'true' : 'false');
      await setDoc(doc(db, 'systemConfig', 'shop'), { hideShop: hide }, { merge: true });

      triggerNotification(
        hide ? 'Safety Mode: Shop Hidden' : 'Safety Mode: Shop Restored',
        hide ? 'Shopping tab has been globally hidden for all app users.' : 'Shopping catalog is now actively accessible to all approved users.',
        hide ? 'warning' : 'success'
      );
    } catch (err: any) {
      console.error("Failed to update global shop settings:", err);
      triggerNotification(
        'Action Denied',
        'Could not update global settings. Only authorized administrators can change this state.',
        'warning'
      );
    }
  };

  // Notification state (lifted from CycleDashboard so scheduler always runs)
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [reminderEnabled, setReminderEnabled] = useState(() =>
    safeLocalStorage.getItem('labrat_reminder_enabled') === 'true'
  );
  const [reminderTime, setReminderTime] = useState(() =>
    safeLocalStorage.getItem('labrat_reminder_time') || '09:00'
  );
  const [testStatus, setTestStatus] = useState<'idle' | 'countdown' | 'triggered' | 'denied' | 'unsupported'>('idle');
  const [countdown, setCountdown] = useState(5);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) { setNotificationPermission('unsupported'); return; }
    try {
      const status = await Notification.requestPermission();
      setNotificationPermission(status);
      if (status === 'granted') { setReminderEnabled(true); safeLocalStorage.setItem('labrat_reminder_enabled', 'true'); }
    } catch (e) { console.error('Error requesting notification permission', e); }
  };

  const handleReminderToggle = (enabled: boolean) => {
    setReminderEnabled(enabled);
    safeLocalStorage.setItem('labrat_reminder_enabled', enabled ? 'true' : 'false');
    if (enabled && notificationPermission !== 'granted') requestNotificationPermission();
  };

  const handleReminderTimeChange = (time: string) => {
    setReminderTime(time);
    safeLocalStorage.setItem('labrat_reminder_time', time);
  };

  /** Post a message to the service worker so it calls self.showNotification()
   *  — guarantees an OS-level banner on Android and iOS PWA (not tray-only) */
  const fireOSNotification = (title: string, body: string, tag = 'labrat-notification') => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then((reg) => {
      if (reg.active) {
        reg.active.postMessage({
          type: 'SHOW_NOTIFICATION',
          payload: { title, body, tag, icon: '/icon_192.png', badge: '/icon_96.png' },
        });
      }
    }).catch(e => console.warn('[notifications] Service worker notification failed:', e));
  };

  const firePhysicalNotification = () => {
    setTestStatus('triggered');
    setTimeout(() => setTestStatus('idle'), 4000);
    fireOSNotification(
      '🔬 LabRat Dose Alert',
      "Time to record today's scheduled administrations.",
      'labrat-reminder-daily'
    );
  };

  const startTestCountdown = () => {
    setTestStatus('countdown'); setCountdown(5);
    const interval = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { clearInterval(interval); firePhysicalNotification(); return 5; } return prev - 1; });
    }, 1000);
  };

  // Real background push test — asks the SERVER to FCM-push this device now.
  // Unlike the local test above, this exercises the full background-delivery path.
  const sendBackgroundTestPush = async () => {
    triggerHaptic('medium');
    if (!user) { triggerNotification('Sign in required', 'Sign in first so we know which device to push.', 'warning'); return; }
    if (Notification.permission !== 'granted') {
      const status = await Notification.requestPermission();
      setNotificationPermission(status);
      if (status !== 'granted') { triggerNotification('Permission needed', 'Allow notifications to test push.', 'warning'); return; }
      await registerFCMToken(user.uid).catch(() => {});
    }
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/test-push', { method: 'POST', headers: { Authorization: `Bearer ${idToken}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { triggerNotification('Test push failed', data.error || `Server error ${res.status}`, 'error'); return; }
      if (!data.tokens) {
        triggerNotification('No device registered', 'No push token on file. Make sure notifications are allowed, then reopen the app once.', 'warning');
      } else if (data.sent > 0) {
        triggerNotification('Test push sent ✅', `Sent to ${data.sent} device(s). Lock your phone now — the banner should arrive in a few seconds.`, 'success');
      } else {
        triggerNotification('Push not accepted', `Tokens ${data.tokens}, delivered 0. ${(data.errMsgs || []).join('; ') || 'Token may be stale — reopen the app to refresh it.'}`, 'error');
      }
    } catch (e: any) {
      triggerNotification('Test push error', e?.message || 'Network error', 'error');
    }
  };

  const triggerTestNotification = () => {
    triggerHaptic('medium');
    if (!('Notification' in window)) { setTestStatus('unsupported'); return; }
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(status => {
        setNotificationPermission(status);
        if (status === 'granted') startTestCountdown(); else setTestStatus('denied');
      });
    } else { startTestCountdown(); }
  };

  // Register the FCM device token whenever permission is granted. Sign-in
  // alone isn't enough: permission may be granted later via the settings
  // toggle, and without this the profile never gets a token and background
  // push silently never delivers.
  useEffect(() => {
    if (!user || notificationPermission !== 'granted') return;
    registerFCMToken(user.uid).catch(e => console.warn('[push] FCM token registration failed — push notifications disabled:', e));
  }, [user, notificationPermission]);

  // Sync push profile to Firestore whenever reminder settings or compounds change
  useEffect(() => {
    if (!user) return;
    const compoundReminders = compounds
      .filter(c => c.reminderTime && !c.isCompleted)
      .map(c => ({ id: c.id, name: c.name, reminderTime: c.reminderTime as string }));
    savePushProfile(user.uid, {
      reminderEnabled,
      reminderTime,
      timezoneOffset: new Date().getTimezoneOffset(),
      compounds: compoundReminders,
    }).catch(e => console.error('[push] Failed to sync push profile — reminders may not fire:', e));
  }, [user, reminderEnabled, reminderTime, compounds]);

  // Handle foreground FCM messages (app is open)
  useEffect(() => {
    if (!user) return;
    const unsub = initForegroundMessaging((title, body, tag) => {
      fireOSNotification(title, body, tag);
    });
    return unsub;
  }, [user]);

  // Reminder scheduler useEffect
  useEffect(() => {
    if (!reminderEnabled) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (!reminderTime || !/^\d{1,2}:\d{2}$/.test(reminderTime)) return;
    let timerId: ReturnType<typeof setTimeout>;
    const msUntilNext = (): number => {
      const [h, m] = reminderTime.split(':').map((n: string) => parseInt(n, 10));
      const now = new Date(); const next = new Date();
      next.setHours(h, m, 0, 0);
      if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
      return next.getTime() - now.getTime();
    };
    const schedule = () => {
      timerId = setTimeout(() => {
        try {
          const todayStr = localDateISO();
          const guardKey = `labrat_reminder_fired_${todayStr}`;
          if (safeLocalStorage.getItem(guardKey) !== 'true') {
            firePhysicalNotification();
            safeLocalStorage.setItem(guardKey, 'true');
          }
        } catch (e) { console.warn('[Reminder] foreground fire failed', e); }
        schedule();
      }, msUntilNext());
    };
    schedule();
    return () => clearTimeout(timerId);
  }, [reminderEnabled, reminderTime, notificationPermission]);

  // Per-compound dose reminder scheduler
  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const comp of compounds) {
      if (!comp.reminderTime || comp.isCompleted) continue;
      const [h, m] = comp.reminderTime.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) continue;
      const now = new Date();
      const next = new Date();
      next.setHours(h, m, 0, 0);
      if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
      const delay = next.getTime() - now.getTime();
      const t = setTimeout(() => {
        const todayStr = localDateISO();
        const guardKey = `labrat_comp_reminder_${comp.id}_${todayStr}`;
        if (safeLocalStorage.getItem(guardKey) === 'true') return;
        fireOSNotification(
          `💉 Time for ${comp.name}`,
          `${comp.doseAmount}${comp.doseUnit} dose scheduled — open LabRat to log it.`,
          `comp-${comp.id}`
        );
        safeLocalStorage.setItem(guardKey, 'true');
      }, delay);
      timers.push(t);
    }
    return () => timers.forEach(clearTimeout);
  }, [compounds]);

  // Missed dose detection
  const [missedDosePrompts, setMissedDosePrompts] = useState<{ compound: Compound; date: string }[]>([]);
  const [missedDoseIdx, setMissedDoseIdx] = useState(0);

  useEffect(() => {
    const checkKey = 'labrat_missed_check_' + localDateISO();
    if (safeLocalStorage.getItem(checkKey) === 'true') return;
    const today = new Date();
    const prompts: { compound: Compound; date: string }[] = [];
    const activeComps = compounds.filter(c => !c.isCompleted);
    for (const comp of activeComps) {
      for (let d = 1; d <= 3; d++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - d);
        const dateStr = localDateISO(checkDate);
        const startDate = new Date(comp.startDate + 'T00:00:00');
        if (checkDate < startDate) continue;
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + comp.durationWeeks * 7);
        if (checkDate >= endDate) continue;
        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][checkDate.getDay()];
        let shouldHaveDosed = false;
        if (comp.frequency === 'daily') shouldHaveDosed = true;
        else if (comp.frequency === 'eod') shouldHaveDosed = Math.floor((checkDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) % 2 === 0;
        else if (comp.frequency === 'twice_weekly') shouldHaveDosed = ['Mon', 'Thu'].includes(dayOfWeek);
        else if (comp.frequency === 'weekly') shouldHaveDosed = checkDate.getDay() === startDate.getDay();
        else if (comp.frequency === 'custom' && comp.customDays) shouldHaveDosed = Math.floor((checkDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) % comp.customDays === 0;
        if (comp.scheduledDays?.length) shouldHaveDosed = comp.scheduledDays.includes(dayOfWeek);
        if (!shouldHaveDosed) continue;
        const hasLog = logs.some(l => l.compoundId === comp.id && l.date === dateStr);
        if (!hasLog) prompts.push({ compound: comp, date: dateStr });
      }
    }
    if (prompts.length > 0) {
      setMissedDosePrompts(prompts);
      setMissedDoseIdx(0);
      const missedTitle = prompts.length === 1
        ? `⚠️ Missed Dose: ${prompts[0].compound.name}`
        : `⚠️ ${prompts.length} Missed Doses Detected`;
      const missedBody = prompts.length === 1
        ? `No log found for ${prompts[0].date} — open LabRat to confirm.`
        : 'Open LabRat to review and log retroactively.';
      fireOSNotification(missedTitle, missedBody, 'labrat-missed-doses');
    }
    safeLocalStorage.setItem(checkKey, 'true');
  }, [compounds, logs]);

  // Segment visibility state
  const [segmentVisibility, setSegmentVisibility] = useState<SegmentVisibility>(() => {
    try {
      const saved = safeLocalStorage.getItem('labrat_segment_visibility');
      if (saved) return { ...DEFAULT_SEGMENT_VISIBILITY, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SEGMENT_VISIBILITY;
  });

  const handleSegmentChange = (page: keyof SegmentVisibility, segment: string, value: boolean) => {
    setSegmentVisibility(prev => {
      const updated = { ...prev, [page]: { ...prev[page], [segment]: value } };
      safeLocalStorage.setItem('labrat_segment_visibility', JSON.stringify(updated));
      return updated;
    });
  };

  // PWA Prompt trackers
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  }, []);

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
        'labrat is now integrated on your active device home screen.',
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
    const manifestHref = '/manifest-clinical.json?v=lr-clinical-final-20260528-live-refine-v2';
    const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    manifestLink?.setAttribute('href', manifestHref);
    safeLocalStorage.setItem('labrat_pwa_icon_theme', labratTheme);

    await new Promise((resolve) => window.setTimeout(resolve, 160));

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      triggerNotification(
        'Install labrat',
        'Use your browser address-bar install icon or browser menu to install labrat.',
        'info',
        false
      );
    }
  };

  // Toast notifications dispatchers
  const triggerNotification = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'reminder',
    persist: boolean = true
  ) => {
    if (type === 'success') {
      triggerHaptic('success');
    } else if (type === 'warning' || type === 'error') {
      triggerHaptic('warning');
    } else if (type === 'reminder') {
      triggerHaptic('medium');
    } else {
      triggerHaptic('light');
    }

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
          safeLocalStorage.setItem('labrat_notifications', JSON.stringify(updated));
        } else {
          saveUserNotification(auth.currentUser.uid, newNotif).catch(e => console.error('Cloud notification log failed', e));
        }
        return updated;
      });
    }

    setActiveToasts(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== newNotif.id));
    }, 3500);
  };

  const handleSignOut = async () => {
    try {
      setCompounds([]);
      setLogs([]);
      setMetrics([]);
      setNotifications([]);

      safeLocalStorage.removeItem('labrat_compounds');
      safeLocalStorage.removeItem('labrat_logs');
      safeLocalStorage.removeItem('labrat_metrics');
      safeLocalStorage.removeItem('labrat_notifications');
      safeLocalStorage.removeItem('labrat_compounds_initialized');
      safeLocalStorage.removeItem('labrat_just_clicked_signin');

      // Re-derive shop-only vs. full access now that the "returning user" signal
      // (labrat_compounds_initialized) has been cleared — without this, signing
      // out would leave the tracking tabs visible until a hard page reload.
      setTrackingEnabled(getInitialTrackingEnabled());

      await signOut(auth);
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

          const localCompounds = safeLocalStorage.getItem('labrat_compounds');
          const localLogs = safeLocalStorage.getItem('labrat_logs');
          const localMetrics = safeLocalStorage.getItem('labrat_metrics');
          const localNotifications = safeLocalStorage.getItem('labrat_notifications');

          const pLocals = localCompounds ? JSON.parse(localCompounds) : [];
          const pLogs = localLogs ? JSON.parse(localLogs) : [];
          const pMetrics = localMetrics ? JSON.parse(localMetrics) : [];
          const pNotifs = localNotifications ? JSON.parse(localNotifications) : [];

          const hasOfflineRecords = pLocals.length > 0 && !(pLocals.length === SEED_COMPOUNDS.length && pLocals[0]?.id === SEED_COMPOUNDS[0]?.id);
          
          let finalCompounds = cCompounds;
          let finalLogs = cLogs;
          let finalMetrics = cMetrics;
          let finalNotifs = cNotifs;

          const justClickedSignIn = safeLocalStorage.getItem('labrat_just_clicked_signin') === 'true';
          safeLocalStorage.removeItem('labrat_just_clicked_signin');

          if (justClickedSignIn) {
            if (cCompounds.length === 0) {
              if (hasOfflineRecords) {
                await uploadLocalDataToCloud(currentUser.uid, pLocals, pLogs, pMetrics, pNotifs);
                finalCompounds = pLocals;
                finalLogs = pLogs;
                finalMetrics = pMetrics;
                finalNotifs = pNotifs;
              } else {
                finalCompounds = [];
                finalLogs = [];
                finalMetrics = [];
                finalNotifs = [];
              }
              safeLocalStorage.setItem('labrat_compounds_initialized', 'true');

              setTimeout(() => {
                triggerNotification(
                  'Cloud Sync Configured',
                  'Successfully initialised secure cloud database backups for your active records.',
                  'success',
                  false
                );
              }, 1000);
            } else {
              const syncPromises: Promise<void>[] = [];

              const syncedCompounds = [...cCompounds];
              for (const localComp of pLocals) {
                const inCloud = cCompounds.some(c => c.id === localComp.id);
                if (!inCloud && localComp.id !== 'seed-bpc-157' && localComp.id !== 'seed-ghk-cu') {
                  syncedCompounds.push(localComp);
                  syncPromises.push(
                    saveUserCompound(currentUser.uid, localComp).catch(e => console.error('Auto-sync layout err:', e))
                  );
                }
              }
              finalCompounds = syncedCompounds;

              const syncedLogs = [...cLogs];
              for (const localLog of pLogs) {
                const inCloud = cLogs.some(l => l.id === localLog.id);
                if (!inCloud) {
                  syncedLogs.push(localLog);
                  syncPromises.push(
                    saveUserLog(currentUser.uid, localLog).catch(e => console.error('Auto-sync logger err:', e))
                  );
                }
              }
              finalLogs = syncedLogs;

              const syncedMetrics = [...cMetrics];
              for (const localMetric of pMetrics) {
                const inCloud = cMetrics.some(m => m.date === localMetric.date);
                if (!inCloud) {
                  syncedMetrics.push(localMetric);
                  syncPromises.push(
                    saveUserMetric(currentUser.uid, localMetric).catch(e => console.error('Auto-sync metrics err:', e))
                  );
                }
              }
              finalMetrics = syncedMetrics;

              const syncedNotifs = [...cNotifs];
              for (const localNotif of pNotifs) {
                const inCloud = cNotifs.some(n => n.id === localNotif.id);
                if (!inCloud) {
                  syncedNotifs.push(localNotif);
                  syncPromises.push(
                    saveUserNotification(currentUser.uid, localNotif).catch(e => console.error('Auto-sync flags err:', e))
                  );
                }
              }
              finalNotifs = syncedNotifs;

              await Promise.all(syncPromises);

              if (!hasShownSyncReadyMessage) {
                hasShownSyncReadyMessage = true;
                setTimeout(() => {
                  triggerNotification(
                    'Cloud Sync Session Ready',
                    `Synchronised profile registers for ${currentUser.email}. Any new offline data was merged.`,
                    'info',
                    false
                  );
                }, 800);
              }
            }
          } else {
            finalCompounds = cCompounds;
            finalLogs = cLogs;
            finalMetrics = cMetrics;
            finalNotifs = cNotifs;

            if (!hasShownSyncReadyMessage) {
              hasShownSyncReadyMessage = true;
              setTimeout(() => {
                triggerNotification(
                  'Cloud Sync Connected',
                  `Active cloud database synchronized cleanly for ${currentUser.email}.`,
                  'info',
                  false
                );
              }, 800);
            }
          }

          // One-time timezone repair on the authoritative (cloud-merged) logs.
          let logsForState = finalLogs;
          if (safeLocalStorage.getItem(TZ_FIX_KEY) !== 'done') {
            const { logs: repaired, changed } = repairTzLogs(finalLogs);
            logsForState = repaired;
            changed.forEach(l => saveUserLog(currentUser.uid, l).catch(e => console.error('[tz-fix] save failed:', e)));
            safeLocalStorage.setItem(TZ_FIX_KEY, 'done');
            if (changed.length) {
              setTimeout(() => triggerNotification('Dates corrected', `Moved ${changed.length} late-night dose${changed.length === 1 ? '' : 's'} to the correct day (New York time).`, 'info', false), 1200);
            }
          }

          setCompounds(finalCompounds);
          setLogs(logsForState);
          setMetrics(migrateMetricsLegacyWeight(finalMetrics));
          setNotifications(filterTransientNotifs(finalNotifs).sort((a,b) => b.timestamp.localeCompare(a.timestamp)));

          // Register FCM token for background push delivery (non-blocking)
          registerFCMToken(currentUser.uid).catch(e => console.warn('[push] FCM token registration failed — push notifications disabled:', e));

          safeLocalStorage.setItem('labrat_compounds', JSON.stringify(finalCompounds));
          safeLocalStorage.setItem('labrat_logs', JSON.stringify(logsForState));
          safeLocalStorage.setItem('labrat_metrics', JSON.stringify(finalMetrics));
          safeLocalStorage.setItem('labrat_notifications', JSON.stringify(finalNotifs));
        } catch (err) {
          console.error('Error fetching user registers during sync:', err);
          triggerNotification('Sync Interruption', 'Failed fetching cloud records. Cache fallback activated.', 'warning', false);
          
          const storedCompounds = safeLocalStorage.getItem('labrat_compounds');
          const storedLogs = safeLocalStorage.getItem('labrat_logs');
          const storedMetrics = safeLocalStorage.getItem('labrat_metrics');
          const storedNotifications = safeLocalStorage.getItem('labrat_notifications');
          const hasInitFlag = safeLocalStorage.getItem('labrat_compounds_initialized') === 'true';

          if (storedCompounds || hasInitFlag) {
            setCompounds(storedCompounds ? JSON.parse(storedCompounds) : []);
          } else {
            setCompounds(SEED_COMPOUNDS);
            safeLocalStorage.setItem('labrat_compounds', JSON.stringify(SEED_COMPOUNDS));
            safeLocalStorage.setItem('labrat_compounds_initialized', 'true');
          }

          setLogs(storedLogs ? JSON.parse(storedLogs) : []);
          setMetrics(migrateMetricsLegacyWeight(storedMetrics ? JSON.parse(storedMetrics) : []));
          setNotifications(filterTransientNotifs(storedNotifications ? JSON.parse(storedNotifications) : []));
        }
      } else {
        hasShownSyncReadyMessage = false;
        const storedCompounds = safeLocalStorage.getItem('labrat_compounds');
        const storedLogs = safeLocalStorage.getItem('labrat_logs');
        const storedMetrics = safeLocalStorage.getItem('labrat_metrics');
        const storedNotifications = safeLocalStorage.getItem('labrat_notifications');
        const hasInitFlag = safeLocalStorage.getItem('labrat_compounds_initialized') === 'true';

        if (storedCompounds || hasInitFlag) {
          setCompounds(storedCompounds ? JSON.parse(storedCompounds) : []);
        } else {
          setCompounds(SEED_COMPOUNDS);
          safeLocalStorage.setItem('labrat_compounds', JSON.stringify(SEED_COMPOUNDS));
          safeLocalStorage.setItem('labrat_compounds_initialized', 'true');
        }

        setLogs(storedLogs ? JSON.parse(storedLogs) : []);
        setMetrics(migrateMetricsLegacyWeight(storedMetrics ? JSON.parse(storedMetrics) : []));
        setNotifications(filterTransientNotifs(storedNotifications ? JSON.parse(storedNotifications) : []));
      }
      setAuthLoading(false);
      if (typeof window !== 'undefined') {
        (window as any).__LABRAT_MOUNTED__ = true;
      }
    });

    return () => unsubscribe();
  }, []);

  // Automated background checklist tracking triggers
  useEffect(() => {
    const checkDailyReminders = () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      const enabled = safeLocalStorage.getItem('labrat_reminder_enabled') === 'true';
      if (!enabled) return;

      const reminderTimeStr = safeLocalStorage.getItem('labrat_reminder_time') || '09:00';
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMin = now.getMinutes().toString().padStart(2, '0');
      const timeNow = `${currentHour}:${currentMin}`;

      if (timeNow >= reminderTimeStr) {
        const todayStr = localDateISO(now);
        const lastAlerted = safeLocalStorage.getItem('labrat_last_alert_date');

        if (lastAlerted !== todayStr) {
          safeLocalStorage.setItem('labrat_last_alert_date', todayStr);

          const activeCompounds = JSON.parse(safeLocalStorage.getItem('labrat_compounds') || '[]');
          const logsToday = JSON.parse(safeLocalStorage.getItem('labrat_logs') || '[]');
          
          const countScheduled = activeCompounds.filter((comp: any) => {
            const start = new Date(comp.startDate + 'T00:00:00');
            const curr = new Date(todayStr + 'T00:00:00');
            const diffTime = curr.getTime() - start.getTime();
            if (diffTime < 0) return false;
            
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const weekNo = Math.floor(diffDays / 7) + 1;
            if (weekNo > comp.durationWeeks) return false;

            let isDue = false;
            switch (comp.frequency) {
              case 'daily': isDue = true; break;
              case 'eod': isDue = diffDays % 2 === 0; break;
              case 'twice_weekly': isDue = (diffDays % 7 === 0 || diffDays % 7 === 3); break;
              case 'weekly': isDue = diffDays % 7 === 0; break;
              case 'custom': isDue = diffDays % (comp.customDays || 3) === 0; break;
            }
            const alreadyLogged = logsToday.some((l: any) => l.compoundId === comp.id && l.date === todayStr);
            return isDue && !alreadyLogged;
          }).length;

          if (countScheduled > 0) {
            const title = '🔬 labrat Checklist Reminder';
            const options = {
              body: `You have ${countScheduled} scheduled dosage administration checklist item${countScheduled === 1 ? '' : 's'} remaining for today.`,
              icon: '/vitamins_icon.png',
              badge: '/vitamins_icon.png',
              vibrate: [200, 100, 200],
              tag: 'labrat-daily-reminder',
              renotify: true
            };

            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title, options).catch(() => {
                  new Notification(title, options);
                });
              }).catch(() => {
                new Notification(title, options);
              });
            } else {
              new Notification(title, options);
            }
          }
        }
      }
    };

    checkDailyReminders();
    const interval = setInterval(checkDailyReminders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Action methods
  const handleAddCompound = (comp: Compound) => {
    const updated = [...compounds, comp];
    setCompounds(updated);
    safeLocalStorage.setItem('labrat_compounds', JSON.stringify(updated));
    if (user) {
      saveUserCompound(user.uid, comp).catch(e => {
        console.error(e);
        triggerNotification('Cloud Sync Interruption', `Unable to backup ${comp.name} to Firestore. Local cache preserved offline.`, 'warning');
      });
    }
    triggerNotification('Compound Scheduled', `Scheduled target parameters for ${comp.name}.`, 'success');
  };

  const handleUpdateCompound = (updatedComp: Compound) => {
    const updatedList = compounds.map(c => c.id === updatedComp.id ? updatedComp : c);
    setCompounds(updatedList);
    safeLocalStorage.setItem('labrat_compounds', JSON.stringify(updatedList));
    if (user) {
      saveUserCompound(user.uid, updatedComp).catch(e => {
        console.error(e);
        triggerNotification('Cloud Sync Interruption', 'Unable to backup modified parameters of substance scheduling. Local cache preserved.', 'warning');
      });
    }
    triggerNotification('Schedule Parameter Adjustment', `Modified dosing schedule parameters for ${updatedComp.name}.`, 'info');
  };


  const handleDeleteCompound = (id: string) => {
    const targetComp = compounds.find(c => c.id === id);
    const updated = compounds.filter(c => c.id !== id);
    setCompounds(updated);
    safeLocalStorage.setItem('labrat_compounds', JSON.stringify(updated));
    if (user) {
      deleteUserCompound(user.uid, id).catch(e => {
        console.error(e);
        triggerNotification('Cloud Sync Interruption', 'Terminated compound removed locally but cloud delete failed.', 'warning');
      });
    }
    triggerNotification('Compound Terminated', `${targetComp?.name || 'Substance'} removed from active schedule queues.`, 'warning');
  };

  const syncCompoundStartDate = (compoundId: string, currentLogs: DoseLog[]) => {
    const compLogs = currentLogs.filter(l => l.compoundId === compoundId);
    if (compLogs.length === 0) return;

    const sortedDates = compLogs.map(l => l.date).sort();
    const earliestDate = sortedDates[0];

    setCompounds(prevCompounds => {
      const targetComp = prevCompounds.find(c => c.id === compoundId);
      if (targetComp && targetComp.startDate !== earliestDate) {
        const updatedComp = { ...targetComp, startDate: earliestDate };
        const updatedList = prevCompounds.map(c => c.id === compoundId ? updatedComp : c);
        safeLocalStorage.setItem('labrat_compounds', JSON.stringify(updatedList));
        if (user) {
          saveUserCompound(user.uid, updatedComp).catch(e => {
            console.error('Error syncing adjusted compound start date to DB:', e);
          });
        }
        setTimeout(() => {
          triggerNotification('Start Date Adjusted', `${targetComp.name} start date synchronized with first logged dose: ${earliestDate}.`, 'info');
        }, 150);
        return updatedList;
      }
      return prevCompounds;
    });
  };

  const handleLogDose = (newLog: DoseLog) => {
    const updated = [...logs, newLog];
    setLogs(updated);
    safeLocalStorage.setItem('labrat_logs', JSON.stringify(updated));
    if (user) {
      saveUserLog(user.uid, newLog).catch(e => {
        console.error(e);
        triggerNotification('Cloud Sync Interruption', 'Dose logged successfully offline but backup sync failed.', 'warning');
      });
    }
    if (newLog.isSkipped) {
      triggerNotification('Dose Skipped', `${newLog.compoundName} marked skipped for ${newLog.date}.`, 'info');
      return;
    }

    triggerNotification('Dose Administered', `Successfully logged administration of ${newLog.doseAmount} ${newLog.doseUnit} ${newLog.compoundName}.`, 'success');
    syncCompoundStartDate(newLog.compoundId, updated);
  };

  const handleBatchLogDoses = (newLogs: DoseLog[]) => {
    if (newLogs.length === 0) return;
    const updated = [...logs, ...newLogs];
    setLogs(updated);
    safeLocalStorage.setItem('labrat_logs', JSON.stringify(updated));
    if (user) {
      newLogs.forEach(log => {
        saveUserLog(user.uid, log).catch(e => console.error('Cloud Sync Error for batch log:', e));
      });
    }
    triggerNotification('Historic Doses Synced', `Successfully logged ${newLogs.length} historical administration entries.`, 'success');
    
    const firstLog = newLogs[0];
    if (firstLog) {
      syncCompoundStartDate(firstLog.compoundId, updated);
    }
  };

  const handleUndoDose = (logId: string) => {
    const targetLog = logs.find(l => l.id === logId);
    const updated = logs.filter(l => l.id !== logId);
    setLogs(updated);
    safeLocalStorage.setItem('labrat_logs', JSON.stringify(updated));
    if (user) {
      deleteUserLog(user.uid, logId).catch(e => {
        console.error(e);
        triggerNotification('Cloud Sync Interruption', 'Dose undone locally, but database sync encountered an error.', 'warning');
      });
    }
    triggerNotification('Administration Revoked', `Undo triggered for dose logs of ${targetLog?.compoundName}.`, 'info');
    if (targetLog) {
      syncCompoundStartDate(targetLog.compoundId, updated);
    }
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
    safeLocalStorage.setItem('labrat_metrics', JSON.stringify(updated));
    if (user) {
      saveUserMetric(user.uid, newMetric).catch(e => {
        console.error(e);
        triggerNotification('Cloud Sync Interruption', 'Metrics saved locally but database synchronize failed.', 'warning');
      });
    }
    triggerNotification('Biometrics Captured', `Secured weight and wellbeing indicators for ${newMetric.date}.`, 'success');
  };

  const handleUpdateCompoundDose = (compoundId: string, newDose: number) => {
    const comp = compounds.find(c => c.id === compoundId);
    if (!comp) return;
    handleUpdateCompound({ ...comp, doseAmount: newDose });
  };

  const handleDeleteMetric = (date: string) => {
    const updated = metrics.filter(m => m.date !== date);
    setMetrics(updated);
    safeLocalStorage.setItem('labrat_metrics', JSON.stringify(updated));
    if (user) {
      deleteUserMetric(user.uid, date).catch(e => {
        console.error(e);
        triggerNotification('Cloud Sync Interruption', 'Metrics removed offline but database sync pending.', 'warning');
      });
    }
    triggerNotification('Biometrics Removed', `Successfully deleted entry for ${date}.`, 'info');
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
        safeLocalStorage.setItem('labrat_compounds', JSON.stringify(parsed));
      }
      triggerNotification('Database Import Success', 'Restored compound parameters successfully.', 'success');
      return true;
    } catch {
      triggerNotification('Import Failed', 'Invalid chemical structure or string parsing fault.', 'warning');
      return false;
    }
  };

  const handleResetAllData = () => {
    setCompounds([]);
    setLogs([]);
    setMetrics([]);
    setNotifications([]);
    
    if (user) {
      compounds.forEach(c => deleteUserCompound(user.uid, c.id).catch(e => console.error(e)));
      logs.forEach(l => deleteUserLog(user.uid, l.id).catch(e => console.error(e)));
      notifications.forEach(n => deleteUserNotification(user.uid, n.id).catch(e => console.error(e)));
    } else {
      safeLocalStorage.removeItem('labrat_compounds');
      safeLocalStorage.removeItem('labrat_logs');
      safeLocalStorage.removeItem('labrat_metrics');
      safeLocalStorage.removeItem('labrat_notifications');
    }
    triggerNotification('Database Reset Complete', 'All active rosters and biometrics wiped clean.', 'warning', false);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, isRead: true };
        if (user) {
          saveUserNotification(user.uid, updated).catch(e => console.error(e));
        } else {
          const allUpdated = prev.map(item => item.id === id ? updated : item);
          safeLocalStorage.setItem('labrat_notifications', JSON.stringify(allUpdated));
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
      safeLocalStorage.removeItem('labrat_notifications');
    }
    setNotifications([]);
    triggerNotification('Alert Feed Cleared', 'In-app notification records disengaged successfully.', 'info', false);
  };

  const handleAddLibraryItemToCycle = (item: LibraryItem) => {
    setActiveFromLibrary(item);
    navigateTab('planner');
  };

  // Badge counts for tab nav — recomputed whenever compounds or logs change
  const tabBadges = useMemo(() => {
    const todayStr = localDateISO();
    const active = compounds.filter(c => !c.isCompleted);

    // Only count today's scheduled-but-not-yet-logged doses
    const pendingToday = active.filter(comp => {
      const { isDue } = getDoseScheduleForDate(comp, todayStr);
      return isDue && !logs.some(l => l.compoundId === comp.id && l.date === todayStr);
    }).length;

    const unreadNotifs = notifications.filter(n => !n.isRead).length;

    return { dashboard: pendingToday, notifications: unreadNotifs };
  }, [compounds, logs, notifications]);

  return (
    <div
      className={`min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/35 selection:text-cyan-200 labrat-theme-${labratTheme} labrat-brand-${labratBranding}`}
      id="labrat-app-shell"
    >
      <div className="fixed top-[-100px] left-1/4 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-[#a855f7]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <ToastContainer toasts={activeToasts} />

      {/* Experience gate — everyone answers after each release before using the app */}
      {experienceMode === null && <ExperienceGate onSelect={handleSelectExperience} />}

      {/* Missed Dose Modal */}
      {missedDosePrompts.length > 0 && missedDoseIdx < missedDosePrompts.length && (() => {
        const { compound, date } = missedDosePrompts[missedDoseIdx];
        const dismiss = () => {
          if (missedDoseIdx + 1 >= missedDosePrompts.length) setMissedDosePrompts([]);
          else setMissedDoseIdx(i => i + 1);
        };
        const logMissed = () => {
          const log: DoseLog = {
            id: `missed-${Date.now()}`,
            compoundId: compound.id,
            compoundName: compound.name,
            date,
            time: '00:00',
            doseAmount: compound.doseAmount,
            doseUnit: compound.doseUnit,
            notes: 'Marked as taken (retroactive)'
          };
          handleLogDose(log);
          dismiss();
        };
        return (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-[#0f172a] border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest mb-1">Missed Dose Detected</div>
                  <h3 className="text-sm font-bold text-white">{compound.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">No log found for <span className="font-mono text-slate-300">{date}</span></p>
                </div>
                <button onClick={dismiss} className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Did you take your {compound.doseAmount}{compound.doseUnit} dose on this date?</p>
              <div className="flex gap-2">
                <button
                  onClick={logMissed}
                  className="flex-1 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Yes, log it
                </button>
                <button
                  onClick={dismiss}
                  className="flex-1 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-400 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Skip / Missed
                </button>
              </div>
              {missedDosePrompts.length > 1 && (
                <p className="text-[10px] text-center text-slate-600 font-mono">{missedDoseIdx + 1} of {missedDosePrompts.length} missed doses</p>
              )}
            </div>
          </div>
        );
      })()}

      <UpdateBanner />
      <AppHeader
        activeTab={activeTab}
        onSetActiveTab={setActiveTab}
        labratTheme={labratTheme}
        user={user}
        authLoading={authLoading}
        isStandalone={isStandalone}
        onInstallApp={handleInstallApp}
        onSignOut={handleSignOut}
        onSignInClick={() => openAuthModal('signin')}
        hideShop={hideShop}
        trackingEnabled={trackingEnabled}
        tabBadges={tabBadges}
        experienceMode={experienceMode}
      />

      {/* Main Responsive Layout Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 z-10 flex flex-col gap-6 overflow-hidden">
        <div className="flex-1 min-h-[300px]">
          <Suspense fallback={<div className="flex items-center justify-center py-24 text-slate-500"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="labrat-page-shell h-full"
            >
              {activeTab === 'dashboard' && (
                <DailyDosing
                  compounds={compounds}
                  logs={logs}
                  labratTheme={labratTheme}
                  onLogDose={handleLogDose}
                  onUndoDose={handleUndoDose}
                  onUpdateCompound={handleUpdateCompound}
                />
              )}

              {activeTab === 'planner' && (
                <div className="flex flex-col gap-6">
                  <CyclePlanner
                    compounds={compounds}
                    logs={logs}
                    onLogDose={handleLogDose}
                    onBatchLogDoses={handleBatchLogDoses}
                    onUndoDose={handleUndoDose}
                    onAddCompound={handleAddCompound}
                    onUpdateCompound={handleUpdateCompound}
                    onDeleteCompound={handleDeleteCompound}
                    onImportData={handleImportDatabase}
                    onResetData={handleResetAllData}
                    activeFromLibrary={activeFromLibrary}
                    clearActiveFromLibrary={() => setActiveFromLibrary(null)}
                    onNavigateToTab={navigateTab}
                    labratTheme={labratTheme}
                    visibility={segmentVisibility.planner}
                  />
                  {/* Stats merged into the Cycle tab — runway summary + history */}
                  <StatsView
                    compounds={compounds}
                    logs={logs}
                    onUndoDose={handleUndoDose}
                  />
                </div>
              )}

              {activeTab === 'library' && (
                <PeptideLibrary
                  visibility={segmentVisibility.library}
                  onBackToShop={!hideShop ? () => navigateTab('shop') : undefined}
                  onViewInStore={!hideShop ? (productName) => {
                    safeLocalStorage.setItem('labrat_shop_search_seed', productName);
                    navigateTab('shop');
                  } : undefined}
                />
              )}

              {activeTab === 'shop' && !hideShop && (
                <PricingProvider>
                  <MembersShop onRequestAuth={openAuthModal} onOpenResearch={() => navigateTab('library')} />
                </PricingProvider>
              )}

              {activeTab === 'settings' && (
                <SettingsPage
                  labratTheme={labratTheme}
                  themePreference={themePreference}
                  onThemeChange={applyThemeSelection}
                  user={user}
                  hideShop={hideShop}
                  onToggleHideShop={handleToggleHideShop}
                  experienceMode={experienceMode}
                  onSelectExperience={handleSelectExperience}
                  notificationPermission={notificationPermission}
                  onRequestPermission={requestNotificationPermission}
                  reminderEnabled={reminderEnabled}
                  onReminderToggle={handleReminderToggle}
                  reminderTime={reminderTime}
                  onReminderTimeChange={handleReminderTimeChange}
                  onTestNotification={triggerTestNotification}
                  onSendTestPush={sendBackgroundTestPush}
                  testStatus={testStatus}
                  countdown={countdown}
                  notifications={notifications}
                  onClearAllNotifications={handleClearAllNotifications}
                  onMarkNotificationRead={handleMarkNotificationRead}
                />
              )}
            </motion.div>
          </AnimatePresence>
          </Suspense>
        </div>
      </main>

      {/* Persistent Legal Disclaimer Footer */}
      <footer className="py-6 px-6 border-t border-[#1e293b]/60 bg-[#030712] text-xs text-slate-500 shrink-0 z-10" id="site-footer">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="flex flex-col gap-1.5 text-center lg:text-left">
            <span className="font-semibold text-slate-400">&copy; {new Date().getFullYear()} labrat. Persistent biochemical cycle management registers.</span>
            <p className="text-[10px] text-slate-500 max-w-3xl leading-relaxed">
              <strong>Liability Disclaimer:</strong> labrat is strictly an educational system and laboratory calculator designed for mathematical tracking and raw historical research notation. It contains absolutely zero advice, prescriptions, or clinical diagnostic materials for consuming or compounding substances.
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
              <Compass className="w-3.5 h-3.5 text-slate-600" /> Inspired by labrat standard formats
            </span>
          </div>
        </div>
      </footer>

      <LegalModal open={showLegalModal} onClose={() => setShowLegalModal(false)} />
      <FirstBootThemePicker open={showFirstBootThemePicker} onSelectTheme={applyThemeSelection} />
      <AppearanceModal open={showAppearanceModal} onClose={() => setShowAppearanceModal(false)} currentTheme={themePreference} onSelectTheme={applyThemeSelection} />
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} onNotification={triggerNotification} onSignUpSuccess={(u) => setUser(u as any)} initialMode={authModalMode} />
    </div>
  );
}
