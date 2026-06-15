import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, ChevronDown } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTERS = [
  'How much Retatrutide should I start with?',
  'How do I mix BPC-157?',
  'What solvent do I use for IGF-1 LR3?',
  'How do I calculate syringe units?',
];

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    setError(null);
    const next: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open LABRAT AI Assistant"
        className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%)', boxShadow: '0 4px 20px rgba(6,182,212,0.45)' }}
      >
        {open
          ? <ChevronDown className="w-6 h-6 text-white" />
          : <Bot className="w-6 h-6 text-white" />
        }
        {!open && messages.length === 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-slate-950 animate-pulse" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-4 z-[9997] w-[min(380px,calc(100vw-32px))] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/20"
          style={{ background: '#0b1120', maxHeight: 'min(520px, calc(100vh - 120px))' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-800" style={{ background: 'linear-gradient(90deg, #0f172a, #0b1329)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-none">LABRAT AI</p>
              <p className="text-[10px] text-cyan-400/70 mt-0.5">Research Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5" style={{ minHeight: 0 }}>
            {messages.length === 0 && (
              <div className="flex flex-col gap-3">
                <div className="text-center pt-2">
                  <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-2" style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-white">Hey! I'm your LABRAT research guide.</p>
                  <p className="text-xs text-slate-400 mt-1">Ask me anything about peptide protocols, mixing, dosing, or how to use the app.</p>
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  {STARTERS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-xs px-3 py-2 rounded-xl border border-cyan-500/20 text-cyan-300/80 hover:border-cyan-400/40 hover:text-cyan-200 hover:bg-cyan-500/5 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mr-1.5 mt-0.5 self-start" style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}>
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-cyan-500/15 border border-cyan-500/25 text-cyan-50'
                      : 'bg-slate-800/70 border border-slate-700/50 text-slate-200'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}>
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="px-3 py-2 bg-slate-800/70 border border-slate-700/50 rounded-xl flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span className="text-xs text-slate-400">Thinking…</span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-slate-800 flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask about dosing, mixing, the app…"
              className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#7c3aed)' }}
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <p className="text-[9px] text-slate-600 text-center pb-2 px-2">For research purposes only · Not medical advice</p>
        </div>
      )}
    </>
  );
}
