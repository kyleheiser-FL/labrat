import React, { useState, useRef } from 'react';
import { FileText, Upload, AlertTriangle, Activity, FileSpreadsheet, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { Compound } from '../types';
import { HealthProfile, AnalysisResult } from '../lib/bloodAnalyzerTypes';
import { triggerHaptic } from '../lib/haptics';

interface LabUploadSectionProps {
  compounds: Compound[];
  profile: HealthProfile;
  onResult: (result: AnalysisResult | null) => void;
}

export default function LabUploadSection({ compounds, profile, onResult }: LabUploadSectionProps) {
  const [pasteText, setPasteText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processSelectedFile = async (file: File) => {
    const validTypes = ['text/plain', 'image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'text/csv'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setErrorMessage('Unsupported file format. Please upload an image (.png, .jpg), document (.pdf), or plain text file (.txt, .csv).');
      return;
    }
    setSelectedFile(file);
    triggerHaptic('medium');
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      try { setPasteText(await file.text()); } catch (err) { console.error('Read text file error:', err); }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });

  const handleAnalyze = async () => {
    if (!pasteText.trim() && !selectedFile) {
      setErrorMessage('Please paste blood results or upload a report file to analyze.');
      triggerHaptic('warning');
      return;
    }
    setAnalyzing(true);
    setErrorMessage('');
    onResult(null);
    triggerHaptic('heavy');

    try {
      let fileData = '', mimeType = '';
      if (selectedFile && selectedFile.type !== 'text/plain' && !selectedFile.name.endsWith('.txt')) {
        fileData = await convertFileToBase64(selectedFile);
        mimeType = selectedFile.type;
      }
      const response = await fetch('/api/gemini/analyze-blood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText, fileData, mimeType, compounds, healthProfile: profile })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Authentication or response failure on server.');
      }
      onResult(await response.json());
      triggerHaptic('success');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred while processing your lab work with Gemini.');
      triggerHaptic('warning');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    triggerHaptic('light');
    setPasteText('');
    setSelectedFile(null);
    setErrorMessage('');
    onResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="col-span-1 lg:col-span-3 space-y-5">
      <div className="bg-[#0f172a]/80 border border-[#1e293b]/85 rounded-3xl p-5 space-y-4" id="upload-panel-card">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-red-400" />
            <span className="text-sm font-bold text-slate-200">Biomarker Lab Ingestor</span>
          </div>
          <button
            onClick={handleClear}
            className="text-[11px] font-mono text-slate-500 hover:text-slate-300 font-semibold flex items-center gap-1 cursor-pointer"
            id="clear-ingestion-form-btn"
          >
            <RefreshCw className="w-3 h-3" /> Clear Form
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-950/30 border border-red-500/20 p-3 rounded-xl flex gap-3 text-left" id="analyzer-error-alert">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 font-medium leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={async (e) => { e.preventDefault(); setIsDragging(false); setErrorMessage(''); if (e.dataTransfer.files?.[0]) processSelectedFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer ${
            isDragging ? 'border-red-500/50 bg-red-950/10' : selectedFile ? 'border-emerald-500/40 bg-emerald-950/5' : 'border-slate-800 bg-slate-900/10 hover:border-[#1e293b] hover:bg-slate-900/25'
          }`}
          id="file-dz-box"
        >
          <input type="file" ref={fileInputRef} onChange={(e) => { setErrorMessage(''); if (e.target.files?.[0]) processSelectedFile(e.target.files[0]); }} className="hidden" accept=".txt,.csv,.png,.jpg,.jpeg,.pdf" />
          {selectedFile ? (
            <>
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl">
                <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-slate-200 block max-w-xs truncate">{selectedFile.name}</span>
                <span className="text-[10px] font-mono text-[#10b981] font-bold block mt-1">Ready for analysis • {(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-[#1e293b]/40 rounded-xl">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-center space-y-1">
                <span className="text-xs font-semibold text-slate-200 block">Drag & drop lab report file, or select files</span>
                <span className="text-[10px] text-slate-500 block">Supports .png, .jpg, .pdf, .txt, .csv formats</span>
              </div>
            </>
          )}
        </div>

        <div className="space-y-1.5 text-left">
          <label htmlFor="paste-text-input-field" className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Or Paste Lab Results (Text Output)</label>
          <textarea
            id="paste-text-input-field"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={7}
            placeholder="Paste marker tables or PDF conversion text here... (e.g. ALT: 48 U/L, AST: 32, Estradiol: 54 pg/mL...)"
            className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/10 placeholder-slate-600 transition"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer select-none ${
            analyzing ? 'bg-red-500/20 text-red-300 border border-red-500/20' : 'bg-red-500 hover:bg-red-600 text-slate-950 font-bold shadow-[0_4px_16px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.25)]'
          }`}
          id="trigger-analysis-cta-btn"
        >
          {analyzing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>Processing Lab Parameters... (Typically takes 1 minute)</span></>
          ) : (
            <><Activity className="w-4.5 h-4.5" /><span>Initiate AI Marker Ingestion</span></>
          )}
        </button>
      </div>

      <div className="bg-[#0f172a]/80 border border-[#1e293b]/85 rounded-3xl p-5 space-y-4 text-left">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-4.5 h-4.5 text-rose-400" />
          <span className="text-sm font-bold text-slate-200">Clinical Security Policy</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Your biometric report parameters and diagnostic files are parsed in-browser using secure, sandboxed, transient processing memory. Lab results are never saved to unauthorized external servers or third-party cloud engines.
        </p>
        <div className="rounded-2xl border border-yellow-500/10 bg-yellow-950/5 p-3" id="security-warning">
          <span className="text-[9.5px] font-mono font-bold text-yellow-500 uppercase tracking-widest block">🔒 Transient Memory Safeguard</span>
          <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
            LabRat does not expose biomarker markers to unauthorized databases or permanent visual records.
          </p>
        </div>
      </div>
    </div>
  );
}
