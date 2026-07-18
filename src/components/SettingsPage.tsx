import React, { useState } from 'react';
import { Palette, Bell, BellRing, ShieldAlert, Clock, Smartphone, Check, ChevronRight, Settings, Loader2, Trash2, X, Sparkles, Activity, BookOpen, ShoppingBag } from 'lucide-react';
import { AppNotification } from '../types';
import { ExperienceMode } from '../lib/experience';
import { triggerHaptic } from '../lib/haptics';

type LabRatTheme = 'clinical' | 'clinical-light';
type LabRatThemePreference = 'system' | LabRatTheme;

interface SettingsPageProps {
  labratTheme: LabRatTheme;
  themePreference: LabRatThemePreference;
  onThemeChange: (theme: LabRatThemePreference) => void;
  user: any; // Firebase User
  hideShop: boolean;
  onToggleHideShop: (hide: boolean) => void;
  experienceMode?: ExperienceMode | null;
  onSelectExperience?: (mode: ExperienceMode) => void;
  // Notifications (state/functions lifted from CycleDashboard, live in App.tsx)
  notificationPermission: string;
  onRequestPermission: () => void;
  reminderEnabled: boolean;
  onReminderToggle: (enabled: boolean) => void;
  reminderTime: string;
  onReminderTimeChange: (time: string) => void;
  onTestNotification: () => void;
  onSendTestPush?: () => void;
  testStatus: 'idle' | 'countdown' | 'triggered' | 'denied' | 'unsupported';
  countdown: number;
  // Notification history
  notifications: AppNotification[];
  onClearAllNotifications: () => void;
  onMarkNotificationRead: (id: string) => void;
}

