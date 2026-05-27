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
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Compound, DoseLog, DailyMetric, LibraryItem, AppNotification } from './types';
import { triggerHaptic } from './lib/haptics';
import { safeLocalStorage } from './lib/storage';
import CycleDashboard from './components/CycleDashboard';
import CyclePlanner from './components/CyclePlanner';
import PeptideLibrary from './components/PeptideLibrary';
import BloodAnalyzer from './components/BloodAnalyzer';
import MembersShop from './components/MembersShop';

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

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'blood' | 'library' | 'shop'>('dashboard');

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

  // Theme support (runs once initially to enforce high-contrast cyber dark mode)
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
    safeLocalStorage.setItem('labrat_theme_mode', 'dark');
  }, []);

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

  // App Store Compliance mode to hide the "Shop" tab
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

  // Handle active tab fallback if shop is globally hidden
  useEffect(() => {
    if (hideShop && activeTab === 'shop') {
      setActiveTab('dashboard');
    }
  }, [hideShop, activeTab]);

  const handleToggleHideShop = async (hide: boolean) => {
    if (isHardcompiledAppStore) return; // Prevent change if locked at build-time
    try {
      setHideShop(hide);
      safeLocalStorage.setItem('labrat_hide_shop', hide ? 'true' : 'false');

      // Sync globally with Firestore for all users
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

  // PWA Setup & Home-Screen Install Prompt registers
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Email & Password Auth States
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
        'LabRat is now integrated on your active device home screen.',
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
    // Dispatch instant smartphone tactile vibration feedback
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

    // Spark animated screen toast alert
    setActiveToasts(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== newNotif.id));
    }, 4500);
  };

  // Password Reset / Account Transition Trigger Actions
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
        `A password reset/transition link has been dispatched to ${emailStr}. Click the email link to easily set a password for your account.`,
        'success'
      );
    } catch (err: any) {
      console.error('Password reset dispatch failed:', err);
      let errMsg = 'Failed to transmit reset email.';
      if (err?.code === 'auth/user-not-found') {
        errMsg = 'No registered profile matching this email was found. You can easily create a new account instead.';
      } else if (err?.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
      triggerNotification('Transfer Failed', errMsg, 'warning');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // Email and Password Auth Actions
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
      // Prior to sign up / validation, mark sign-in flag to merge offline user cache sandbox
      safeLocalStorage.setItem('labrat_just_clicked_signin', 'true');

      if (isSignUpMode) {
        if (!usernameStr) {
          setAuthError('Please choose a username for your profile.');
          setAuthSubmitting(false);
          safeLocalStorage.removeItem('labrat_just_clicked_signin');
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, emailStr, passwordStr);
        await updateProfile(userCredential.user, {
          displayName: usernameStr
        });
        
        // Feed updated user parameters instantly into active session
        setUser({
          ...userCredential.user,
          displayName: usernameStr
        });

        triggerNotification(
          'Account Created',
          `Welcome to LabRat, ${usernameStr}! Your secure data sync register has been activated.`,
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
      // Clear all memory states to prevent cross-user residue leaks
      setCompounds([]);
      setLogs([]);
      setMetrics([]);
      setNotifications([]);

      // Clear all local storage caches of the logged-out session
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
          const localCompounds = safeLocalStorage.getItem('labrat_compounds');
          const localLogs = safeLocalStorage.getItem('labrat_logs');
          const localMetrics = safeLocalStorage.getItem('labrat_metrics');
          const localNotifications = safeLocalStorage.getItem('labrat_notifications');

          const pLocals = localCompounds ? JSON.parse(localCompounds) : [];
          const pLogs = localLogs ? JSON.parse(localLogs) : [];
          const pMetrics = localMetrics ? JSON.parse(localMetrics) : [];
          const pNotifs = localNotifications ? JSON.parse(localNotifications) : [];

          // Seamless transition check: If user cloud records are 100% empty, upload current offline data to avoid data loss!
          const hasOfflineRecords = pLocals.length > 0 && !(pLocals.length === SEED_COMPOUNDS.length && pLocals[0]?.id === SEED_COMPOUNDS[0]?.id);
          const hasInitFlag = safeLocalStorage.getItem('labrat_compounds_initialized') === 'true';
          
          let finalCompounds = cCompounds;
          let finalLogs = cLogs;
          let finalMetrics = cMetrics;
          let finalNotifs = cNotifs;

          // Detect if this session transition just initiated from a Google Auth trigger button
          const justClickedSignIn = safeLocalStorage.getItem('labrat_just_clicked_signin') === 'true';
          safeLocalStorage.removeItem('labrat_just_clicked_signin');

          if (justClickedSignIn) {
            // First time Google register linking / guest transitioning to professional sync: Merge guest parameters with cloud
            if (cCompounds.length === 0) {
              // Cloud backing is completely empty; preserve and sync unique client sandbox data
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
              // Cloud already holds custom registers. Intelligently merge only new, un-tracked offline logs or configurations
              const syncedCompounds = [...cCompounds];
              for (const localComp of pLocals) {
                const inCloud = cCompounds.some(c => c.id === localComp.id);
                if (!inCloud && localComp.id !== 'seed-bpc-157' && localComp.id !== 'seed-ghk-cu') {
                  syncedCompounds.push(localComp);
                  await saveUserCompound(currentUser.uid, localComp).catch(e => console.error('Auto-sync layout err:', e));
                }
              }
              finalCompounds = syncedCompounds;

              const syncedLogs = [...cLogs];
              for (const localLog of pLogs) {
                const inCloud = cLogs.some(l => l.id === localLog.id);
                if (!inCloud) {
                  syncedLogs.push(localLog);
                  await saveUserLog(currentUser.uid, localLog).catch(e => console.error('Auto-sync logger err:', e));
                }
              }
              finalLogs = syncedLogs;

              const syncedMetrics = [...cMetrics];
              for (const localMetric of pMetrics) {
                const inCloud = cMetrics.some(m => m.date === localMetric.date);
                if (!inCloud) {
                  syncedMetrics.push(localMetric);
                  await saveUserMetric(currentUser.uid, localMetric).catch(e => console.error('Auto-sync metrics err:', e));
                }
              }
              finalMetrics = syncedMetrics;

              const syncedNotifs = [...cNotifs];
              for (const localNotif of pNotifs) {
                const inCloud = cNotifs.some(n => n.id === localNotif.id);
                if (!inCloud) {
                  syncedNotifs.push(localNotif);
                  await saveUserNotification(currentUser.uid, localNotif).catch(e => console.error('Auto-sync flags err:', e));
                }
              }
              finalNotifs = syncedNotifs;

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
            // Re-visiting active user session or reloading app on alternative device (tablet, etc.): 
            // The Google Cloud database is the absolute master. Overwrite stale local caches.
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

          // Real-time double cache alignment keeps local storage and cloud perfectly mirrors
          safeLocalStorage.setItem('labrat_compounds', JSON.stringify(finalCompounds));
          safeLocalStorage.setItem('labrat_logs', JSON.stringify(finalLogs));
          safeLocalStorage.setItem('labrat_metrics', JSON.stringify(finalMetrics));
          safeLocalStorage.setItem('labrat_notifications', JSON.stringify(finalNotifs));
        } catch (err) {
          console.error('Error fetching user registers during sync:', err);
          triggerNotification('Sync Interruption', 'Failed fetching cloud records. Cache fallback activated.', 'warning', false);
          
          // Robust client-side LocalStorage fallback under slow network/timeouts
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
        // Fallback to strict client-side LocalStorage
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
      // Mark as successfully compiled and mounted in the browser context to clear watchdog timers
      if (typeof window !== 'undefined') {
        (window as any).__LABRAT_MOUNTED__ = true;
      }
    });

    return () => unsubscribe();
  }, []);

   // Automated background reminder system for installed phone PWA matches
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

          // Get counts of items scheduled for today
          const activeCompounds = JSON.parse(safeLocalStorage.getItem('labrat_compounds') || '[]');
          const logsToday = JSON.parse(safeLocalStorage.getItem('labrat_logs') || '[]');
          
          // Count compounds scheduled for today
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
            // Check if already logged today
            const alreadyLogged = logsToday.some((l: any) => l.compoundId === comp.id && l.date === todayStr);
            return isDue && !alreadyLogged;
          }).length;

          if (countScheduled > 0) {
            const title = '🔬 LabRat Checklist Reminder';
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

    // Run check initially and every 30 seconds
    checkDailyReminders();
    const interval = setInterval(checkDailyReminders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle syncing state changes based on current auth layer helper
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
        triggerNotification('Cloud Sync Interruption', 'Terminated compound removed locally but cloud delete failed. Will retry on next state synchronisation.', 'warning');
      });
    }
    triggerNotification('Compound Terminated', `${targetComp?.name || 'Substance'} removed from active schedule queues.`, 'warning');
  };

  // Synchronize/adjust a compound's start date based on its earliest logged dose
  const syncCompoundStartDate = (compoundId: string, currentLogs: DoseLog[]) => {
    const compLogs = currentLogs.filter(l => l.compoundId === compoundId);
    if (compLogs.length === 0) return;

    // Find the earliest date
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
    
    // Auto-adjust start date based on the first dose added
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
    
    // Auto-adjust start date based on the first dose added
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

  // Notification action controls
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
      <header className="sticky top-0 bg-[#030712]/92 backdrop-blur-md border-b border-[#1e293b]/70 py-2.5 px-4 sm:px-6 shrink-0 z-40 shadow-lg" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
          
          {/* Top Row: Brand Header and Indicators */}
          <div className="flex flex-row items-center justify-between gap-3">
{/* Logo Brand Title */}
<div className="flex items-center gap-2">
  {labratBranding === 'mascot' && (
    <img
      src="/labrat_top_left_logo_transparent.png"
      alt="LabRat logo"
      className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-[0_0_14px_rgba(34,211,238,0.45)]"
    />
  )}

  {labratBranding === 'lr' && (
    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[#0b1220] border border-slate-600/70 flex items-center justify-center shadow-[0_0_14px_rgba(148,163,184,0.16)]">
      <span className="text-lg sm:text-xl font-black tracking-tighter text-slate-100">
        LR
      </span>
    </div>
  )}

  <span
    className={`labrat-brand-wordmark text-2xl sm:text-3xl font-black tracking-tighter font-sans uppercase ${
      labratTheme === 'neon'
        ? 'bg-gradient-to-r from-[#00c5f5] via-[#2176ff] to-[#a05eff] bg-clip-text text-transparent'
        : 'text-slate-100'
    }`}
  >
    LABRAT
  </span>

  <span className="bg-slate-800/80 border border-slate-700/60 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(34,211,238,0.1)] hidden xs:inline-block">
    V2.5
  </span>
</div>

            {/* User Indicators & Notifications Group */}
            <div className="flex items-center gap-2 sm:gap-3" id="header-indicators-bar">
              
              {/* Install PWA Button */}
              {!isStandalone && (
                <button
                  onClick={handleInstallApp}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/25 hover:border-cyan-500/45 rounded-xl transition-all cursor-pointer text-[10px] sm:text-xs font-bold font-mono"
                  id="pwa-install-header-btn"
                  title="Install LabRat application"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Install</span>
                </button>
              )}

              {/* Notification Bell Badge Trigger Button */}
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

                {/* Notification Popover Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <>
                      {/* Responsive Backdrop on Mobile Viewports to dismiss the tray naturally */}
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

              {/* Google Authentication Component Widget */}
              {authLoading ? (
                <div className="flex items-center gap-2 bg-[#0f172a]/60 border border-[#1e293b]/50 py-1.5 px-3 rounded-xl text-xs text-slate-400 font-mono">
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Loading Secure Keys...</span>
                </div>
              ) : user ? (
                <div className="flex items-center gap-2 bg-[#0f172a]/75 border border-[#1e293b]/80 p-1 pl-2 rounded-xl text-xs font-mono">
                  {/* User Avatar Circle */}
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
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest leading-none font-bold">LabRat Sync</span>
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

              {/* Quick Status Indicators */}
              <div className="hidden lg:flex items-center gap-2 bg-[#0f172a]/60 border border-[#1e293b]/50 py-1.5 px-3 rounded-xl text-xs font-mono">
                <div className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-cyan-500 shadow-[0_0_6px_rgba(34,211,238,0.7)] animate-pulse' : 'bg-amber-500'}`}></div>
                <span className="text-slate-400">Database Status: </span>
                <span className={user ? 'text-cyan-400 font-bold' : 'text-amber-400'}>
                  {user ? 'Firebase Cloud Sync Active' : 'Offline Cache Sandbox'}
                </span>
              </div>

            </div>
          </div>

          {/* Navigation Tab selection Rail Bar (Static, always sticky, inside header) */}
          <nav className="bg-[#0f172a]/70 border border-[#1e293b]/80 p-1.5 rounded-2xl grid grid-cols-5 sm:flex sm:flex-row gap-1.5 w-full" id="navigation-tabs-rail">
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
          </nav>

        </div>
      </header>

      {/* Main Responsive Layout Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 z-10 flex flex-col gap-6 overflow-hidden">


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
                  onDeleteMetric={handleDeleteMetric}
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
                />
              )}

              {activeTab === 'blood' && (
                <BloodAnalyzer
                  compounds={compounds}
                  hideShop={hideShop}
                  onToggleHideShop={isHardcompiledAppStore ? undefined : handleToggleHideShop}
                  currentUserEmail={user?.email || null}
                />
              )}



              {activeTab === 'library' && (
                <PeptideLibrary
                  onAddToCycle={handleAddLibraryItemToCycle}
                />
              )}

              {activeTab === 'shop' && !hideShop && (
                <MembersShop />
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
                    Install LabRat
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
              {/* Header Title Accent */}
              <div className="flex items-start justify-between pb-4 border-b border-[#1e293b]">
                <div className="flex items-start gap-3.5 text-cyan-400">
                  <div className="p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest font-mono text-cyan-400">
                      LabRat Cloud Sync
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

              {/* Mode Selection Tabs Selector */}
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

              {/* Input Forms */}
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
                        Forgot Password / Transition Google Login?
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

              {/* Developer / Owner Config & Account Transfer Notice */}
              <div className="bg-[#030712]/40 border border-[#1e293b] p-3.5 rounded-xl space-y-2 text-[10px] leading-relaxed text-slate-400 text-left">
                <div>
                  <span className="text-cyan-400 font-bold block uppercase tracking-wider text-[10.5px]">🔄 Transitioning from Google?</span>
                  <p className="mt-1">
                    If you originally signed in using Google, simply type your email address above, leave the password blank, and click the <strong>&quot;Forgot Password / Transition Google Login&quot;</strong> link. A secure password setup link will be dispatched directly to your inbox so you can login with your password.
                  </p>
                </div>
                <div className="border-t border-slate-900 pt-2 text-[9.5px]">
                  <span className="text-slate-400 font-bold block uppercase tracking-wider">🔐 Setup Integration Guide</span>
                  <p className="mt-0.5">
                    Ensure the <strong>Email/Password</strong> provider is enabled in Firebase Console (Authentication &rarr; Sign-in method).
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

