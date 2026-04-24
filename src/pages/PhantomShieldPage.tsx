import { useEffect, useRef, useState } from 'react';
import {
  Eye,
  KeyRound,
  Link as LinkIcon,
  Rocket,
  ShieldHalf,
  Terminal,
  UserX,
} from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { useApp } from '@/lib/useApp';
import type { Decoy } from '@/lib/types';
import { cn, formatTime } from '@/lib/utils';
import { usePageTitle } from '@/lib/usePageTitle';

const ICONS: Record<Decoy['id'], typeof ShieldHalf> = {
  'honey-admin': ShieldHalf,
  'fake-aws-key': KeyRound,
  'decoy-login': UserX,
  'honey-token': LinkIcon,
};

function DecoyCard({ d, onOpen }: { d: Decoy; onOpen: (d: Decoy) => void }) {
  const { toggleDecoy } = useApp();
  const Icon = ICONS[d.id];
  return (
    <div
      className={cn(
        'card flex flex-col gap-4 p-5 transition-all',
        d.active && 'border-brand-success/40 shadow-glow-success',
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              d.active
                ? 'bg-brand-success/15 text-brand-success'
                : 'bg-brand-purple/15 text-brand-purple',
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-semibold text-white">{d.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  'relative inline-flex h-1.5 w-1.5 rounded-full',
                  d.active ? 'bg-brand-success animate-pulse-dot' : 'bg-slate-600',
                )}
              />
              <span
                className={cn(
                  'font-medium uppercase tracking-wider',
                  d.active ? 'text-brand-success' : 'text-slate-500',
                )}
              >
                {d.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <Switch checked={d.active} onCheckedChange={() => toggleDecoy(d.id)} />
      </div>
      <div className="space-y-1 rounded-lg border border-border bg-bg-terminal/60 p-3 font-mono text-[12px] text-slate-300">
        {Object.entries(d.meta).map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <span className="min-w-[84px] text-slate-500">{k}:</span>
            <span className="break-all">{v}</span>
          </div>
        ))}
      </div>
      <button onClick={() => onOpen(d)} className="btn-ghost !py-1.5 self-start">
        <Eye className="h-3.5 w-3.5" /> View Logs ({d.logs.length})
      </button>
    </div>
  );
}

function LogsDialog({ d, onClose }: { d: Decoy | null; onClose: () => void }) {
  if (!d) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-2xl p-5 shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold text-white">{d.name} · Access logs</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            ✕
          </button>
        </div>
        {d.logs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-slate-400">
            No access attempts yet. This decoy is waiting for its first visitor.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-bg-terminal text-[10px] uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">IP</th>
                  <th className="px-3 py-2">Location</th>
                  <th className="px-3 py-2">User-Agent</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {d.logs.map((l) => (
                  <tr key={l.id} className="border-t border-border font-mono">
                    <td className="px-3 py-2 text-slate-400">{formatTime(l.timestamp)}</td>
                    <td className="px-3 py-2 text-brand-amber">{l.ip}</td>
                    <td className="px-3 py-2">{l.location}</td>
                    <td className="px-3 py-2 text-slate-300">{l.user_agent}</td>
                    <td className="px-3 py-2 text-brand-danger">{l.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface LiveEvent {
  id: string;
  time: string;
  text: string;
  tone: 'warn' | 'err' | 'ok';
}

const MOCK_EVENTS: Omit<LiveEvent, 'id' | 'time'>[] = [
  { text: 'Honey token accessed — IP 185.220.101.47 — 🇷🇴 Romania', tone: 'err' },
  { text: 'Fake AWS key validation attempt — python-requests/2.31', tone: 'err' },
  { text: 'Decoy /login portal — 3 password attempts — Tor exit', tone: 'warn' },
  { text: 'Honey gist URL crawled — Go-http-client/1.1', tone: 'warn' },
  { text: 'Admin portal probe /admin/backup — 🇷🇺 Russia', tone: 'err' },
  { text: 'Heartbeat — 0 compromises in last 5m', tone: 'ok' },
];

export function PhantomShieldPage() {
  usePageTitle('MirrorTrap — PhantomShield');
  const { decoys, deployAll } = useApp();
  const [open, setOpen] = useState<Decoy | null>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const banner = decoys.every((d) => d.active);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const someActive = decoys.some((d) => d.active);
    if (!someActive) return;
    const int = setInterval(() => {
      const base = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      setEvents((prev) =>
        [
          {
            id: Math.random().toString(36).slice(2),
            time: formatTime(new Date()),
            ...base,
          },
          ...prev,
        ].slice(0, 30),
      );
    }, 3500);
    return () => clearInterval(int);
  }, [decoys]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [events]);

  const activeCount = decoys.filter((d) => d.active).length;

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber">
            <ShieldHalf className="h-3.5 w-3.5" /> PhantomShield
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Deploy decoys. Catch attackers in the act.
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {activeCount} / {decoys.length} decoys active. Any attacker touching these assets is
            instantly surfaced in Alerts.
          </p>
        </div>
        <button onClick={deployAll} className="btn-amber !px-5 !py-3">
          <Rocket className="h-4 w-4" /> DEPLOY ALL
        </button>
      </div>

      {banner ? (
        <div className="card animate-fade-in border-brand-success/50 bg-brand-success/10 p-4 text-sm shadow-glow-success">
          <div className="flex items-center gap-2 text-brand-success">
            <ShieldHalf className="h-4 w-4" />
            <span className="font-bold uppercase tracking-widest">
              PhantomShield Active — 4 decoys deployed
            </span>
          </div>
          <div className="mt-1 text-slate-300">
            Any attacker using these assets will be instantly detected. You\u2019ll see events here,
            and full attacker dossiers in Alerts.
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {decoys.map((d) => (
          <DecoyCard key={d.id} d={d} onOpen={setOpen} />
        ))}
      </div>

      <div className="card p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
            <Terminal className="h-3.5 w-3.5" /> Live Monitoring
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-success animate-pulse-dot" />
            {activeCount > 0 ? 'Listening' : 'Idle — no active decoys'}
          </div>
        </div>
        <div
          ref={scrollRef}
          className="terminal h-[240px] overflow-y-auto"
        >
          {events.length === 0 ? (
            <div className="text-slate-500">
              {activeCount > 0
                ? '> Awaiting first tripwire event…'
                : '> Activate at least one decoy to start monitoring.'}
            </div>
          ) : (
            events.map((e) => (
              <div
                key={e.id}
                className={cn(
                  'animate-slide-in-top',
                  e.tone === 'err' && 'text-brand-danger',
                  e.tone === 'warn' && 'text-brand-amber',
                  e.tone === 'ok' && 'text-brand-success',
                )}
              >
                [{e.time}] {e.text}
              </div>
            ))
          )}
        </div>
      </div>

      <LogsDialog d={open} onClose={() => setOpen(null)} />
    </div>
  );
}