const EXPERIENCES: { mode: ExperienceMode; label: string; desc: string; icon: typeof Sparkles; accent: string; ring: string }[] = [
  { mode: 'store', label: 'Store only', desc: 'Shop and order. No daily tracking tabs.', icon: ShoppingBag, accent: 'text-amber-300', ring: 'border-amber-500/60 bg-amber-500/10 shadow-[0_0_16px_rgba(245,158,11,0.12)]' },
  { mode: 'tracking', label: 'Protocol tracking', desc: 'Daily dosing + Cycle tools for active protocols.', icon: Activity, accent: 'text-cyan-300', ring: 'border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_16px_rgba(34,211,238,0.12)]' },
  { mode: 'research', label: 'Peptide research', desc: 'Compound Research first — learn, then shop or track.', icon: BookOpen, accent: 'text-emerald-300', ring: 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.12)]' },
];

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-cyan-500' : 'bg-slate-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsPage({
  labratTheme,
  themePreference,
  onThemeChange,
  user,
  hideShop,
  onToggleHideShop,
  experienceMode,
  onSelectExperience,
  notificationPermission,
  onRequestPermission,
  reminderEnabled,
  onReminderToggle,
  reminderTime,
  onReminderTimeChange,
  onTestNotification,
  onSendTestPush,
  testStatus,
  countdown,
  notifications,
  onClearAllNotifications,
  onMarkNotificationRead,
}: SettingsPageProps) {
  const isAdmin = user?.email?.toLowerCase() === 'kyleheiser@gmail.com';

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="labrat-command-hero labrat-page-header" id="settings-hero">
        <div className="labrat-command-hero-copy">
          <span className="labrat-command-eyebrow">App Configuration</span>
          <h2>Settings</h2>
          <p>Personalize your LabRat experience — configure theme, notifications, page layouts, and admin controls.</p>
        </div>
        <div className="labrat-command-hero-art">
          <img src="/vitamins_icon.png" alt="" />
        </div>
      </section>

      {/* Section 1: Appearance */}
      <div className="labrat-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Appearance</span>
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-4">Theme Selection</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* System Card */}
          <button
            type="button"
            onClick={() => { triggerHaptic('light'); onThemeChange('system'); }}
            className={`labrat-button-secondary relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
              themePreference === 'system'
                ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_16px_rgba(16,185,129,0.12)]'
                : 'border-slate-700/50 bg-[#030712]/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <Smartphone className="w-5 h-5 text-emerald-300" />
              {themePreference === 'system' && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-slate-950" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-100">Use System</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Matches your phone automatically. Current: {labratTheme === 'clinical-light' ? 'Light' : 'Dark'}.
            </div>
          </button>

          {/* Clinical Dark Card */}
          <button
            type="button"
            onClick={() => { triggerHaptic('light'); onThemeChange('clinical'); }}
            className={`labrat-button-secondary relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
              themePreference === 'clinical'
                ? 'border-sky-400/60 bg-sky-500/10 shadow-[0_0_16px_rgba(56,189,248,0.1)]'
                : 'border-slate-700/50 bg-[#030712]/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1">
                <span className="w-3 h-3 rounded-full bg-sky-400"></span>
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                <span className="w-3 h-3 rounded-full bg-slate-600"></span>
              </div>
              {themePreference === 'clinical' && (
                <span className="w-5 h-5 rounded-full bg-sky-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-slate-950" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-100">Dark</div>
            <div className="text-xs text-slate-500 mt-0.5">OLED black, professional, low-glow.</div>
          </button>

          {/* Clinical Light Card */}
          <button
            type="button"
            onClick={() => { triggerHaptic('light'); onThemeChange('clinical-light'); }}
            className={`labrat-button-secondary relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
              themePreference === 'clinical-light'
                ? 'border-blue-500/60 bg-blue-500/10 shadow-[0_0_16px_rgba(37,99,235,0.12)]'
                : 'border-slate-700/50 bg-[#030712]/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1">
                <span className="w-3 h-3 rounded-full bg-white border border-slate-300"></span>
                <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              </div>
              {themePreference === 'clinical-light' && (
                <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-100">Light</div>
            <div className="text-xs text-slate-500 mt-0.5">White, clean, easy to read.</div>
          </button>
        </div>
      </div>

      {/* Section: Experience */}
      {onSelectExperience && (
        <div className="labrat-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Experience</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mb-4">How you use LabRat</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {EXPERIENCES.map(({ mode, label, desc, icon: Icon, accent, ring }) => {
              const selected = experienceMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { triggerHaptic('light'); onSelectExperience(mode); }}
                  className={`labrat-button-secondary relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selected ? ring : 'border-slate-700/50 bg-[#030712]/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-5 h-5 ${accent}`} />
                    {selected && (
                      <span className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-slate-950" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-slate-100">{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3: Notifications */}
      <div className="labrat-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Notifications</span>
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-4">Device Push Reminders</h3>

        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            When configured, LabRat can dispatch device notification alerts and chemical schedule counters directly to your iOS or Android notification center after home-screen installation.
          </p>

          {/* Quick Status Checks */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="labrat-mini-surface p-2.5 text-left">
              <span className="text-[9px] text-slate-500 block uppercase font-bold">App Environment</span>
              <span className="text-[11px] text-slate-300 font-semibold mt-0.5 flex items-center gap-1.5">
                {typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse"></span>
                    <span>PWA Standalone</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></span>
                    <span>Web Browser</span>
                  </>
                )}
              </span>
            </div>

            <div className="labrat-mini-surface p-2.5 text-left">
              <span className="text-[9px] text-slate-500 block uppercase font-bold">Permission State</span>
              <span className="text-[11px] text-slate-300 font-semibold mt-0.5 flex items-center gap-1.5">
                {notificationPermission === 'granted' ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
                    <span className="text-emerald-400">Granted</span>
                  </>
                ) : notificationPermission === 'denied' ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#f87171]"></span>
                    <span className="text-red-400 font-bold">Blocked</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    <span>Ask Permission</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Request Permission or Toggle Switches */}
          {notificationPermission !== 'granted' ? (
            <button
              type="button"
              onClick={() => { triggerHaptic('medium'); onRequestPermission(); }}
              className="labrat-button-secondary w-full py-2.5 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 active:bg-cyan-500/30 text-cyan-400 hover:text-cyan-300 border border-cyan-500/25 hover:border-cyan-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              <span>Grant Phone Notification Permission</span>
            </button>
          ) : (
            <div className="labrat-mini-surface p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-left space-y-0.5">
                  <span className="text-xs font-bold text-slate-200">Daily Reminder Service</span>
                  <span className="text-[10px] text-slate-500 block font-mono">Dispatches active chemical counters</span>
                </div>
                <ToggleSwitch
                  enabled={reminderEnabled}
                  onToggle={() => { triggerHaptic('light'); onReminderToggle(!reminderEnabled); }}
                />
              </div>

              {reminderEnabled && (
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Reminder Dispatch Time:</span>
                  </span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => { triggerHaptic('light'); onReminderTimeChange(e.target.value); }}
                    className="labrat-input text-xs py-1 px-2.5 text-right font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* Test Simulation Module */}
          <div className="labrat-mini-surface p-3 space-y-2.5 text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block">Simulate Native Reminders</span>
            <p className="text-[10.5px] text-slate-500 leading-normal">
              Locks/backgrounds aren't required to test! Request a delayed alert below, then put your device in your pocket or lock the screen to verify native behavior.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onTestNotification}
                disabled={testStatus === 'countdown'}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                  testStatus === 'countdown'
                    ? 'bg-amber-500/15 border-amber-500/20 text-amber-400 font-mono text-[11px] font-black'
                    : 'bg-[#1e293b] border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                {testStatus === 'countdown' ? (
                  <><Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" /><span>Dispatch in {countdown}s...</span></>
                ) : testStatus === 'triggered' ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-400 font-bold" /><span>Success! Check Notification Center</span></>
                ) : (
                  <><Bell className="w-3.5 h-3.5 text-slate-400" /><span>Local test alert</span></>
                )}
              </button>
            </div>

            {onSendTestPush && (
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={onSendTestPush}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer bg-cyan-500/12 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                >
                  <BellRing className="w-3.5 h-3.5" /><span>Send background test push (from server)</span>
                </button>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-1.5 px-0.5">
                  This asks the server to push your device right now — the real background path. Tap it, then <strong>lock your phone</strong>; the banner should arrive within a few seconds. If it doesn't, it's a device background-restriction (ColorOS battery settings), not the app.
                </p>
              </div>
            )}

            {typeof window !== 'undefined' && !(window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) && (
              <div className="border border-dashed border-cyan-500/10 bg-cyan-950/5 p-2.5 rounded-lg text-[9.5px] leading-relaxed text-slate-500">
                <div className="flex gap-1.5 items-start">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>iOS / Android Instructions:</strong> Standard phone push/local alerts require you to install this app to your Home Screen first! Tap the share/install icon on your phone's browser navigation, click <strong>"Add to Home Screen"</strong>, then reopen the app to activate device reminders.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Notification History */}
      <div className="labrat-card overflow-hidden">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Alert Feed</span>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">Notification History</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); onClearAllNotifications(); }}
                className="flex items-center gap-1.5 text-[10px] text-red-400 hover:text-red-300 transition font-bold cursor-pointer px-2 py-1 rounded-lg hover:bg-red-500/10"
              >
                <Trash2 className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
        </div>

        <div
          className="labrat-notification-scroll divide-y divide-slate-800/70 max-h-[300px] sm:max-h-[380px] overflow-y-auto overscroll-contain pr-1"
          aria-label="Scrollable notification history"
        >
          {notifications.length === 0 ? (
            <div className="py-14 px-4 text-center">
              <Bell className="w-8 h-8 text-slate-700 mx-auto mb-3 opacity-40" />
              <p className="text-xs text-slate-500 font-mono">No notifications yet</p>
              <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                System alerts, sync events, and dose warnings will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const dotColor =
                notif.type === 'success' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]' :
                notif.type === 'warning' ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]' :
                notif.type === 'reminder' ? 'bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.7)]' :
                'bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.7)]';

              return (
                <div
                  key={notif.id}
                  onClick={() => onMarkNotificationRead(notif.id)}
                  className={`px-5 py-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-800/25 ${
                    !notif.isRead ? 'bg-cyan-500/5 border-l-2 border-cyan-500' : 'border-l-2 border-transparent'
                  }`}
                >
                  <div className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-200 truncate">{notif.title}</span>
                      <span className="text-[9px] font-mono text-slate-600 shrink-0">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                    {notif.message && (
                      <p className="text-[10.5px] text-slate-400 leading-snug mt-0.5">{notif.message}</p>
                    )}
                  </div>
                  {!notif.isRead && (
                    <Check className="w-3 h-3 text-cyan-500/60 shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Section 5: Admin (only for kyleheiser@gmail.com) */}
      {isAdmin && (
        <div className="labrat-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Admin</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mb-4">Administrator Controls</h3>

          <div className="space-y-1">
            <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-800/30 transition">
              <div className="text-left space-y-0.5">
                <span className="text-xs font-bold text-slate-200">Shop Tab Visibility</span>
                <span className="text-[10px] text-slate-500 block font-mono">Show the Peptides Shop tab for all users</span>
              </div>
              <ToggleSwitch
                enabled={!hideShop}
                onToggle={() => { triggerHaptic('medium'); onToggleHideShop(!hideShop); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
