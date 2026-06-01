import React, { useState, useEffect } from 'react';
import { Activity, History, Weight, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DailyMetric } from '../types';
import { triggerHaptic } from '../lib/haptics';

interface WellnessTrackerProps {
  metrics: DailyMetric[];
  onSaveMetrics?: (metric: DailyMetric) => void;
  onDeleteMetric?: (date: string) => void;
}

export default function WellnessTracker({ metrics, onSaveMetrics, onDeleteMetric }: WellnessTrackerProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [wellnessDate, setWellnessDate] = useState(todayStr);
  const [weight, setWeight] = useState('');
  const [mood, setMood] = useState(3);
  const [fatigue, setFatigue] = useState(3);
  const [sideEffects, setSideEffects] = useState('');
  const [metricNotes, setMetricNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const m = metrics.find(item => item.date === wellnessDate);
    if (m) {
      setWeight(m.weightLb ? m.weightLb.toString() : '');
      setMood(m.mood || 3);
      setFatigue(m.fatigue || 3);
      setSideEffects(m.sideEffects || '');
      setMetricNotes(m.notes || '');
    } else {
      setWeight(''); setMood(3); setFatigue(3); setSideEffects(''); setMetricNotes('');
    }
  }, [wellnessDate]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveMetrics) return;
    onSaveMetrics({ date: wellnessDate, weightLb: weight ? parseFloat(weight) : undefined, mood, fatigue, sideEffects: sideEffects.trim(), notes: metricNotes.trim() });
    triggerHaptic('success');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md" id="wellness-form-card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Wellness & Biomarkers</h4>
          </div>
          <input
            type="date"
            value={wellnessDate}
            onChange={(e) => setWellnessDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 font-mono cursor-pointer"
            id="wellness-date-picker"
          />
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Body Weight</span>
              <span className="text-[10px] font-mono text-slate-500">Lbs</span>
            </label>
            <div className="flex gap-2 items-center bg-[#1e293b]/45 border border-slate-700/60 rounded-xl pr-3">
              <input
                type="number" step="0.1" value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 180"
                className="w-full bg-transparent border-0 rounded-l-xl py-2.5 px-3.5 text-sm text-slate-200 focus:outline-none"
                id="wellness-weight-input"
              />
              <Weight className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Core Mood Indicator</span>
              <span className="text-[11px] text-indigo-400 font-bold font-mono">Score: {mood}/5</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(num => (
                <button key={num} type="button" onClick={() => setMood(num)}
                  className={`py-2 px-1 text-center font-mono rounded-lg border text-sm transition-all cursor-pointer ${mood === num ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50 scale-105' : 'bg-[#1e293b]/25 border-slate-800 text-slate-400'}`}>
                  {num === 1 ? '🙁 1' : num === 2 ? '😐 2' : num === 3 ? '🙂 3' : num === 4 ? '😊 4' : '🤩 5'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Physical Energy / Fatigue Level</span>
              <span className="text-[11px] text-indigo-400 font-bold font-mono">Score: {fatigue}/5</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(num => (
                <button key={num} type="button" onClick={() => setFatigue(num)}
                  className={`py-2 px-1 text-center font-mono rounded-lg border text-sm transition-all cursor-pointer ${fatigue === num ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50 scale-105' : 'bg-[#1e293b]/25 border-slate-800 text-slate-400'}`}>
                  {num === 1 ? '😴 1' : num === 2 ? '🥱 2' : num === 3 ? '💪 3' : num === 4 ? '⚡ 4' : '🔥 5'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Transient Side Effects (Allergies, Nausea, Site Sting)</label>
            <input type="text" value={sideEffects} onChange={(e) => setSideEffects(e.target.value)}
              placeholder="List any reactions or symptoms..."
              className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80"
              id="wellness-side-effects-input" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Journal Notes</label>
            <textarea value={metricNotes} onChange={(e) => setMetricNotes(e.target.value)}
              placeholder="Insert focus points, sleep measurements, diet changes..."
              className="w-full h-20 bg-[#1e293b]/45 border border-slate-700/60 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80"
              id="wellness-notes-textarea" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/60">
            <span className="text-[10px] text-slate-500 font-mono">Date: {wellnessDate}</span>
            {saveSuccess && <span className="text-emerald-400 text-[11px] font-semibold">✓ Metric Journal Recorded</span>}
            <button type="submit"
              className="py-2 px-4 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/10"
              id="submit-wellness-btn">
              Save Journal Entry
            </button>
          </div>
        </form>
      </div>

      {/* Body Weight Trend Chart */}
      {(() => {
        const weightEntries = metrics
          .filter(m => m.weightLb && m.weightLb > 0)
          .slice().sort((a, b) => a.date.localeCompare(b.date))
          .slice(-30);
        if (weightEntries.length < 2) return null;
        const weights = weightEntries.map(m => m.weightLb!);
        const minW = Math.min(...weights);
        const maxW = Math.max(...weights);
        const range = maxW - minW || 1;
        const chartH = 60;
        const chartW = 100;
        const pts = weightEntries.map((m, i) => {
          const x = (i / (weightEntries.length - 1)) * chartW;
          const y = chartH - ((m.weightLb! - minW) / range) * chartH;
          return `${x},${y}`;
        }).join(' ');
        const firstW = weights[0];
        const lastW = weights[weights.length - 1];
        const delta = lastW - firstW;
        const trendColor = delta < -0.5 ? '#34d399' : delta > 0.5 ? '#f87171' : '#94a3b8';
        const TrendIcon = delta < -0.5 ? TrendingDown : delta > 0.5 ? TrendingUp : Minus;
        return (
          <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Weight className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Weight Trend</h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: trendColor }}>
                <TrendIcon className="w-3.5 h-3.5" />
                <span>{lastW} lbs</span>
                <span className="text-[10px] font-mono opacity-70">({delta > 0 ? '+' : ''}{delta.toFixed(1)} lbs / {weightEntries.length} entries)</span>
              </div>
            </div>
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-14" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={trendColor} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={trendColor} stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,${chartH} ${pts} ${chartW},${chartH}`}
                fill="url(#wGrad)"
              />
              <polyline
                points={pts}
                fill="none"
                stroke={trendColor}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {weightEntries.map((m, i) => {
                const x = (i / (weightEntries.length - 1)) * chartW;
                const y = chartH - ((m.weightLb! - minW) / range) * chartH;
                return <circle key={i} cx={x} cy={y} r="1.2" fill={trendColor} />;
              })}
            </svg>
            <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1">
              <span>{weightEntries[0].date.slice(5)}</span>
              <span>{weightEntries[weightEntries.length - 1].date.slice(5)}</span>
            </div>
          </div>
        );
      })()}

      <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md" id="metrics-ledger-card">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-indigo-400" />
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Historical Biomarker Ledger</h4>
        </div>
        {/* Trend Alerts */}
        {(() => {
          const recent = metrics.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
          if (recent.length < 3) return null;
          const alerts: { color: string; msg: string }[] = [];
          const moodVals = recent.filter(m => m.mood).map(m => m.mood!);
          const fatigueVals = recent.filter(m => m.fatigue).map(m => m.fatigue!);
          const weightVals = recent.filter(m => m.weightLb).map(m => m.weightLb!);
          if (moodVals.length >= 3) {
            const avg = moodVals.reduce((a, b) => a + b, 0) / moodVals.length;
            if (avg < 2.5) alerts.push({ color: 'rose', msg: `Low mood average (${avg.toFixed(1)}/5) over last ${moodVals.length} entries — monitor closely.` });
            else if (avg >= 4.3) alerts.push({ color: 'emerald', msg: `Strong mood trend (${avg.toFixed(1)}/5) — feeling good lately.` });
          }
          if (fatigueVals.length >= 3) {
            const avg = fatigueVals.reduce((a, b) => a + b, 0) / fatigueVals.length;
            if (avg < 2.5) alerts.push({ color: 'amber', msg: `Below average energy (${avg.toFixed(1)}/5) — check sleep, nutrition, and recovery.` });
          }
          if (weightVals.length >= 3) {
            const delta = weightVals[0] - weightVals[weightVals.length - 1];
            if (delta > 5) alerts.push({ color: 'amber', msg: `Weight down ${delta.toFixed(1)} lbs over last ${weightVals.length} entries.` });
            else if (delta < -5) alerts.push({ color: 'blue', msg: `Weight up ${Math.abs(delta).toFixed(1)} lbs over last ${weightVals.length} entries.` });
          }
          if (alerts.length === 0) return null;
          return (
            <div className="mb-4 space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className={`text-[11px] px-3 py-2 rounded-lg border font-medium ${
                  a.color === 'rose' ? 'bg-rose-500/8 border-rose-500/20 text-rose-300' :
                  a.color === 'amber' ? 'bg-amber-500/8 border-amber-500/20 text-amber-300' :
                  a.color === 'emerald' ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-300' :
                  'bg-blue-500/8 border-blue-500/20 text-blue-300'
                }`}>
                  {a.color === 'rose' ? '⚠️' : a.color === 'amber' ? '⚡' : a.color === 'emerald' ? '✓' : 'ℹ️'} {a.msg}
                </div>
              ))}
            </div>
          );
        })()}

        <div className="space-y-3" id="wellness-ledgers-list">
          {metrics.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-6">Your daily biometrics ledger is empty. Save some measurements above to list logs.</p>
          ) : (
            metrics.slice().reverse().slice(0, 5).map(m => (
              <div key={m.date} className="bg-[#1e293b]/20 border border-slate-800/80 p-3.5 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between items-center font-mono font-bold text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>{m.date}</span>
                    {onDeleteMetric && (
                      <button type="button" onClick={() => { triggerHaptic('warning'); onDeleteMetric(m.date); }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer rounded" title="Delete entry">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {m.weightLb && <span className="text-cyan-400">Weight: {m.weightLb} Lbs</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px] font-mono">
                  <span>Mood: {Array(m.mood).fill('⭐').join('') || '—'}</span>
                  <span>Energy: {Array(m.fatigue).fill('⚡').join('') || '—'}</span>
                </div>
                {m.sideEffects && <div className="text-[10px] text-rose-300 font-mono"><strong>Reaction:</strong> {m.sideEffects}</div>}
                {m.notes && <p className="text-[11px] text-slate-400 italic">&ldquo;{m.notes}&rdquo;</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
