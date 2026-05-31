import { LiveChat } from './components/LiveChat';
import React, { useState, useEffect } from 'react';
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
import CycleDashboard from './components/CycleDashboard';
import CyclePlanner from './components/CyclePlanner';
import PeptideLibrary from './components/PeptideLibrary';
import BloodAnalyzer from './components/BloodAnalyzer';
import MembersShop from './components/MembersShop';
import SettingsPage from './components/SettingsPage';

// Firebase Setup
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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

type LabRatTheme = 'neon' | 'clinical';
type LabRatBranding = 'mascot' | 'wordmark' | 'lr';

const getInitialTheme = (): LabRatTheme => {
  const saved = safeLocalStorage.getItem('labrat_ui_theme');
  return saved === 'clinical' || saved === 'neon' ? saved : 'neon';
};

const getInitialBranding = (): LabRatBranding => {
  const saved = safeLocalStorage.getItem('labrat_in_app_branding');
  return saved === 'mascot' || saved === 'wordmark' || saved === 'lr' ? saved : 'mascot';
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'blood' | 'library' | 'shop' | 'settings'>('dashboard');

  const [labratTheme, setLabratTheme] = useState<LabRatTheme>(getInitialTheme);
  const [labratBranding, setLabratBranding] = useState<LabRatBranding>(getInitialBranding);
  const [showFirstBootThemePicker, setShowFirstBootThemePicker] = useState<boolean>(() => {
    return safeLocalStorage.getItem('labrat_theme_selected') !== 'true';
  });
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);

  const applyThemeSelection = (theme: LabRatTheme) => {
    setLabratTheme(theme);
    setLabratBranding('lr');
    safeLocalStorage.setItem('labrat_in_app_branding', 'lr');
    safeLocalStorage.setItem('labrat_ui_theme', theme);
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
        } else if (lowerTab === 'blood' || lowerTab === 'me') {
          setActiveTab('blood');
        } else if (lowerTab === 'dashboard' || lowerTab === 'checklist') {
          setActiveTab('dashboard');
        }
      }
    }
  }, []);

  // Theme support visual attributes syncing
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
    root.setAttribute('data-labrat-theme', labratTheme);
    root.setAttribute('data-labrat-branding', labratBranding);

    safeLocalStorage.setItem('labrat_theme_mode', 'dark');
    safeLocalStorage.setItem('labrat_ui_theme', labratTheme);
    safeLocalStorage.setItem('labrat_in_app_branding', labratBranding);

    const manifestHref = labratTheme === 'neon' ? '/manifest-neon.json?v=lr-neon-final-20260528-live-refine-v2' : '/manifest-clinical.json?v=lr-clinical-final-20260528-live-refine-v2';
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
      themeMeta.setAttribute('content', labratTheme === 'neon' ? '#020b12' : '#000000');
    }
  }, [labratTheme, labratBranding]);

  // Core authenticated user from Firebase
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Core database states
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);

  // Notifications states
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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

  // Fallback structural safety routing adjustments
  useEffect(() => {
    if (hideShop && activeTab === 'shop') {
      setActiveTab('dashboard');
    }
  }, [hideShop, activeTab]);

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

  const firePhysicalNotification = () => {
    setTestStatus('triggered');
    setTimeout(() => setTestStatus('idle'), 4000);
    const title = '🔬 LabRat Administrator Alert';
    const options = { body: 'Time to record today\'s dosage checklist administrations. Live sync active!', icon: '/vitamins_icon.png', badge: '/vitamins_icon.png', vibrate: [200, 100, 200], tag: 'labrat-reminder-test', renotify: true };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => reg.showNotification(title, options).catch(() => new Notification(title, options))).catch(() => new Notification(title, options));
    } else { new Notification(title, options); }
  };

  const startTestCountdown = () => {
    setTestStatus('countdown'); setCountdown(5);
    const interval = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { clearInterval(interval); firePhysicalNotification(); return 5; } return prev - 1; });
    }, 1000);
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
          const todayStr = new Date().toISOString().split('T')[0];
          const guardKey = `labrat_reminder_fired_${todayStr}`;
          if (safeLocalStorage.getItem(guardKey) !== 'true') { firePhysicalNotification(); safeLocalStorage.setItem(guardKey, 'true'); }
        } catch (e) { console.warn('[Reminder] foreground fire failed', e); }
        schedule();
      }, msUntilNext());
    };
    schedule();
    return () => clearTimeout(timerId);
  }, [reminderEnabled, reminderTime, notificationPermission]);

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

  // Email/Password authentication forms values
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

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
    const manifestHref = labratTheme === 'neon' ? '/manifest-neon.json?v=lr-neon-final-20260528-live-refine-v2' : '/manifest-clinical.json?v=lr-clinical-final-20260528-live-refine-v2';
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
    type: 'info' | 'success' | 'warning' | 'reminder',
    persist: boolean = true
  ) => {
    if (type === 'success') {
      triggerHaptic('success');
    } else if (type === 'warning') {
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
    }, 4500);
  };

  const handleForgotPassword = async () => {
    const emailStr = authEmail.trim();
    if (!emailStr) {
      setAuthError('To transition an existing account or reset a password, please type your email address in the input above first.');
      triggerNotification('Email Required', 'Please enter your email address in the Email field above.', 'warning');
      return;
    }

    try {
      setAuthSubmitting(true);
      await sendPasswordResetEmail(auth, emailStr);
      triggerNotification(
        'Reset Link Sent',
        `A password reset link has been dispatched to ${emailStr}.`,
        'success'
      );
    } catch (err: any) {
      console.error('Password reset dispatch failed:', err);
      let errMsg = 'Failed to transmit reset email.';
      if (err?.code === 'auth/user-not-found') {
        errMsg = 'No registered profile matching this email was found.';
      } else if (err?.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
      triggerNotification('Transfer Failed', errMsg, 'warning');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    triggerHaptic('light');

    const emailStr = authEmail.trim();
    const passwordStr = authPassword.trim();
    const usernameStr = authUsername.trim();

    if (!emailStr || !passwordStr) {
      setAuthError('Please fill in all access credentials fields.');
      setAuthSubmitting(false);
      return;
    }

    if (passwordStr.length < 6) {
      setAuthError('Password validation failed: Must contain at least 6 characters.');
      setAuthSubmitting(false);
      return;
    }

    try {
      safeLocalStorage.setItem('labrat_just_clicked_signin', 'true');

      if (isSignUpMode) {
        if (!usernameStr) {
          setAuthError('Please choose a username for your profile.');
          setAuthSubmitting(false);
          safeLocalStorage.removeItem('labrat_just_clicked_signin');
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, emailStr, passwordStr);
        await updateProfile(userCredential.user, { displayName: usernameStr });
        
        setUser({
          ...userCredential.user,
          displayName: usernameStr
        });

        triggerNotification(
          'Account Created',
          `Welcome to labrat, ${usernameStr}! Your secure data sync register has been activated.`,
          'success'
        );
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
        setAuthUsername('');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, emailStr, passwordStr);
        const activeName = userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'Active Agent';

        triggerNotification(
          'Login Access Granted',
          `Welcome back, ${activeName}! Seamlessly restoring secure cloud backups.`,
          'success'
        );
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (err: any) {
      safeLocalStorage.removeItem('labrat_just_clicked_signin');
      console.error('Email authentication process failed:', err);
      let errMsg = 'Unable to authenticate with provided details.';
      const code = err?.code;
      if (code === 'auth/invalid-email') {
        errMsg = 'Invalid email address syntax.';
      } else if (code === 'auth/email-already-in-use') {
        errMsg = 'This email address is already registered to another active profile.';
      } else if (code === 'auth/weak-password') {
        errMsg = 'The selected password is too weak. Must contain at least 6 characters.';
      } else if (
        code === 'auth/user-not-found' || 
        code === 'auth/wrong-password' || 
        code === 'auth/invalid-credential'
      ) {
        errMsg = 'Incorrect email or password credentials. Please verify your details.';
      } else if (err?.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
      triggerNotification('Access Error', errMsg, 'warning');
    } finally {
      setAuthSubmitting(false);
    }
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

          setCompounds(finalCompounds);
          setLogs(finalLogs);
          setMetrics(migrateMetricsLegacyWeight(finalMetrics));
          setNotifications(filterTransientNotifs(finalNotifs).sort((a,b) => b.timestamp.localeCompare(a.timestamp)));

          safeLocalStorage.setItem('labrat_compounds', JSON.stringify(finalCompounds));
          safeLocalStorage.setItem('labrat_logs', JSON.stringify(finalLogs));
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
        const todayStr = now.toISOString().split('T')[0];
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
    setActiveTab('planner');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div
      className={`min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/35 selection:text-cyan-200 labrat-theme-${labratTheme} labrat-brand-${labratBranding}`}
      id="labrat-app-shell"
    >
      {/* Outer Glow Cyber Ambient Background Highlights */}
      <div className="fixed top-[-100px] left-1/4 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-[#a855f7]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

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
      <header className="sticky top-0 bg-[#030712]/92 backdrop-blur-md border-b border-[#1e293b]/70 py-2.5 px-4 sm:px-6 shrink-0 z-40 shadow-lg" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
          
          <div className="flex flex-row items-center justify-between gap-3">
            {/* Logo Brand Title */}
            <div className="flex items-center gap-2">
              <img
                src={labratTheme === 'neon' ? '/pwa-icons/lr-neon-192.png' : '/pwa-icons/lr-clinical-192.png'}
                alt="labrat logo"
                className={`h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-xl ${
                  labratTheme === 'neon'
                    ? 'drop-shadow-[0_0_16px_rgba(34,211,238,0.55)]'
                    : 'drop-shadow-[0_0_10px_rgba(148,163,184,0.18)]'
                }`}
              />

              <span
                className={`labrat-brand-wordmark text-2xl sm:text-3xl font-black tracking-tighter font-sans uppercase ${
                  labratTheme === 'neon'
                    ? 'bg-gradient-to-r from-[#00d9ff] via-[#1e88ff] to-[#39ff14] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                    : 'text-slate-100'
                }`}
              >
                labrat
              </span>

              <span className="bg-slate-800/80 border border-slate-700/60 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(34,211,238,0.1)] hidden xs:inline-block">
                V2.5
              </span>
            </div>

            {/* User Indicators & Notifications Group */}
            <div className="flex items-center gap-2 sm:gap-3" id="header-indicators-bar">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('settings');
                }}
                className="hidden sm:flex items-center justify-center p-2 rounded-xl border border-[#1e293b]/50 bg-[#0f172a]/60 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/35 hover:bg-cyan-500/10 transition-all cursor-pointer"
                aria-label="Appearance settings"
                title="Appearance settings"
              >
                <Palette className="w-4 h-4" />
              </button>

              {!isStandalone && (
                <button
                  onClick={handleInstallApp}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/25 hover:border-cyan-500/45 rounded-xl transition-all cursor-pointer text-[10px] sm:text-xs font-bold font-mono"
                  id="pwa-install-header-btn"
                  title="Install labrat application"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Install</span>
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
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

                <AnimatePresence>
                  {notificationsOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#020617]/70 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setNotificationsOpen(false)}
                        id="notifications-mobile-backdrop"
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="fixed md:absolute inset-x-4 md:inset-x-auto top-28 md:top-full md:mt-3 md:right-0 md:left-auto mx-auto md:mx-0 w-auto md:w-80 max-w-[350px] bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] md:shadow-2xl overflow-hidden z-50 text-slate-100"
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
                              <span className="text-[9px] font-mono text-slate-600 tracking-normal leading-normal mt-1 block px-2.5">Warnings related to active schedules will be displayed here dynamically.</span>
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div 
                                key={notif.id} 
                                onClick={() => handleMarkNotificationRead(notif.id)}
                                className={`p-3.5 text-left transition-colors duration-200 cursor-pointer hover:bg-slate-800/30 relative ${
                                  !notif.isRead ? 'bg-[#06b6d4]/5 border-l-2 border-cyan-500' : ''
                                }`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className="text-[11px] font-bold text-slate-200 leading-normal">{notif.title}</span>
                                  <span className="text-[8px] font-mono text-slate-500 mt-0.5 select-none shrink-0">
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
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

              {/* Secure Authentication Sync Widget */}
              {authLoading ? (
                <div className="flex items-center gap-2 bg-[#0f172a]/60 border border-[#1e293b]/50 py-1.5 px-3 rounded-xl text-xs text-slate-400 font-mono">
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Loading Secure Keys...</span>
                </div>
              ) : user ? (
                <div className="flex items-center gap-2 bg-[#0f172a]/75 border border-[#1e293b]/80 p-1 pl-2 rounded-xl text-xs font-mono">
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

                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest leading-none font-bold">labrat Sync</span>
                    <span className="text-cyan-400 font-bold max-w-[125px] truncate mt-0.5 text-xs font-sans tracking-tight" title={user.email || ''}>
                      {user.displayName || user.email?.split('@')[0] || 'Active Agent'}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1 bg-[#1e293b] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/30 px-2 py-1 rounded-lg text-[10px] transition font-bold cursor-pointer"
                    id="google-sign-out"
                  >
                    <LogOut className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    <span className="hidden xs:inline">Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { triggerHaptic('light'); setShowAuthModal(true); }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs transition duration-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] flex-nowrap cursor-pointer animate-pulse"
                  id="google-sign-in"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span>Sync / Login</span>
                </button>
              )}

              <div className="hidden lg:flex items-center gap-2 bg-[#0f172a]/60 border border-[#1e293b]/50 py-1.5 px-3 rounded-xl text-xs font-mono">
                <div className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-cyan-500 shadow-[0_0_6px_rgba(34,211,238,0.7)] animate-pulse' : 'bg-amber-500'}`}></div>
                <span className="text-slate-400">Database Status: </span>
                <span className={user ? 'text-cyan-400 font-bold' : 'text-amber-400'}>
                  {user ? 'Firebase Cloud Sync Active' : 'Offline Cache Sandbox'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tab selection Rail Bar */}
          <nav className="bg-[#0f172a]/70 border border-[#1e293b]/80 p-1.5 rounded-2xl grid grid-cols-6 sm:flex sm:flex-row gap-1.5 w-full" id="navigation-tabs-rail">
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('dashboard'); }}
              className={`flex flex-col min-[480px]:flex-row items-center justify-center text-center gap-1 px-1 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer select-none truncate flex-1 justify-self-stretch ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/55'
              }`}
              id="tab-btn-dashboard"
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Daily <span className="hidden sm:inline">Checklist</span></span>
            </button>
            
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('planner'); }}
              className={`flex flex-col min-[480px]:flex-row items-center justify-center text-center gap-1 px-1 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer select-none truncate flex-1 justify-self-stretch ${
                activeTab === 'planner'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/55'
              }`}
              id="tab-btn-planner"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Cycle <span className="hidden sm:inline">Architect</span></span>
            </button>

            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('library'); }}
              className={`flex flex-col min-[480px]:flex-row items-center justify-center text-center gap-1 px-1 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer select-none truncate flex-1 justify-self-stretch ${
                activeTab === 'library'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/55'
              }`}
              id="tab-btn-library"
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Compound <span className="hidden sm:inline">Encyclopedia</span></span>
            </button>

            {!hideShop && (
              <button
                onClick={() => { triggerHaptic('light'); setActiveTab('shop'); }}
                className={`flex flex-col min-[480px]:flex-row items-center justify-center text-center gap-1 px-1 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer select-none truncate flex-1 justify-self-stretch ${
                  activeTab === 'shop'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/55'
                }`}
                id="tab-btn-shop"
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-cyan-300" />
                <span className="truncate">Shop</span>
              </button>
            )}

            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('blood'); }}
              className={`flex flex-col min-[480px]:flex-row items-center justify-center text-center gap-1 px-1 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer select-none truncate flex-1 justify-self-stretch ${
                activeTab === 'blood'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/55'
              }`}
              id="tab-btn-blood"
            >
              <UserProfileIcon className="w-3.5 h-3.5 shrink-0 text-red-300" />
              <span className="truncate">Me</span>
            </button>

            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('settings'); }}
              className={`flex flex-col min-[480px]:flex-row items-center justify-center text-center gap-1 px-1 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer select-none truncate flex-1 justify-self-stretch ${
                activeTab === 'settings'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/55'
              }`}
              id="tab-btn-settings"
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Settings</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Responsive Layout Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 z-10 flex flex-col gap-6 overflow-hidden">
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
                  onDeleteMetric={handleDeleteMetric}
                  onUpdateCompoundDose={handleUpdateCompoundDose}
                  labratTheme={labratTheme}
                  visibility={segmentVisibility.dashboard}
                />
              )}

              {activeTab === 'planner' && (
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
                  onNavigateToTab={setActiveTab}
                  labratTheme={labratTheme}
                  visibility={segmentVisibility.planner}
                />
              )}

              {activeTab === 'blood' && (
                <BloodAnalyzer
                  compounds={compounds}
                  hideShop={hideShop}
                  onToggleHideShop={isHardcompiledAppStore ? undefined : handleToggleHideShop}
                  currentUserEmail={user?.email || null}
                  onOpenAppearance={() => setActiveTab('settings')}
                  visibility={segmentVisibility.blood}
                />
              )}

              {activeTab === 'library' && (
                <PeptideLibrary
                  onAddToCycle={handleAddLibraryItemToCycle}
                  visibility={segmentVisibility.library}
                />
              )}

              {activeTab === 'shop' && !hideShop && (
                <MembersShop />
              )}

              {activeTab === 'settings' && (
                <SettingsPage
                  labratTheme={labratTheme}
                  onThemeChange={applyThemeSelection}
                  user={user}
                  hideShop={hideShop}
                  onToggleHideShop={handleToggleHideShop}
                  segmentVisibility={segmentVisibility}
                  onSegmentChange={handleSegmentChange}
                  notificationPermission={notificationPermission}
                  onRequestPermission={requestNotificationPermission}
                  reminderEnabled={reminderEnabled}
                  onReminderToggle={handleReminderToggle}
                  reminderTime={reminderTime}
                  onReminderTimeChange={handleReminderTimeChange}
                  onTestNotification={triggerTestNotification}
                  testStatus={testStatus}
                  countdown={countdown}
                />
              )}
            </motion.div>
          </AnimatePresence>
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

      {/* Hold-Harmless Indemnification Agreement Modal */}
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

              <div className="bg-[#030712]/60 border border-slate-800 rounded-xl p-4 text-[11px] sm:text-xs text-slate-300 font-mono space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar" id="legal-agreement-scrollbar-panel">
                <div className="space-y-1">
                  <span className="text-rose-400 font-bold tracking-wider block">SECTION 1: NO PROVISION OF MEDICAL ADVICE</span>
                  <p className="leading-normal">
                    The software, compiled libraries, and calculator values generated by the labrat platform are developed entirely for educational, historical tracking, and informational laboratory research purposes. They do not constitute the practice of medicine, nursing, clinical pharmacy, or the professional dispensing of medical services or substances.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-rose-400 font-bold tracking-wider block">SECTION 2: ABSOLUTE INDEMNIFICATION & THE "HOLD HARMLESS" COVENANT</span>
                  <p className="leading-normal">
                    By launching and continuing usage of labrat registers, you unconditionally, irrevocably agree to defend, indemnify, and hold harmless the developers, programmers, publishers, webmasters, hosting agencies, and any parent organizations of labrat from any and all liability, damages, litigation costs, medical fees, physiological damage, or fatalities resulting from any action you take using this program.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-rose-400 font-bold tracking-wider block">SECTION 3: INHERENT EXPERIMENTAL NATURE & RISKS</span>
                  <p className="leading-normal">
                    You explicitly acknowledge that biological research, peptide compounding, research chemicals, and endocrine management are associated with severe medical complications, biological contamination, immunological shock, infection, sepsis, and structural toxicity. All formulations, injection volumes, reconstitutions, and protocols logged are recorded at your own peril and absolute personal risk.
                  </p>
                </div>
              </div>

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

      {/* First Boot Theme Picker */}
      <AnimatePresence>
        {showFirstBootThemePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
            id="first-boot-theme-picker"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#0f172a] border border-cyan-500/20 rounded-2xl p-5 sm:p-7 w-full max-w-lg shadow-2xl relative space-y-5 my-6 text-slate-200"
            >
              <div className="text-center space-y-2">
                <div className="mx-auto h-20 w-20 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_22px_rgba(34,211,238,0.28)]">
                  <img
                    src="/labrat_top_left_logo_transparent.png"
                    alt="labrat"
                    className="h-full w-full object-contain"
                  />
                </div>

                <h2 className="text-2xl font-black tracking-tight">
                  Welcome to labrat
                </h2>

                <p className="text-sm text-slate-400">
                  Choose your preferred experience. You can change this anytime under Me → Appearance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => applyThemeSelection('neon')}
                  className="group text-left rounded-2xl border border-cyan-500/30 bg-[#030712]/70 p-4 hover:border-cyan-400/70 hover:bg-cyan-500/10 transition-all cursor-pointer"
                >
                  <div className="h-28 rounded-xl bg-[radial-gradient(circle_at_top_right,rgba(160,94,255,0.35),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.28),transparent_45%),#050816] border border-cyan-500/20 mb-4 flex items-center justify-center overflow-hidden">
                    <img
                      src="/labrat_top_left_logo_transparent.png"
                      alt="Neon Lab"
                      className="h-20 w-20 object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.45)]"
                    />
                  </div>
                  <h3 className="text-cyan-300 font-black uppercase tracking-wider text-sm">
                    Neon Lab
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Cyberpunk, high-energy, immersive command center.
                  </p>
                </button>

                <button
                  onClick={() => applyThemeSelection('clinical')}
                  className="group text-left rounded-2xl border border-slate-700/70 bg-[#111827]/80 p-4 hover:border-sky-400/60 hover:bg-sky-500/10 transition-all cursor-pointer"
                >
                  <div className="h-28 rounded-xl bg-[#111827] border border-slate-600/60 mb-4 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-2xl bg-[#0b1220] border border-slate-500/60 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-black text-slate-100 tracking-tighter">
                        LR
                      </span>
                    </div>
                  </div>
                  <h3 className="text-slate-100 font-black uppercase tracking-wider text-sm">
                    Clinical Dark
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Clean, professional, low-glow clinical interface.
                  </p>
                </button>
              </div>

              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                This only changes appearance. Your compounds, logs, shop stock, bloodwork analyzer, recommendations, and sync data remain unchanged.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Appearance Settings Modal */}
      <AnimatePresence>
        {showAppearanceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
            id="appearance-settings-overlay"
            onClick={() => setShowAppearanceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#0f172a] border border-slate-700/70 rounded-2xl p-5 sm:p-7 w-full max-w-md shadow-2xl relative space-y-5 my-6 text-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-black tracking-tight">Appearance</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose your labrat experience.
                  </p>
                </div>

                <button
                  onClick={() => setShowAppearanceModal(false)}
                  className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
                  aria-label="Close appearance settings"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Theme
                </span>

                <button
                  onClick={() => applyThemeSelection('neon')}
                  className={`w-full rounded-xl border p-3 text-left transition flex items-center justify-between ${
                    labratTheme === 'neon'
                      ? 'border-cyan-500/60 bg-cyan-500/10'
                      : 'border-slate-800 bg-[#030712]/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="/labrat_top_left_logo_transparent.png"
                      alt="Neon Lab"
                      className="h-9 w-9 object-contain"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-100">Neon Lab Command Center</div>
                      <div className="text-xs text-slate-500">Cyberpunk, immersive, high-energy.</div>
                    </div>
                  </div>
                  {labratTheme === 'neon' && <Check className="w-4 h-4 text-cyan-400" />}
                </button>

                <button
                  onClick={() => applyThemeSelection('clinical')}
                  className={`w-full rounded-xl border p-3 text-left transition flex items-center justify-between ${
                    labratTheme === 'clinical'
                      ? 'border-sky-400/60 bg-sky-500/10'
                      : 'border-slate-800 bg-[#030712]/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#0b1220] border border-slate-600 flex items-center justify-center">
                      <span className="text-sm font-black text-slate-100">LR</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-100">Clinical Dark</div>
                      <div className="text-xs text-slate-500">Clean, professional, low-glow.</div>
                    </div>
                  </div>
                  {labratTheme === 'clinical' && <Check className="w-4 h-4 text-sky-400" />}
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#030712]/50 p-3 text-[11px] text-slate-400 leading-relaxed">
                Only two appearance modes are available: <strong>Neon Lab Command Center</strong> and <strong>Clinical Dark</strong>. Clinical Dark uses the clean LR presentation automatically.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Secure Authentication & Cloud-Sync Modal Dialog */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
            id="auth-modal-overlay"
            onClick={() => setShowAuthModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#0f172a] border border-cyan-500/20 rounded-2xl p-5 sm:p-7 w-full max-w-md shadow-2xl relative space-y-5 my-6 leading-relaxed text-slate-200 font-mono text-left"
              id="auth-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between pb-4 border-b border-[#1e293b]">
                <div className="flex items-start gap-3.5 text-cyan-400">
                  <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest font-mono text-cyan-400">
                      labrat Cloud Sync
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium uppercase font-mono mt-0.5">
                      Secure Authentication Center
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  id="auth-modal-close-icon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex bg-[#030712]/50 border border-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setIsSignUpMode(false); setAuthError(''); }}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isSignUpMode
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="auth-tab-signin"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setIsSignUpMode(true); setAuthError(''); }}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSignUpMode
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  id="auth-tab-signup"
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isSignUpMode && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      Laboratory Username / Handle
                    </label>
                    <input
                      type="text"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      placeholder="e.g. BioChemistRx"
                      className="w-full bg-[#030712]/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 font-mono transition"
                      required={isSignUpMode || undefined}
                      id="auth-input-username"
                    />
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="agent@labrat.io"
                    className="w-full bg-[#030712]/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 font-mono transition"
                    required
                    id="auth-input-email"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                    Security Password
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#030712]/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 font-mono transition"
                    required
                    id="auth-input-password"
                  />
                  {!isSignUpMode && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => { triggerHaptic('light'); handleForgotPassword(); }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 transition hover:underline cursor-pointer"
                        id="auth-btn-forgot-password"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {authError && (
                  <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl text-[11px] text-rose-400 leading-normal flex items-start gap-2" id="auth-error-banner">
                    <span className="shrink-0 font-bold">⚠️</span>
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-800 text-slate-950 font-black rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider font-sans"
                  id="auth-submit-btn"
                >
                  {authSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synchronizing...</span>
                    </>
                  ) : (
                    <span>{isSignUpMode ? 'Establish Account' : 'Authenticate Access'}</span>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
       {activeTab === 'shop' && <LiveChat />}
    </div>
       
  );
}
