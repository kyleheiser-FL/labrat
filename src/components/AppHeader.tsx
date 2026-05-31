import React from 'react';
import {
  CalendarDays,
  Layers,
  BookOpen,
  Settings,
  Bell,
  BellRing,
  LogOut,
  Trash2,
  Check,
  X,
  LogIn,
  Download,
  FlaskConical,
  ShoppingBag,
  Loader2,
  Palette,
  User as UserProfileIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { AppNotification } from '../types';
import { triggerHaptic } from '../lib/haptics';

type Tab = 'dashboard' | 'planner' | 'blood' | 'library' | 'shop' | 'settings';

interface AppHeaderProps {
  activeTab: Tab;
  onSetActiveTab: (tab: Tab) => void;
  labratTheme: 'neon' | 'clinical';
  notifications: AppNotification[];
  notificationsOpen: boolean;
  onSetNotificationsOpen: (open: boolean) => void;
  onClearAllNotifications: () => void;
  onMarkNotificationRead: (id: string) => void;
  user: User | null;
  authLoading: boolean;
  isStandalone: boolean;
  onInstallApp: () => void;
  onSignOut: () => void;
  onSignInClick: () => void;
  hideShop: boolean;
}

export default function AppHeader({
  activeTab,
  onSetActiveTab,
  labratTheme,
  notifications,
  notificationsOpen,
  onSetNotificationsOpen,
  onClearAllNotifications,
  onMarkNotificationRead,
  user,
  authLoading,
  isStandalone,
  onInstallApp,
  onSignOut,
  onSignInClick,
  hideShop,
}: AppHeaderProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const tabBtn = (tab: Tab, icon: React.ReactNode, label: React.ReactNode) => (
    <button
      onClick={() => { triggerHaptic('light'); onSetActiveTab(tab); }}
      className={`flex flex-col min-[480px]:flex-row items-center justify-center text-center gap-1 px-1 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer select-none truncate flex-1 justify-self-stretch ${
        activeTab === tab
          ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
          : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/55'
      }`}
      id={`tab-btn-${tab}`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <header className="sticky top-0 bg-[#030712] backdrop-blur-md border-b border-[#1e293b]/70 py-2.5 px-4 sm:px-6 shrink-0 z-40 shadow-lg" id="app-header">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">

        <div className="flex flex-row items-center justify-between gap-3">
          {/* Logo */}
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

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-3" id="header-indicators-bar">
            <button
              onClick={() => { triggerHaptic('light'); onSetActiveTab('settings'); }}
              className="hidden sm:flex items-center justify-center p-2 rounded-xl border border-[#1e293b]/50 bg-[#0f172a]/60 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/35 hover:bg-cyan-500/10 transition-all cursor-pointer"
              aria-label="Appearance settings"
              title="Appearance settings"
            >
              <Palette className="w-4 h-4" />
            </button>

            {!isStandalone && (
              <button
                onClick={onInstallApp}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/25 hover:border-cyan-500/45 rounded-xl transition-all cursor-pointer text-[10px] sm:text-xs font-bold font-mono"
                id="pwa-install-header-btn"
                title="Install labrat application"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Install</span>
              </button>
            )}

            {/* Notifications bell */}
            <div className="relative">
              <button
                onClick={() => onSetNotificationsOpen(!notificationsOpen)}
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
                      onClick={() => onSetNotificationsOpen(false)}
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
                              onClick={onClearAllNotifications}
                              className="text-[10px] text-red-400 hover:text-red-300 transition flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Clear all
                            </button>
                          )}
                          <button
                            onClick={() => onSetNotificationsOpen(false)}
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
                              onClick={() => onMarkNotificationRead(notif.id)}
                              className={`p-3.5 text-left transition-colors duration-200 cursor-pointer hover:bg-slate-800/30 relative ${!notif.isRead ? 'bg-[#06b6d4]/5 border-l-2 border-cyan-500' : ''}`}
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

            {/* Auth widget */}
            {authLoading ? (
              <div className="flex items-center gap-2 bg-[#0f172a]/60 border border-[#1e293b]/50 py-1.5 px-3 rounded-xl text-xs text-slate-400 font-mono">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>Loading Secure Keys...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 bg-[#0f172a]/75 border border-[#1e293b]/80 p-1 pl-2 rounded-xl text-xs font-mono">
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-cyan-500/25 bg-cyan-950/45 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User Profile" className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
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
                  onClick={onSignOut}
                  className="flex items-center gap-1 bg-[#1e293b] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/30 px-2 py-1 rounded-lg text-[10px] transition font-bold cursor-pointer"
                  id="google-sign-out"
                >
                  <LogOut className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  <span className="hidden xs:inline">Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { triggerHaptic('light'); onSignInClick(); }}
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

        {/* Navigation Tab Rail */}
        <nav className="bg-[#0f172a]/70 border border-[#1e293b]/80 p-1.5 rounded-2xl sm:bg-transparent sm:border-0 sm:rounded-none sm:p-0 grid grid-cols-6 sm:flex sm:flex-row gap-1.5 w-full" id="navigation-tabs-rail">
          {tabBtn('dashboard', <CalendarDays className="w-3.5 h-3.5 shrink-0" />, <>Daily <span className="hidden sm:inline">Checklist</span></>)}
          {tabBtn('planner', <Layers className="w-3.5 h-3.5 shrink-0" />, <>Cycle <span className="hidden sm:inline">Architect</span></>)}
          {tabBtn('library', <BookOpen className="w-3.5 h-3.5 shrink-0" />, <>Compound <span className="hidden sm:inline">Encyclopedia</span></>)}
          {!hideShop && tabBtn('shop', <ShoppingBag className="w-3.5 h-3.5 shrink-0 text-cyan-300" />, 'Shop')}
          {tabBtn('blood', <UserProfileIcon className="w-3.5 h-3.5 shrink-0 text-red-300" />, 'Me')}
          {tabBtn('settings', <Settings className="w-3.5 h-3.5 shrink-0" />, 'Settings')}
        </nav>
      </div>
    </header>
  );
}
