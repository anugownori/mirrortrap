import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Circle,
  Globe,
  Radar,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  Siren,
  Terminal,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useApp } from '@/lib/useApp';
import { ArsGauge } from '@/components/ui/ArsGauge';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { cn, formatDate } from '@/lib/utils';
import { usePageTitle } from '@/lib/usePageTitle';

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
  extra,
}: {
  label: string;
  value: string | number;
  tone: 'purple' | 'amber' | 'danger' | 'success';
  icon: typeof Radar;
  extra?: React.ReactNode;
}) {
  const map = {
    purple: 'text-brand-purple bg-brand-purple/10 border-brand-purple/40',
    amber: 'text-brand-amber bg-brand-amber/10 border-brand-amber/40',
    danger: 'text-brand-danger bg-brand-danger/10 border-brand-danger/40',
    success: 'text-brand-success bg-brand-success/10 border-brand-success/40',
  } as const;
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', map[tone])}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-white tabular-nums">{value}</span>
            {extra}
          </div>
        </div>
      </div>
    </div>
  );
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function BreachCountdown({ hours }: { hours: number }) {
  const [remaining, setRemaining] = useState<number>(() =>
    Math.max(1, Math.round(hours * 3600)),
  );
  useEffect(() => {
    const int = setInterval(() => {
      setRemaining((r) => (r <= 0 ? 0 : r - 1));
    }, 1000);
    return () => clearInterval(int);
  }, []);
  const expired = remaining <= 0;
  const hh = Math.floor(remaining / 3600);
  const mm = Math.floor((remaining % 3600) / 60);
  const ss = remaining % 60;
  return (
    <div
      className={cn(
        'card relative overflow-hidden border-brand-danger/50 p-4',
        expired ? 'animate-danger-flash' : '',
      )}
      style={{
        backgroundImage:
          'linear-gradient(135deg, rgba(240,149,149,0.12), rgba(240,149,149,0.02))',
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="relative mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-danger/15 text-brand-danger animate-pulse-ring">
            <Siren className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-danger">
              {expired ? 'CRITICAL — WINDOW EXPIRED — DEPLOY PHANTOMSHIELD NOW' : '⚡ BREACH WINDOW OPEN'}
            </div>
            <div className="mt-0.5 text-sm text-slate-200">
              {expired ? (
                <>Estimated exploitation window has passed. Your exposure is untreated.</>
              ) : (
                <>
                  Estimated time to exploit:{' '}
                  <span className="font-mono text-brand-amber">{hours}h</span> — based on your
                  current exposure.
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-brand-danger/40 bg-black/40 px-3 py-2 font-mono text-2xl tabular-nums text-brand-danger">
            {pad(hh)}:{pad(mm)}:{pad(ss)}
          </div>
          <Link to="/phantomshield" className="btn-danger !py-2.5">
            <ShieldHalf className="h-4 w-4" /> Deploy Now
          </Link>
        </div>
      </div>
    </div>
  );
}

const TICKER_MESSAGES = [
  'Shodan bot probed port 3306 on your IP range',
  '185.220.101.47 queried your subdomain dev.targetcompany.com',
  'HaveIBeenPwned: your email seen in paste site',
  'GitHub crawler indexed your repo history',
  'Censys scan matched your TLS fingerprint',
  'Anonymous proxy fetched your job-postings page',
];

interface TickerLine {
  id: string;
  text: string;
  ts: string;
}

function randomTs(baseTime: Date) {
  const jitter = new Date(baseTime);
  jitter.setHours(jitter.getHours() + Math.floor(Math.random() * 3));
  jitter.setMinutes(Math.floor(Math.random() * 60));
  jitter.setSeconds(Math.floor(Math.random() * 60));
  return `${pad(jitter.getHours())}:${pad(jitter.getMinutes())}:${pad(jitter.getSeconds())}`;
}

function LiveTicker() {
  const [lines, setLines] = useState<TickerLine[]>(() => {
    const now = new Date();
    return [0, 1, 2].map((i) => ({
      id: `seed_${i}`,
      text: TICKER_MESSAGES[i],
      ts: randomTs(now),
    }));
  });
  const idxRef = useRef(3);
  useEffect(() => {
    const int = setInterval(() => {
      const text = TICKER_MESSAGES[idxRef.current % TICKER_MESSAGES.length];
      idxRef.current += 1;
      setLines((prev) =>
        [
          {
            id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            text,
            ts: randomTs(new Date()),
          },
          ...prev,
        ].slice(0, 6),
      );
    }, 4000);
    return () => clearInterval(int);
  }, []);
  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/40">
          <Terminal className="h-3.5 w-3.5 text-brand-purple" /> Live Recon Activity (simulated)
        </div>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-brand-success">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-success animate-pulse-dot" /> listening
        </span>
      </div>
      <div className="terminal scanlines max-h-[168px] overflow-hidden">
        {lines.map((l, i) => (
          <div
            key={l.id}
            className={cn(
              'flex gap-2 leading-relaxed',
              i === 0 ? 'text-brand-amber animate-slide-up' : 'text-slate-400',
            )}
          >
            <span className="text-white/30">[{l.ts}]</span>
            <span className="flex-1">{l.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OnboardingCard({
  hasScan,
  hasDecoy,
  hasAlert,
}: {
  hasScan: boolean;
  hasDecoy: boolean;
  hasAlert: boolean;
}) {
  const steps = [
    { key: 's1', label: 'Run your first scan', to: '/scan', done: hasScan },
    { key: 's2', label: 'Deploy PhantomShield', to: '/phantomshield', done: hasDecoy },
    { key: 's3', label: 'Monitor your alerts', to: '/alerts', done: hasAlert },
  ] as const;
  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;
  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
          <Sparkle /> Get started with MirrorTrap
        </div>
        <span className="text-[11px] text-slate-400">
          {completed}/{steps.length} complete
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => (
          <Link
            key={s.key}
            to={s.to}
            className={cn(
              'group flex items-start gap-3 rounded-2xl border p-4 transition-all',
              s.done
                ? 'border-brand-success/40 bg-brand-success/5'
                : 'border-border bg-bg-terminal/50 hover:border-brand-purple/60 hover:bg-brand-purple/5',
            )}
          >
            {s.done ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-success" />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 text-slate-500 group-hover:text-brand-purple" />
            )}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">
                Step {i + 1}
              </div>
              <div
                className={cn(
                  'mt-0.5 text-sm font-semibold',
                  s.done ? 'text-slate-400 line-through' : 'text-white',
                )}
              >
                {s.label}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Sparkle() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" />
    </svg>
  );
}

export function DashboardHome() {
  usePageTitle('MirrorTrap — Dashboard');
  const { scans, latestScan, alerts, decoys, demoMode } = useApp();
  const navigate = useNavigate();
  const [quickDomain, setQuickDomain] = useState('');

  const activeDecoys = decoys.filter((d) => d.active).length;
  const critical = latestScan?.findings.filter((f) => f.severity === 'CRITICAL').length ?? 0;

  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return alerts.filter((a) => new Date(a.timestamp) >= start).length;
  }, [alerts]);

  const findingCounts = useMemo(() => {
    const c = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 } as Record<string, number>;
    (latestScan?.findings ?? []).forEach((f) => (c[f.severity] += 1));
    return c;
  }, [latestScan]);

  const arsDelta = useMemo(() => {
    if (scans.length < 2) return null;
    const sorted = [...scans].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
    return sorted[sorted.length - 1].ars_score - sorted[sorted.length - 2].ars_score;
  }, [scans]);

  const onQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    const d = quickDomain.trim();
    if (!d) return;
    navigate(`/scan?domain=${encodeURIComponent(d)}&auto=1`);
  };

  const showBreachBanner = !!latestScan && latestScan.ars_score >= 60;

  return (
    <div className="space-y-6">
      {scans.length === 0 && !demoMode ? (
        <OnboardingCard hasScan={false} hasDecoy={activeDecoys > 0} hasAlert={alerts.length > 0} />
      ) : null}

      <div className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="section-label">
              <Radar className="h-3.5 w-3.5" /> Quick scan
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold text-white">Run a scan in under a minute.</h1>
            <p className="mt-1 text-sm text-white/55">
              {demoMode
                ? 'Demo Mode is ON — preloaded targetcompany.com data is available across the app.'
                : 'Type any domain and hit Enter. We\u2019ll trace it the way an attacker would.'}
            </p>
          </div>
        </div>
        <form onSubmit={onQuickScan} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={quickDomain}
              onChange={(e) => setQuickDomain(e.target.value)}
              placeholder={demoMode ? 'targetcompany.com' : 'company.com'}
              className="w-full rounded-full border border-border bg-bg-terminal py-3 pl-9 pr-3 font-mono text-sm focus:border-brand-purple focus:outline-none"
            />
          </div>
          <button type="submit" className="btn-primary !px-6 !py-3">
            Scan <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Critical findings"
          value={critical}
          tone="danger"
          icon={ShieldAlert}
          extra={
            arsDelta !== null ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
                  arsDelta > 0
                    ? 'bg-brand-danger/15 text-brand-danger'
                    : arsDelta < 0
                      ? 'bg-brand-success/15 text-brand-success'
                      : 'bg-white/5 text-slate-400',
                )}
                title="ARS change from previous scan"
              >
                {arsDelta > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : arsDelta < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                {arsDelta > 0 ? '+' : ''}
                {arsDelta} ARS
              </span>
            ) : null
          }
        />
        <StatCard label="Active decoys" value={`${activeDecoys}/4`} tone="success" icon={ShieldCheck} />
        <StatCard label="Alerts today" value={today} tone="amber" icon={Bell} />
        <StatCard label="Domains scanned" value={scans.length} tone="purple" icon={Globe} />
      </div>

      {showBreachBanner ? (
        <BreachCountdown hours={latestScan.estimated_time_to_exploit_hours} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <div
            className="card flex flex-col items-center justify-center p-6"
            title="ARS = Attack Readiness Score — a 0-100 composite of your OSINT exposure. Lower is better."
          >
            {latestScan ? (
              <>
                <ArsGauge score={latestScan.ars_score} />
                <div className="mt-3 text-center">
                  <div className="font-mono text-sm text-slate-300">{latestScan.domain}</div>
                  <div className="text-[11px] uppercase tracking-widest text-white/40">
                    {formatDate(latestScan.timestamp)}
                  </div>
                  {arsDelta !== null ? (
                    <div
                      className={cn(
                        'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-widest',
                        arsDelta > 0
                          ? 'bg-brand-danger/15 text-brand-danger'
                          : arsDelta < 0
                            ? 'bg-brand-success/15 text-brand-success'
                            : 'bg-white/5 text-slate-400',
                      )}
                    >
                      {arsDelta > 0 ? '▲' : arsDelta < 0 ? '▼' : '—'}{' '}
                      {arsDelta > 0 ? '+' : ''}
                      {arsDelta} from last scan
                    </div>
                  ) : null}
                </div>
                <Link to="/scan" className="btn-ghost mt-4">
                  Rescan <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <div className="text-center">
                <div className="text-sm text-slate-400">No scan yet</div>
                <Link to="/scan" className="btn-primary mt-3">
                  Run your first scan
                </Link>
              </div>
            )}
          </div>

          <LiveTicker />
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-white/40">
                Findings summary (latest scan)
              </div>
              <Link to="/scan" className="text-xs text-brand-purple hover:underline">
                View scan →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                <div key={sev} className="rounded-2xl border border-border bg-bg-terminal/50 p-3">
                  <SeverityBadge severity={sev} />
                  <div className="mt-2 font-display text-2xl font-bold tabular-nums text-white">
                    {findingCounts[sev] ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-white/40">Recent activity</div>
              <Link to="/alerts" className="text-xs text-brand-purple hover:underline">
                All alerts →
              </Link>
            </div>
            {alerts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-slate-400">
                No tripwires fired yet. Deploy PhantomShield to start catching reconnaissance.
              </div>
            ) : (
              <ul className="space-y-2">
                {alerts.slice(0, 5).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-bg-terminal/40 p-3"
                  >
                    <Zap
                      className={cn(
                        'mt-0.5 h-4 w-4',
                        a.severity === 'CRITICAL' ? 'text-brand-danger' : 'text-brand-amber',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-slate-100">
                        <span className="font-semibold">{a.asset_used}</span>{' '}
                        <span className="text-slate-500">touched by</span>{' '}
                        <span className="font-mono">{a.ip}</span>
                      </div>
                      <div className="text-[11px] text-white/30">
                        {a.country_flag} {a.country} · {formatDate(a.timestamp)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-white/40">Scan history</div>
              <Link to="/reports" className="text-xs text-brand-purple hover:underline">
                All reports →
              </Link>
            </div>
            {scans.length === 0 ? (
              <div className="text-sm text-slate-400">No scans yet.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-[10px] uppercase tracking-widest text-white/40">
                  <tr>
                    <th className="py-1">Domain</th>
                    <th className="py-1">When</th>
                    <th className="py-1">ARS</th>
                    <th className="py-1">Findings</th>
                  </tr>
                </thead>
                <tbody>
                  {[...scans].reverse().slice(0, 5).map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="py-2 font-mono">{s.domain}</td>
                      <td className="py-2 text-slate-400">{formatDate(s.timestamp)}</td>
                      <td className="py-2 font-mono text-brand-amber">{s.ars_score}</td>
                      <td className="py-2 text-slate-300">{s.findings.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
