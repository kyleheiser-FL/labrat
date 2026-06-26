import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function UpdateBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    window.addEventListener('labrat-update-ready', show);
    return () => window.removeEventListener('labrat-update-ready', show);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-3 px-4 py-2.5 bg-cyan-500 text-slate-950 shadow-lg"
      role="alert"
      id="update-banner"
    >
      <div className="flex items-center gap-2 text-xs font-bold">
        <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin" />
        <span>New version available — reload to update</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => window.location.reload()}
          className="bg-slate-950 text-cyan-400 hover:bg-slate-900 text-[11px] font-black px-3 py-1 rounded-lg transition cursor-pointer"
        >
          Reload Now
        </button>
        <button
          onClick={() => setVisible(false)}
          className="p-1 hover:bg-cyan-400/20 rounded-lg transition cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
