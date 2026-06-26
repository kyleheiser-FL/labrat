import React from 'react';
import {
  CalendarDays,
  Layers,
  BookOpen,
  Settings,
  LogOut,
  LogIn,
  Download,
  FlaskConical,
  ShoppingBag,
  Loader2,
  User as UserProfileIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { triggerHaptic } from '../lib/haptics';

type Tab = 'dashboard' | 'planner' | 'blood' | 'library' | 'shop' | 'settings';

interface AppHeaderProps {
  activeTab: Tab;
  onSetActiveTab: (tab: Tab) => void;
  labratTheme: 'neon' | 'clinical' | 'clinical-light';
  user: User | null;
  authLoading: boolean;
  isStandalone: boolean;
  onInstallApp: () => void;
  onSignOut: () => void;
  onSignInClick: () => void;
  hideShop: boolean;
  trackingEnabled: boolean;
  tabBadges?: { dashboard: number; notifications: number };
}

export default function AppHeader({
  activeTab,
  onSetActiveTab,
  labratTheme,
  user,
  authLoading,
  isStandalone,
  onInstallApp,
  onSignOut,
  onSignInClick,
  hideShop,
  trackingEnabled,
  tabBadges,
}: AppHeaderProps) {
  const tabBtn = (tab: Tab, icon: React.ReactNode, label: React.ReactNode, badge?: number) => (
    <button
      onClick={() => { triggerHaptic('light'); onSetActiveTab(tab); }}
      className={`relative flex flex-col min-[480px]:flex-row items-center justify-center text-center gap-1 px-1 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer select-none truncate flex-1 justify-self-stretch ${
        activeTab === tab
          ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]'
          : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]/55'
      }`}
      id={`tab-btn-${tab}`}
    >
      {icon}
      <span className="truncate">{label}</span>
      {badge != null && badge > 0 && (
        <span className={`absolute top-0.5 right-0.5 min-w-[15px] h-[15px] rounded-full flex items-center justify-center px-1 text-[8px] font-black leading-none shadow-md pointer-events-none ${
          activeTab === tab
            ? 'bg-slate-950 text-cyan-400'
            : 'bg-cyan-500 text-slate-950'
        }`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
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
          <div className="flex items-center gap-1.5 sm:gap-2" id="header-indicators-bar">

            {/* Me icon button — only meaningful once tracking features are unlocked */}
            {trackingEnabled && (
              <button
                onClick={() => { triggerHaptic('light'); onSetActiveTab('blood'); }}
                className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                  activeTab === 'blood'
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                    : 'bg-[#0f172a]/60 border-[#1e293b]/50 text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]/50'
                }`}
                aria-label="Me"
                title="Me"
              >
                <UserProfileIcon className="w-4 h-4" />
              </button>
            )}

            {/* Settings button with unread notification badge */}
            <button
              onClick={() => { triggerHaptic('light'); onSetActiveTab('settings'); }}
              className={`relative flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                  : 'bg-[#0f172a]/60 border-[#1e293b]/50 text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]/50'
              }`}
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              {tabBadges && tabBadges.notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-[#030712] animate-pulse" />
              )}
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

            {/* Auth widget */}
            {authLoading ? (
              <div className="flex items-center gap-2 bg-[#0f172a]/60 border border-[#1e293b]/50 py-1.5 px-3 rounded-xl text-xs text-slate-400 font-mono">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="hidden sm:inline">Loading...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-1.5 bg-[#0f172a]/75 border border-[#1e293b]/80 p-1 pl-2 rounded-xl text-xs font-mono">
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-cyan-500/25 bg-cyan-950/45 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="User Profile" className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
                  ) : (
                    <FlaskConical className="w-3.5 h-3.5 text-cyan-400 rotate-12" />
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest leading-none font-bold">labrat Sync</span>
                  <span className="text-cyan-400 font-bold max-w-[100px] truncate mt-0.5 text-xs font-sans tracking-tight" title={user.email || ''}>
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
                className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-extrabold px-3 py-2 rounded-xl text-xs transition duration-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] flex-nowrap cursor-pointer animate-pulse"
                id="google-sign-in"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">Register / Login</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-2 bg-[#0f172a]/60 border border-[#1e293b]/50 py-1.5 px-3 rounded-xl text-xs font-mono">
              <div className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-cyan-500 shadow-[0_0_6px_rgba(34,211,238,0.7)] animate-pulse' : 'bg-amber-500'}`}></div>
              <span className="text-slate-400">Database: </span>
              <span className={user ? 'text-cyan-400 font-bold' : 'text-amber-400'}>
                {user ? 'Cloud Sync Active' : 'Offline Cache'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tab Rail — Shop-first for new visitors; tracking tabs unlock via Settings */}
        {(() => {
          const navTabs: { tab: Tab; icon: React.ReactNode; label: React.ReactNode; badge?: number }[] = [];
          if (trackingEnabled) {
            navTabs.push({ tab: 'dashboard', icon: <CalendarDays className="w-3.5 h-3.5 shrink-0" />, label: <>Daily <span className="hidden sm:inline">Checklist</span></>, badge: tabBadges?.dashboard });
            navTabs.push({ tab: 'planner', icon: <Layers className="w-3.5 h-3.5 shrink-0" />, label: <>Cycle <span className="hidden sm:inline">Architect</span></> });
            navTabs.push({ tab: 'library', icon: <BookOpen className="w-3.5 h-3.5 shrink-0" />, label: <>Compound <span className="hidden sm:inline">Encyclopedia</span></> });
          }
          if (!hideShop) {
            navTabs.push({ tab: 'shop', icon: <ShoppingBag className="w-3.5 h-3.5 shrink-0" />, label: 'Shop' });
          }
          const gridColsClass = navTabs.length <= 1 ? 'grid-cols-1' : navTabs.length === 2 ? 'grid-cols-2' : navTabs.length === 3 ? 'grid-cols-3' : 'grid-cols-4';
          return (
            <nav className={`bg-[#0f172a]/70 border border-[#1e293b]/80 p-1.5 rounded-2xl sm:bg-transparent sm:border-0 sm:rounded-none sm:p-0 grid ${gridColsClass} sm:flex sm:flex-row gap-1.5 w-full overflow-visible`} id="navigation-tabs-rail">
              {navTabs.map(({ tab, icon, label, badge }) => (
                <React.Fragment key={tab}>{tabBtn(tab, icon, label, badge)}</React.Fragment>
              ))}
            </nav>
          );
        })()}
      </div>
    </header>
  );
}
