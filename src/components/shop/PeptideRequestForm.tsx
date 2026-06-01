import React, { useState } from 'react';
import { Send, FlaskConical, CheckCircle, Loader2 } from 'lucide-react';
import { db, auth } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { triggerHaptic } from '../../lib/haptics';

export default function PeptideRequestForm() {
  const [peptideName, setPeptideName] = useState('');
  const [reason, setReason] = useState('');
  const [dosageNotes, setDosageNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!peptideName.trim()) { setError('Please enter a peptide name.'); return; }
    setError('');
    setSubmitting(true);
    triggerHaptic('medium');
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'peptideRequests'), {
        peptideName: peptideName.trim(),
        reason: reason.trim(),
        dosageNotes: dosageNotes.trim(),
        userId: user?.uid || null,
        userEmail: user?.email || null,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setSubmitted(true);
      triggerHaptic('success');
      setPeptideName('');
      setReason('');
      setDosageNotes('');
    } catch (err) {
      console.error('Failed to submit peptide request', err);
      setError('Submission failed. Please try again.');
      triggerHaptic('warning');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-[#0b1329] border border-emerald-500/20 rounded-2xl p-6 text-center">
        <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white mb-1">Request Submitted</h3>
        <p className="text-xs text-slate-400 mb-4">We review all compound requests weekly and update the catalog when supply is confirmed.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 cursor-pointer"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical className="w-4 h-4 text-cyan-400 shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-white">Request a Compound</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Don't see what you need? Submit a sourcing request.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Compound / Peptide Name *</label>
          <input
            type="text"
            value={peptideName}
            onChange={e => setPeptideName(e.target.value)}
            placeholder="e.g. CJC-1295, IGF-1 LR3, Epitalon..."
            className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Reason / Use Case</label>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Recovery, cognitive enhancement, longevity..."
            className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Dosage / Size Notes (optional)</label>
          <input
            type="text"
            value={dosageNotes}
            onChange={e => setDosageNotes(e.target.value)}
            placeholder="e.g. 5mg vials, 2mg, specific concentration..."
            className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        {error && <p className="text-[11px] text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
