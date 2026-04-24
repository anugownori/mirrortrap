import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  FileText,
  Fingerprint,
  Ghost,
  Layers,
  Lock,
  Shield,
  ShieldCheck,
  ShieldOff,
  Zap,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Switch } from '@/components/ui/Switch';
import { useApp } from '@/lib/useApp';
import { CardSpotlight } from '@/components/ui/CardSpotlight';
import { usePageTitle } from '@/lib/usePageTitle';
import { cn, formatTime } from '@/lib/utils';
import type { ThreatEvent, ThreatStatus } from '@/lib/types';

const STATUS_TONE: Record<ThreatStatus, string> = {
  NEUTRALIZED: 'bg-brand-success/15 text-brand-success border-brand-success/40',
  BLOCKED: 'bg-brand-danger/15 text-brand-danger border-brand-danger/40',
  DECEIVED: 'bg-brand-purple/15 text-brand-purple border-brand-purple/40',
  TRACKED: 'bg-brand-amber/15 text-brand-amber border-brand-amber/40',
  POISONED: 'bg-brand-purple/15 text-brand-purple border-brand-purple/40',
};

const KIND_TONE: Record<ThreatEvent['severity'], string> = {
  CRITICAL: 'bg-brand-danger/20 text-brand-danger border-brand-danger/50',
  HIGH: 'bg-brand-amber/20 text-brand-amber border-brand-amber/50',
  MEDIUM: 'bg-brand-purple/20 text-brand-purple border-brand-purple/50',
};

const COUNTERMEASURES: Array<{
  icon: typeof Shield;
  name: string;
  body: string;
}> = [
  {
    icon: Shield,
    name: 'IP Blacklisting',
    body: 'Automatically blacklists attacker IPs the moment a honey token fires. Shares with global threat-intel database.',
  },
  {
    icon: Ghost,
    name: 'Intel Poisoning',
    body: 'Serves fake employee data, fake API responses, and fake credentials to attackers doing OSINT. Their entire research file becomes useless.',
  },
  {
    icon: Layers,
    name: 'Decoy Escalation',
    body: 'When an attacker probes deeper, MirrorTrap spins up additional decoy layers — fake databases, fake internal tools — to trap them longer.',
  },
  {
    icon: Fingerprint,
    name: 'Behavioral Fingerprinting',
    body: 'Every attacker interaction is fingerprinted: browser, TLS, timing patterns. Even if they rotate IPs, we recognize them.',
  },
  {
    icon: FileText,
    name: 'Auto-Reporting',
    body: 'When attack confidence exceeds 90%, automatically generates and emails a threat report to your security contact.',
  },
  {
    icon: Database,
    name: 'Threat Intel Export',
    body: 'Attack patterns are anonymized and contributed to the global threat-intel pool. You protect others while protecting yourself.',
  },
];

const HISTORY_ROWS: Array<{
  date: string;
  detected: number;
  neutralized: number;
  response: string;
  score: number;
}> = [
  { date: 'Mon', detected: 14, neutralized: 13, response: '2.1s', score: 52 },
  { date: 'Tue', detected: 18, neutralized: 18, response: '1.8s', score: 61 },
  { date: 'Wed', detected: 22, neutralized: 21, response: '1.6s', score: 58 },
  { date: 'Thu', detected: 27, neutralized: 26, response: '1.4s', score: 73 },
  { date: 'Fri', detected: 31, neutralized: 30, response: '1.3s', score: 79 },
  { date: 'Sat', detected: 24, neutralized: 24, response: '1.2s', score: 85 },
  { date: 'Sun', detected: 19, neutralized: 19, response: '1.1s', score: 88 },
];

const PROTECTION_TREND = [
  { day: 'Mon', score: 45 },
  { day: 'Tue', score: 52 },
  { day: 'Wed', score: 61 },
  { day: 'Thu', score: 58 },
  { day: 'Fri', score: 73 },
  { day: 'Sat', score: 79 },
  { day: 'Sun', score: 88 },
];

