import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, Shield, Sparkles, X } from 'lucide-react';
import { useApp } from '@/lib/useApp';
import { cn } from '@/lib/utils';

let _msgCounter = 0;
function nextId(prefix: string): string {
  _msgCounter += 1;
  return `${prefix}_${_msgCounter}`;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

const SUGGESTIONS = [
  'What does my ARS score mean?',
  'Which threat is most urgent?',
  'How does PhantomShield work?',
  'What is my biggest risk right now?',
  'How does MirrorTrap compare to antivirus?',
];

interface Ctx {
  arsScore: number;
  criticalCount: number;
  activeDecoys: number;
  alertsToday: number;
  lastDomain: string;
  topFinding: string;
}

function buildFallback(prompt: string, ctx: Ctx): string {
  const p = prompt.toLowerCase();
  if (/(ars|score)/.test(p)) {
    return `Your ARS score of ${ctx.arsScore} means an attacker could reach your systems in roughly ${Math.max(1, Math.round(9 - ctx.arsScore / 14))}h using only public data. Scores above 70 are critical and need immediate action — start with "${ctx.topFinding}".`;
  }
  if (/(phantomshield|decoy|honey)/.test(p)) {
    return `PhantomShield deploys ${ctx.activeDecoys || 4} fake assets that look real to attackers. When they touch one we instantly capture their IP, tools, and next move — before they reach anything that matters.`;
  }
  if (/(alert|attack|tripwire)/.test(p)) {
    return `You've had ${ctx.alertsToday} tripwire${ctx.alertsToday === 1 ? '' : 's'} fire today. Each one confirms an attacker actively touched a decoy — so they were targeting ${ctx.lastDomain || 'your domain'}, not just crawling the internet. Check the attack path to see what they tried next.`;
  }
  if (/(compare|antivirus|edr|vs\.|versus)/.test(p)) {
    return 'Antivirus protects after malware is inside. MirrorTrap stops attackers before they ever find the right door — by poisoning their reconnaissance map and firing a tripwire the moment they touch a fake asset.';
  }
  if (/(enterprise|protect|autonomous|shield)/.test(p)) {
    return 'Enterprise activates autonomous defense: MirrorTrap fights back automatically, neutralising threats in ~0.3s, 24/7, with no human in the loop. You still see every event, but you never have to respond to one at 3am.';
  }
  if (/(urgent|biggest|risk|priority|first)/.test(p)) {
    return `The most urgent item right now is "${ctx.topFinding}". Fix that first — ${ctx.criticalCount} critical finding${ctx.criticalCount === 1 ? '' : 's'} contribute${ctx.criticalCount === 1 ? 's' : ''} the bulk of your ARS ${ctx.arsScore}.`;
  }
  if (/(hello|hi|hey)/.test(p)) {
    return `Hi! Your current posture: ARS ${ctx.arsScore}, ${ctx.criticalCount} critical finding${ctx.criticalCount === 1 ? '' : 's'}, ${ctx.activeDecoys} decoy${ctx.activeDecoys === 1 ? '' : 's'} live, ${ctx.alertsToday} tripwire${ctx.alertsToday === 1 ? '' : 's'} today. Ask me anything about it.`;
  }
  return `Great question. Based on your scan of ${ctx.lastDomain || 'your domain'}, the most urgent action is "${ctx.topFinding}". Want me to explain what that means and how to fix it?`;
}

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

async function callAnthropic(
  history: ChatMessage[],
  userMsg: string,
  ctx: Ctx,
): Promise<string | null> {
  if (!ANTHROPIC_KEY) return null;
  try {
    const system = `You are MirrorTrap AI, a cybersecurity expert assistant embedded in the MirrorTrap platform. You help users understand their security posture, explain threats, and guide them to take action.

Current context about this user:
- Latest scan ARS score: ${ctx.arsScore}
- Critical findings: ${ctx.criticalCount}
- Active decoys: ${ctx.activeDecoys}
- Alerts today: ${ctx.alertsToday}
- Company domain: ${ctx.lastDomain}
- Top finding: ${ctx.topFinding}

Be concise, expert, and action-oriented. Max 3 sentences per response unless the user asks for detail. Always relate answers to their specific data above. Recommend PhantomShield or Enterprise upgrade when relevant but don't be pushy. Use plain English, no jargon without explanation.`;
    const messages = [
      ...history.map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      })),
      { role: 'user', content: userMsg },
    ];
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 400,
        system,
        messages,
      }),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const txt = j.content?.find((b) => b.type === 'text')?.text;
    return txt?.trim() || null;
  } catch {
    return null;
  }
}

