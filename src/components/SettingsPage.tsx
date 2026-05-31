import React, { useState } from 'react';
import { Palette, Bell, BellRing, Layout, ShieldAlert, Clock, Smartphone, Check, ChevronRight, Settings, Loader2 } from 'lucide-react';
import { SegmentVisibility } from '../types';
import { triggerHaptic } from '../lib/haptics';

interface SettingsPageProps {
  labratTheme: 'neon' | 'clinical';
  onThemeChange: (theme: 'neon' | 'clinical') => void;
  user: any; // Firebase User
  hideShop: boolean;
  onToggleHideShop: (hide: boolean) => void;
  segmentVisibility: SegmentVisibility;
  onSegmentChange: (page: keyof SegmentVisibility, segment: string, value: boolean) => void;
  // Notifications (state/functions lifted from CycleDashboard, live in App.tsx)
  notificationPermission: string;
  onRequestPermission: () => void;
  reminderEnabled: boolean;
  onReminderToggle: (enabled: boolean) => void;
  reminderTime: string;
  onReminderTimeChange: (time: string) => void;
  onTestNotification: () => void;
  testStatus: 'idle' | 'countdown' | 'triggered' | 'denied' | 'unsupported';
  countdown: number;
}

type PageTab = 'dashboard' | 'planner' | 'library' | 'blood';

const PAGE_TABS: { key: PageTab; label: string }[] = [
  { key: 'dashboard', label: 'Daily' },
  { key: 'planner', label: 'Cycle' },
  { key: 'library', label: 'Library' },
  { key: 'blood', label: 'Me' },
];

const SEGMENT_CONFIG: Record<PageTab, { key: string; label: string }[]> = {
  dashboard: [
    { key: 'legalBanner', label: 'Legal Banner' },
    { key: 'schedule', label: 'Dose Schedule' },
    { key: 'history', label: 'Admin Ledger' },
    { key: 'wellness', label: 'Wellness Panel' },
  ],
  planner: [
    { key: 'gantt', label: 'Bio-Timeline Gantt' },
    { key: 'pct', label: 'PCT Advisor' },
    { key: 'dataControls', label: 'Data Controls' },
  ],
  library: [
    { key: 'filters', label: 'Category Filters' },
  ],
  blood: [
    { key: 'dossier', label: 'Health Dossier' },
    { key: 'upload', label: 'Lab Ingestor' },
  ],
};

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
  onThemeChange,
  user,
  hideShop,
  onToggleHideShop,
  segmentVisibility,
  onSegmentChange,
  notificationPermission,
  onRequestPermission,
  reminderEnabled,
  onReminderToggle,
  reminderTime,
  onReminderTimeChange,
  onTestNotification,
  testStatus,
  countdown,
}: SettingsPageProps) {
  const [activePageTab, setActivePageTab] = useState<PageTab>('dashboard');

  const isAdmin = user?.email?.toLowerCase() === 'kyleheiser@gmail.com';

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="labrat-command-hero" id="settings-hero">
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
      <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Appearance</span>
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-4">Theme Selection</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Neon Lab Card */}
          <button
            type="button"
            onClick={() => { triggerHaptic('light'); onThemeChange('neon'); }}
            className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
              labratTheme === 'neon'
                ? 'border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_16px_rgba(34,211,238,0.12)]'
                : 'border-slate-700/50 bg-[#030712]/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* Color swatches */}
                <div className="flex gap-1">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#39ff14] shadow-[0_0_6px_rgba(57,255,20,0.5)]"></span>
                  <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
                </div>
              </div>
              {labratTheme === 'neon' && (
                <span className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-slate-950" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-100">Neon Lab</div>
            <div className="text-xs text-slate-500 mt-0.5">Cyberpunk, immersive, high-energy.</div>
          </button>

          {/* Clinical Dark Card */}
          <button
            type="button"
            onClick={() => { triggerHaptic('light'); onThemeChange('clinical'); }}
            className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
              labratTheme === 'clinical'
                ? 'border-sky-400/60 bg-sky-500/10 shadow-[0_0_16px_rgba(56,189,248,0.1)]'
                : 'border-slate-700/50 bg-[#030712]/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* Color swatches */}
                <div className="flex gap-1">
                  <span className="w-3 h-3 rounded-full bg-sky-400"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                  <span className="w-3 h-3 rounded-full bg-slate-600"></span>
                </div>
              </div>
              {labratTheme === 'clinical' && (
                <span className="w-5 h-5 rounded-full bg-sky-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-slate-950" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-slate-100">Clinical Dark</div>
            <div className="text-xs text-slate-500 mt-0.5">Clean, professional, low-glow.</div>
          </button>
        </div>
      </div>

      {/* Section 2: Page Sections (Segment Visibility) */}
      <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1">
          <Layout className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">Page Layout</span>
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-4">Page Sections</h3>

        {/* Tab Row */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {PAGE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { triggerHaptic('light'); setActivePageTab(tab.key); }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold font-mono transition cursor-pointer ${
                activePageTab === tab.key
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/35'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toggle rows for active tab */}
        <div className="space-y-1">
          {SEGMENT_CONFIG[activePageTab].map((seg) => {
            const pageVisibility = segmentVisibility[activePageTab] as Record<string, boolean>;
            const isEnabled = pageVisibility[seg.key] ?? true;

            return (
              <div
                key={seg.key}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-800/30 transition"
              >
                <span className="text-xs text-slate-300 font-mono">{seg.label}</span>
                <ToggleSwitch
                  enabled={isEnabled}
                  onToggle={() => { triggerHaptic('light'); onSegmentChange(activePageTab, seg.key, !isEnabled); }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Notifications */}
      <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
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
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl text-left">
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

            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl text-left">
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
              className="w-full py-2.5 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 active:bg-cyan-500/30 text-cyan-400 hover:text-cyan-300 border border-cyan-500/25 hover:border-cyan-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              <span>Grant Phone Notification Permission</span>
            </button>
          ) : (
            <div className="bg-[#1e293b]/15 border border-[#1e293b]/45 p-3.5 rounded-xl space-y-3">
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
                    className="bg-[#0f172a] border border-slate-800 text-slate-200 text-xs py-1 px-2.5 rounded-lg focus:outline-none focus:border-cyan-500 text-right font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* Test Simulation Module */}
          <div className="bg-slate-950/40 border border-[#1e293b]/50 p-3 rounded-xl space-y-2.5 text-left">
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
                  <><Bell className="w-3.5 h-3.5 text-slate-400" /><span>Send test alert (5s)</span></>
                )}
              </button>
            </div>

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

      {/* Section 4: Admin (only for kyleheiser@gmail.com) */}
      {isAdmin && (
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
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
