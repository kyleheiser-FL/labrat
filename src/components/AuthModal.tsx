import React, { useState } from 'react';
import { ShieldCheck, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { triggerHaptic } from '../lib/haptics';
import { safeLocalStorage } from '../lib/storage';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'reminder', persist?: boolean) => void;
  onSignUpSuccess?: (user: User) => void;
}

export default function AuthModal({ open, onClose, onNotification, onSignUpSuccess }: AuthModalProps) {
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const handleClose = () => {
    setAuthError('');
    onClose();
  };

  const handleForgotPassword = async () => {
    const emailStr = authEmail.trim();
    if (!emailStr) {
      setAuthError('To transition an existing account or reset a password, please type your email address in the input above first.');
      onNotification('Email Required', 'Please enter your email address in the Email field above.', 'warning');
      return;
    }
    try {
      setAuthSubmitting(true);
      await sendPasswordResetEmail(auth, emailStr);
      onNotification('Reset Link Sent', `A password reset link has been dispatched to ${emailStr}.`, 'success');
    } catch (err: any) {
      console.error('Password reset dispatch failed:', err);
      let errMsg = 'Failed to transmit reset email.';
      if (err?.code === 'auth/user-not-found') {
        errMsg = 'No registered profile matching this email was found.';
      } else if (err?.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
      onNotification('Transfer Failed', errMsg, 'warning');
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
        onSignUpSuccess?.({ ...userCredential.user, displayName: usernameStr } as User);
        onNotification('Account Created', `Welcome to labrat, ${usernameStr}! Your secure data sync register has been activated.`, 'success');
        onClose();
        setAuthEmail('');
        setAuthPassword('');
        setAuthUsername('');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, emailStr, passwordStr);
        const activeName = userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'Active Agent';
        onNotification('Login Access Granted', `Welcome back, ${activeName}! Seamlessly restoring secure cloud backups.`, 'success');
        onClose();
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
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        errMsg = 'Incorrect email or password credentials. Please verify your details.';
      } else if (err?.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
      onNotification('Access Error', errMsg, 'warning');
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          id="auth-modal-overlay"
          onClick={handleClose}
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
                  <h4 className="text-sm font-black uppercase tracking-widest font-mono text-cyan-400">labrat Cloud Sync</h4>
                  <p className="text-[10px] text-slate-400 font-medium uppercase font-mono mt-0.5">Secure Authentication Center</p>
                </div>
              </div>
              <button
                onClick={handleClose}
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
                className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${!isSignUpMode ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                id="auth-tab-signin"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); setIsSignUpMode(true); setAuthError(''); }}
                className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${isSignUpMode ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                id="auth-tab-signup"
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUpMode && (
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Laboratory Username / Handle</label>
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
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Email Address</label>
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
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Security Password</label>
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
  );
}