export function ChatAssistant() {
  const { latestScan, alerts, decoys } = useApp();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'starter',
      role: 'ai',
      text:
        "👋 Hello! I'm MirrorTrap AI. I can answer questions about your security posture, explain any alert or finding, and help you understand your risk. What would you like to know?",
    },
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const ctx: Ctx = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const alertsToday = alerts.filter((a) => new Date(a.timestamp) >= todayStart).length;
    const critical = (latestScan?.findings ?? []).filter((f) => f.severity === 'CRITICAL').length;
    const top =
      latestScan?.findings?.find((f) => f.severity === 'CRITICAL')?.title ??
      latestScan?.findings?.[0]?.title ??
      'run a scan to surface your top risk';
    return {
      arsScore: latestScan?.ars_score ?? 0,
      criticalCount: critical,
      activeDecoys: decoys.filter((d) => d.active).length,
      alertsToday,
      lastDomain: latestScan?.domain ?? '',
      topFinding: top,
    };
  }, [latestScan, alerts, decoys]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, messages, busy]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const userMsg: ChatMessage = {
      id: nextId('u'),
      role: 'user',
      text: trimmed,
    };
    const history = [...messages, userMsg];
    setMessages(history);
    setDraft('');
    setBusy(true);
    const aiText =
      (await callAnthropic(messages, trimmed, ctx)) ?? buildFallback(trimmed, ctx);
    // Small realism delay (already possibly spent on API).
    await new Promise((r) => setTimeout(r, 450));
    setMessages((prev) => [
      ...prev,
      { id: nextId('a'), role: 'ai', text: aiText },
    ]);
    setBusy(false);
  };

  return (
    <>
      {/* Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ask MirrorTrap AI"
        title="Ask MirrorTrap AI"
        className={cn(
          'group fixed bottom-6 right-6 z-[9999] inline-flex h-14 w-14 items-center justify-center rounded-full border border-brand-purple/60 bg-brand-purple text-white shadow-[0_0_28px_rgba(127,119,221,0.55)] transition-transform hover:scale-105',
          open && 'rotate-45',
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border border-[#0D0B1A] bg-brand-amber px-1 text-[10px] font-bold text-[#0D0B1A] animate-pulse">
            1
          </span>
        ) : null}
        {!open ? (
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md border border-border bg-[#1A1730]/95 px-2 py-1 text-[11px] text-slate-200 opacity-0 transition-opacity group-hover:opacity-100">
            Ask MirrorTrap AI
          </span>
        ) : null}
      </button>

      {/* Window */}
      {open ? (
        <div className="fixed bottom-24 right-6 z-[9999] flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-brand-purple/40 bg-[#1A1730] shadow-[0_25px_80px_rgba(0,0,0,0.6)] animate-slide-up">
          <div className="flex items-center gap-3 border-b border-border bg-bg-terminal/60 px-4 py-3">
            <Shield className="h-4 w-4 text-brand-purple" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">MirrorTrap AI Assistant</div>
              <div className="flex items-center gap-1.5 text-[10px] text-brand-success">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-success animate-pulse" />
                Online · context-aware
              </div>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm"
          >
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-purple/90 px-3 py-2 text-white shadow">
                    {m.text}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex items-start gap-2">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand-purple/40 bg-bg-terminal">
                    <Shield className="h-3 w-3 text-brand-purple" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-border bg-bg-terminal/60 px-3 py-2 text-slate-100">
                    {m.text}
                  </div>
                </div>
              ),
            )}
            {busy ? (
              <div className="flex items-center gap-2">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand-purple/40 bg-bg-terminal">
                  <Shield className="h-3 w-3 text-brand-purple" />
                </div>
                <div className="flex gap-1 rounded-2xl border border-border bg-bg-terminal/60 px-3 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-purple [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-purple [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-purple [animation-delay:240ms]" />
                </div>
              </div>
            ) : null}

            {messages.length === 1 && !busy ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-full border border-brand-purple/30 bg-brand-purple/10 px-2.5 py-1 text-[11px] text-brand-purple transition-colors hover:border-brand-purple/60 hover:bg-brand-purple/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            className="flex items-center gap-2 border-t border-border bg-bg-terminal/60 px-3 py-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              void send(draft);
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-purple" />
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about your security posture…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || busy}
              className="rounded-md border border-brand-purple/40 bg-brand-purple/20 p-1.5 text-brand-purple transition-colors hover:bg-brand-purple/30 disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
