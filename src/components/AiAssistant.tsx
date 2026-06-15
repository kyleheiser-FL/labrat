import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, ChevronDown } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// All colors hardcoded as inline styles so the light theme CSS variables
// cannot override them — the chat panel is always dark.
const C = {
  panelBg:       '#0b1120',
  headerBg:      'linear-gradient(90deg,#0f172a,#0b1329)',
  headerBorder:  '#1e293b',
  titleText:     '#f1f5f9',
  subtitleText:  '#22d3ee',
  closeIcon:     '#64748b',
  bodyBg:        '#0b1120',
  greetTitle:    '#f1f5f9',
  greetSub:      '#94a3b8',
  starterBg:     '#111827',
  starterBorder: '#164e63',
  starterText:   '#67e8f9',
  userBubbleBg:  'rgba(6,182,212,0.15)',
  userBubbleBdr: 'rgba(6,182,212,0.3)',
  userBubbleTxt: '#e0f2fe',
  aiBubbleBg:    '#1e293b',
  aiBubbleBdr:   '#334155',
  aiBubbleTxt:   '#cbd5e1',
  inputBg:       '#1e293b',
  inputBdr:      '#334155',
  inputTxt:      '#f1f5f9',
  inputPh:       '#475569',
  inputFocusBdr: '#06b6d4',
  divider:       '#1e293b',
  footerTxt:     '#475569',
  errorTxt:      '#f87171',
  errorBg:       'rgba(239,68,68,0.1)',
  errorBdr:      'rgba(239,68,68,0.25)',
  spinnerColor:  '#06b6d4',
  thinkingTxt:   '#64748b',
  gradient:      'linear-gradient(135deg,#06b6d4,#7c3aed)',
  bubbleShadow:  '0 4px 20px rgba(6,182,212,0.45)',
};

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
  const [hoveredStarter, setHoveredStarter] = useState<string | null>(null);
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
      if (!res.ok) {
        const msg = typeof data.error === 'string' ? data.error : (data.error?.message || 'Something went wrong. Try again.');
        throw new Error(msg);
      }
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
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: C.gradient, boxShadow: C.bubbleShadow,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        {open
          ? <ChevronDown style={{ width: 24, height: 24, color: '#fff' }} />
          : <Bot style={{ width: 24, height: 24, color: '#fff' }} />
        }
        {!open && messages.length === 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 14, height: 14, borderRadius: '50%',
            background: '#22d3ee', border: '2px solid #020617',
          }} />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 16, zIndex: 9997,
          width: 'min(380px, calc(100vw - 32px))',
          maxHeight: 'min(520px, calc(100vh - 120px))',
          display: 'flex', flexDirection: 'column',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          border: '1px solid rgba(6,182,212,0.2)',
          background: C.panelBg,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px',
            borderBottom: `1px solid ${C.headerBorder}`,
            background: C.headerBg,
            flexShrink: 0,
          }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.titleText, lineHeight: 1 }}>LABRAT AI</p>
              <p style={{ margin: '3px 0 0', fontSize: 10, color: C.subtitleText, opacity: 0.8 }}>Research Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: C.closeIcon, display: 'flex' }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ textAlign: 'center', paddingTop: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <Bot style={{ width: 20, height: 20, color: '#fff' }} />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.greetTitle }}>Hey! I'm your LABRAT research guide.</p>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: C.greetSub }}>Ask me anything about peptide protocols, mixing, dosing, or how to use the app.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {STARTERS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      onMouseEnter={() => setHoveredStarter(s)}
                      onMouseLeave={() => setHoveredStarter(null)}
                      style={{
                        textAlign: 'left', fontSize: 12, padding: '8px 12px',
                        borderRadius: 12, cursor: 'pointer',
                        border: `1px solid ${hoveredStarter === s ? 'rgba(6,182,212,0.5)' : C.starterBorder}`,
                        background: hoveredStarter === s ? 'rgba(6,182,212,0.08)' : C.starterBg,
                        color: hoveredStarter === s ? '#a5f3fc' : C.starterText,
                        transition: 'all 0.15s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: 6 }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Bot style={{ width: 12, height: 12, color: '#fff' }} />
                  </div>
                )}
                <div style={{
                  maxWidth: '82%', padding: '8px 12px', borderRadius: 12,
                  fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  ...(m.role === 'user' ? {
                    background: C.userBubbleBg,
                    border: `1px solid ${C.userBubbleBdr}`,
                    color: C.userBubbleTxt,
                  } : {
                    background: C.aiBubbleBg,
                    border: `1px solid ${C.aiBubbleBdr}`,
                    color: C.aiBubbleTxt,
                  }),
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot style={{ width: 12, height: 12, color: '#fff' }} />
                </div>
                <div style={{ padding: '8px 12px', background: C.aiBubbleBg, border: `1px solid ${C.aiBubbleBdr}`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Loader2 style={{ width: 12, height: 12, color: C.spinnerColor, animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 12, color: C.thinkingTxt }}>Thinking…</span>
                </div>
              </div>
            )}

            {error && (
              <p style={{ margin: 0, fontSize: 12, color: C.errorTxt, background: C.errorBg, border: `1px solid ${C.errorBdr}`, borderRadius: 10, padding: '8px 12px' }}>{error}</p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${C.divider}`, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask about dosing, mixing, the app…"
              style={{
                flex: 1, background: C.inputBg, border: `1px solid ${C.inputBdr}`,
                borderRadius: 12, padding: '8px 12px', fontSize: 12,
                color: C.inputTxt, outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = C.inputFocusBdr; }}
              onBlur={e => { e.currentTarget.style.borderColor = C.inputBdr; }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              style={{
                width: 34, height: 34, borderRadius: 10, border: 'none',
                background: C.gradient, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, cursor: 'pointer',
                opacity: (!input.trim() || loading) ? 0.35 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <Send style={{ width: 14, height: 14, color: '#fff' }} />
            </button>
          </div>
          <p style={{ margin: '0 0 8px', fontSize: 9, color: C.footerTxt, textAlign: 'center', padding: '0 8px' }}>
            For research purposes only · Not medical advice
          </p>
        </div>
      )}

      {/* keyframe for spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </>
  );
}
