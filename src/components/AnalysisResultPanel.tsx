import React from 'react';
import { FileText, Activity, AlertTriangle, CheckCircle, ShieldAlert, UserPlus, UserMinus, Clock } from 'lucide-react';
import { AnalysisResult } from '../lib/bloodAnalyzerTypes';

interface AnalysisResultPanelProps {
  result: AnalysisResult;
  resultsRef: React.RefObject<HTMLDivElement>;
}

function getStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'CRITICAL':
      return { bg: 'bg-red-500/10 border-red-500/30 text-red-400', indicator: 'bg-red-500', text: 'text-red-400', progressColor: 'bg-red-500' };
    case 'ELEVATED':
    case 'HIGH':
      return { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', indicator: 'bg-amber-500', text: 'text-amber-400', progressColor: 'bg-amber-500' };
    case 'DEPRESSED':
    case 'LOW':
      return { bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400', indicator: 'bg-sky-500', text: 'text-sky-400', progressColor: 'bg-sky-500' };
    default:
      return { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', indicator: 'bg-emerald-400', text: 'text-emerald-400', progressColor: 'bg-emerald-500' };
  }
}

export default function AnalysisResultPanel({ result, resultsRef }: AnalysisResultPanelProps) {
  const impactText = result.actionableDirectives.cycleTimelineImpact.toLowerCase();
  const verdictStyle = impactText.includes('end') || impactText.includes('stop') || impactText.includes('critical')
    ? 'bg-red-500/10 border border-red-500/25 text-red-400'
    : impactText.includes('taper') || impactText.includes('adjust')
      ? 'bg-amber-500/10 border border-amber-500/25 text-amber-400'
      : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400';

  return (
    <div ref={resultsRef} className="space-y-6 pt-2" id="blood-report-results-dashboard">
      <div className="border border-red-500/20 bg-red-900/5 p-3 rounded-2xl flex items-start gap-3 text-left" id="results-disclaimer-card">
        <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] font-mono font-bold text-red-400 block tracking-wider uppercase">Systemic Biological Disclaimer</span>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{result.disclaimer}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        <div className="col-span-1 lg:col-span-4 space-y-6 text-left">
          <div className="bg-[#0f172a]/95 border border-[#1e293b]/85 rounded-3xl p-5 space-y-3.5" id="verdict-banner-card">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">SYSTEMIC CYCLE TIMELINE IMPACT</span>
            <div className={`p-4 rounded-2xl flex items-start gap-3.5 ${verdictStyle}`} id="timeline-verdict-box">
              <div className="p-2 rounded-xl bg-black/40 h-fit shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider block">Engine Timeline Verdict</span>
                <p className="text-xs leading-relaxed font-semibold mt-1">{result.actionableDirectives.cycleTimelineImpact}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5">
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-wider flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" /> Start Support Formulations
                </span>
                <div className="space-y-1.5">
                  {result.actionableDirectives.toStart.map((item, i) => (
                    <div key={i} className="bg-slate-950/40 border border-slate-800 p-2.5 rounded-xl flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-300 leading-normal font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                  <UserMinus className="w-3.5 h-3.5 text-red-400" /> Cessation / Modification List
                </span>
                <div className="space-y-1.5">
                  {result.actionableDirectives.toStopOrModify.map((item, i) => (
                    <div key={i} className="bg-slate-950/40 border border-slate-800 p-2.5 rounded-xl flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-300 leading-normal font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a]/95 border border-[#1e293b]/85 rounded-3xl p-5 space-y-4" id="biomarkers-grid-card">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="w-4.5 h-4.5 text-red-400" />
              <span className="text-sm font-bold text-slate-200">Parsed Clinical Marker Audit</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.markers.map((marker, i) => {
                const style = getStatusStyle(marker.status);
                return (
                  <div key={i} className="bg-slate-950/30 border border-slate-800 hover:border-slate-700/80 p-4 rounded-2xl space-y-3 transition flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{marker.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Ref Range: {marker.range}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${style.bg}`}>{marker.status}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className={`text-base font-extrabold tracking-tight ${style.text}`}>{marker.value} <span className="text-xs font-mono font-medium text-slate-500">{marker.unit}</span></span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${style.progressColor}`} style={{ width: marker.status === 'NORMAL' ? '45%' : marker.status === 'ELEVATED' ? '80%' : marker.status === 'CRITICAL' ? '96%' : '15%' }} />
                      </div>
                    </div>
                    <p className="text-[10.5px] text-slate-400 leading-normal pt-1 border-t border-slate-900/80">{marker.explanation}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2 text-left" id="clinical-narrative-panel">
          <div className="bg-[#0f172a]/95 border border-[#1e293b]/85 rounded-3xl p-5 space-y-4 h-full flex flex-col">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-4.5 h-4.5 text-red-400" />
              <span className="text-sm font-bold text-slate-200">Clinical Biological Review</span>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-3.5 flex-1 overflow-y-auto max-h-[500px] pr-1.5 custom-scrollbar" id="clinical-report-markdown-block">
              {result.markdownReport.split('\n\n').map((para, i) => {
                const trimmed = para.trim();
                if (!trimmed) return null;
                if (trimmed.startsWith('#')) {
                  const level = trimmed.match(/^#+/)?.[0].length || 1;
                  const text = trimmed.replace(/^#+\s*/, '');
                  return <h4 key={i} className={`font-semibold text-slate-100 font-sans tracking-tight ${level === 1 ? 'text-sm font-extrabold border-b border-slate-800 pb-1 mt-4 text-red-300' : 'text-xs mt-3 text-slate-200'}`}>{text}</h4>;
                }
                if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                  return (
                    <ul key={i} className="space-y-1.5 pl-3 list-disc text-slate-400">
                      {trimmed.split('\n').map((li, j) => <li key={j} className="leading-relaxed">{li.replace(/^[-*]\s*/, '')}</li>)}
                    </ul>
                  );
                }
                return <p key={i} className="leading-relaxed text-slate-400">{trimmed}</p>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