function ShieldStatusCard() {
  const { shieldActive, setShieldActive, threatEvents } = useApp();
  // Treat the newest CRITICAL event as the "active threat" indicator — no Date.now in render.
  const hasActiveThreat = threatEvents[0]?.severity === 'CRITICAL';
  const state: 'ACTIVE' | 'THREAT' | 'INACTIVE' = !shieldActive
    ? 'INACTIVE'
    : hasActiveThreat
    ? 'THREAT'
    : 'ACTIVE';
  const color =
    state === 'ACTIVE'
      ? 'text-brand-success'
      : state === 'THREAT'
      ? 'text-brand-danger animate-pulse'
      : 'text-slate-500';
  const bgRing =
    state === 'ACTIVE'
      ? 'bg-brand-success/10 border-brand-success/40'
      : state === 'THREAT'
      ? 'bg-brand-danger/10 border-brand-danger/40 animate-pulse-ring'
      : 'bg-slate-700/20 border-slate-700/50';
  const label =
    state === 'ACTIVE'
      ? 'MirrorTrap Shield — Defending Autonomously'
      : state === 'THREAT'
      ? 'Active Threat Detected — Countermeasures Deployed'
      : 'Shield Offline — Activate to Begin Protection';

  return (
    <CardSpotlight className="p-6">
      <div className="grid gap-6 md:grid-cols-[auto_1fr_auto]">
        {/* Shield icon */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={cn(
              'flex h-28 w-28 items-center justify-center rounded-full border-2',
              bgRing,
            )}
          >
            <Shield className={cn('h-14 w-14', color)} />
          </div>
          <div className={cn('mt-3 text-center text-[11px] font-bold uppercase tracking-widest', color)}>
            {state}
          </div>
        </div>
        {/* Status label */}
        <div className="flex flex-col justify-center">
          <div className="text-xs uppercase tracking-widest text-slate-400">
            Autonomous Defense Engine
          </div>
          <div
            className={cn(
              'mt-1 font-display text-xl font-bold leading-snug md:text-2xl',
              state === 'ACTIVE' && 'text-brand-success',
              state === 'THREAT' && 'text-brand-danger',
              state === 'INACTIVE' && 'text-slate-400',
            )}
          >
            {label}
          </div>
          <div className="mt-2 text-sm text-slate-400">
            MirrorTrap Shield watches every honey token, decoy asset, and traffic pattern in
            real time. When a threat fires, it neutralizes, deceives, or poisons — automatically.
          </div>
          <div className="mt-4 inline-flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-widest text-slate-400">
              Autonomous defense
            </span>
            <Switch checked={shieldActive} onCheckedChange={setShieldActive} />
            <span
              className={cn(
                'text-[11px] font-bold uppercase tracking-widest',
                shieldActive ? 'text-brand-success' : 'text-slate-500',
              )}
            >
              {shieldActive ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
        {/* Stats */}
        <div className="flex min-w-[220px] flex-col gap-2">
          <StatPill
            tone="success"
            icon={ShieldCheck}
            label="Threats Neutralized"
            value={47 + Math.max(0, threatEvents.filter((t) => t.status === 'NEUTRALIZED').length - 3)}
          />
          <StatPill
            tone="amber"
            icon={Zap}
            label="Active Countermeasures"
            value={shieldActive ? 3 : 0}
          />
          <StatPill tone="purple" icon={Lock} label="Protected Assets" value={12} />
        </div>
      </div>
    </CardSpotlight>
  );
}

function StatPill({
  tone,
  icon: Icon,
  label,
  value,
}: {
  tone: 'success' | 'amber' | 'purple';
  icon: typeof Shield;
  label: string;
  value: number;
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-brand-success/10 border-brand-success/40 text-brand-success'
      : tone === 'amber'
      ? 'bg-brand-amber/10 border-brand-amber/40 text-brand-amber'
      : 'bg-brand-purple/10 border-brand-purple/40 text-brand-purple';
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl border p-3', toneClass)}>
      <Icon className="h-5 w-5" />
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-widest opacity-80">{label}</div>
        <div className="font-display text-lg font-bold text-white">{value}</div>
      </div>
    </div>
  );
}

function ThreatBoard() {
  const { threatEvents, shieldActive } = useApp();
  const latestCritical = threatEvents[0]?.severity === 'CRITICAL';
  return (
    <div
      className={cn(
        'card p-5 transition-all',
        latestCritical && 'border-brand-danger/70 shadow-glow-danger',
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-danger animate-pulse-dot" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-danger">
          Active Threat Intelligence Feed
        </span>
        <span className="ml-auto text-[10px] text-slate-500">
          {threatEvents.length} event{threatEvents.length === 1 ? '' : 's'} tracked
        </span>
      </div>
      {!shieldActive ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-slate-400">
          <ShieldOff className="mx-auto mb-2 h-6 w-6 text-slate-600" />
          Shield is offline. Turn on Autonomous Defense to start capturing threats.
        </div>
      ) : threatEvents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-slate-400">
          Waiting for first threat… the feed populates in real time.
        </div>
      ) : (
        <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
          {threatEvents.slice(0, 20).map((t, i) => (
            <div
              key={t.id}
              className={cn(
                'grid grid-cols-[80px_140px_1fr_auto] items-center gap-2 rounded-lg border border-border/60 bg-bg-terminal/60 px-3 py-2 text-[12px]',
                i === 0 && 'animate-slide-up border-brand-danger/40',
              )}
            >
              <span className="font-mono text-slate-500">{formatTime(t.timestamp)}</span>
              <span
                className={cn(
                  'inline-flex w-fit items-center rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest',
                  KIND_TONE[t.severity],
                )}
              >
                {t.kind}
              </span>
              <span className="truncate text-slate-300">
                <span className="mr-2 font-mono text-brand-amber">
                  {t.country_flag} {t.ip}
                </span>
                {t.action}
              </span>
              <span
                className={cn(
                  'inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
                  STATUS_TONE[t.status],
                )}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Countermeasures() {
  const { shieldActive } = useApp();
  return (
    <CardSpotlight className="p-5">
      <div className="mb-1 text-xs uppercase tracking-widest text-brand-purple">
        Autonomous Countermeasures
      </div>
      <div className="mb-4 text-sm text-slate-400">
        MirrorTrap activates these automatically when threats are detected.
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {COUNTERMEASURES.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.name}
              className={cn(
                'rounded-xl border p-4 transition-all',
                shieldActive
                  ? 'border-brand-success/40 bg-brand-success/5'
                  : 'border-border bg-bg-terminal/40',
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    shieldActive
                      ? 'bg-brand-success/15 text-brand-success'
                      : 'bg-slate-700/30 text-slate-500',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-sm font-semibold text-white">{c.name}</div>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-widest',
                    shieldActive ? 'text-brand-success' : 'text-slate-500',
                  )}
                >
                  {shieldActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-[12px] leading-relaxed text-slate-400">{c.body}</div>
            </div>
          );
        })}
      </div>
    </CardSpotlight>
  );
}

function ProtectionTimeline() {
  const data = useMemo(() => PROTECTION_TREND, []);
  return (
    <CardSpotlight className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-brand-success">
            Protection Timeline
          </div>
          <div className="text-sm text-slate-400">
            Your defense posture is improving each day. Target ≥ 80.
          </div>
        </div>
        <div className="font-mono text-xs text-slate-500">last 7 days</div>
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 18, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="protectGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1D9E75" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#1D9E75" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(127,119,221,0.1)" strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fill: '#7a7799', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#7a7799', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine
              y={80}
              stroke="#1D9E75"
              strokeDasharray="6 4"
              label={{
                value: 'TARGET',
                fill: '#1D9E75',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            <RTooltip
              contentStyle={{
                background: '#0A0814',
                border: '1px solid rgba(127,119,221,0.3)',
                borderRadius: 8,
                color: '#e6e4f2',
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#1D9E75"
              strokeWidth={2}
              fill="url(#protectGrad)"
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* history table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-bg-terminal text-[10px] uppercase tracking-widest text-slate-400">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Threats Detected</th>
              <th className="px-3 py-2">Neutralized</th>
              <th className="px-3 py-2">Avg Response Time</th>
              <th className="px-3 py-2">Protection Score</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY_ROWS.map((r, i) => (
              <tr
                key={r.date}
                className={cn(
                  'border-t border-border',
                  i % 2 === 0 ? 'bg-transparent' : 'bg-bg-terminal/30',
                )}
              >
                <td className="px-3 py-2 font-mono text-slate-400">{r.date}</td>
                <td className="px-3 py-2 text-white">{r.detected}</td>
                <td className="px-3 py-2 text-brand-success">{r.neutralized}</td>
                <td className="px-3 py-2 text-slate-300">{r.response}</td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      'rounded border px-2 py-0.5 text-[11px] font-bold',
                      r.score >= 80
                        ? 'border-brand-success/40 bg-brand-success/10 text-brand-success'
                        : r.score >= 60
                        ? 'border-brand-amber/40 bg-brand-amber/10 text-brand-amber'
                        : 'border-brand-danger/40 bg-brand-danger/10 text-brand-danger',
                    )}
                  >
                    {r.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardSpotlight>
  );
}

export function ProtectPage() {
  usePageTitle('MirrorTrap — Protect');
  const { isEnterprise } = useApp();
  const navigate = useNavigate();

  if (!isEnterprise) {
    // Defensive fallback: direct URL access without enterprise gate.
    return (
      <div className="mx-auto max-w-lg card p-8 text-center">
        <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-brand-amber" />
        <div className="text-xl font-bold text-white">Enterprise Feature</div>
        <div className="mt-2 text-sm text-slate-400">
          Autonomous defense is available on the Enterprise plan (₹9,999/month). Upgrade to let
          MirrorTrap fight attackers automatically — no human intervention needed.
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <button className="btn-primary" onClick={() => navigate('/#pricing')}>
            Upgrade to Enterprise
          </button>
          <button className="btn-ghost" onClick={() => navigate('/dashboard')}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber">
          <ShieldCheck className="h-3.5 w-3.5" /> Enterprise
        </div>
        <h1 className="mt-1 text-3xl font-bold text-white">Protect — Autonomous Defense</h1>
        <p className="mt-1 text-sm text-slate-400">
          The enterprise-only layer that turns MirrorTrap into an antivirus for your company's
          online presence. Shield runs continuously, catches attackers mid-recon, and fights back
          automatically.
        </p>
      </div>

      <ShieldStatusCard />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <ThreatBoard />
        <Countermeasures />
      </div>

      <ProtectionTimeline />
    </div>
  );
}
