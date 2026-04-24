import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivitySquare,
  AlertTriangle,
  Bot,
  ChevronDown,
  Crosshair,
  Download,
  Fingerprint,
  Flag,
  Gauge,
  Globe2,
  Loader2,
  Repeat,
  ShieldAlert,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '@/lib/useApp';
import type { Alert } from '@/lib/types';
import { cn, formatTime } from '@/lib/utils';
import { usePageTitle } from '@/lib/usePageTitle';

function Classification({ a }: { a: Alert }) {
  const isBot = a.classification.label === 'Automated Recon Bot';
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest',
        isBot
          ? 'border-brand-danger/50 bg-brand-danger/15 text-brand-danger'
          : 'border-brand-danger/70 bg-brand-danger/25 text-red-200',
      )}
    >
      {isBot ? <Bot className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
      {a.classification.label} — {a.classification.confidence}% confidence
    </div>
  );
}

function AlertCard({
  a,
  isNewest,
  isNewArrival,
}: {
  a: Alert;
  isNewest: boolean;
  isNewArrival: boolean;
}) {
  const { updateAlertStatus, pushToast } = useApp();
  const [open, setOpen] = useState(isNewest);
  const [showNewBadge, setShowNewBadge] = useState(isNewArrival);

  useEffect(() => {
    if (!isNewArrival) return;
    const t = setTimeout(() => setShowNewBadge(false), 3000);
    return () => clearTimeout(t);
  }, [isNewArrival]);

  const border =
    a.severity === 'CRITICAL'
      ? 'border-l-brand-danger'
      : 'border-l-brand-amber';

  const flaggedOrDismissed = a.status !== 'open';

  return (
    <div
      className={cn(
        'card border-l-4 p-5 transition-all animate-slide-in-top',
        border,
        isNewArrival && 'animate-red-flash',
        flaggedOrDismissed && 'opacity-60',
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[11px] text-slate-400">{formatTime(a.timestamp)}</span>
        <span className="inline-flex items-center gap-1 rounded-md bg-brand-danger/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-danger">
          <Zap className="h-3 w-3" /> Tripwire Fired
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
            a.severity === 'CRITICAL'
              ? 'border-brand-danger/40 bg-brand-danger/10 text-brand-danger'
              : 'border-brand-amber/40 bg-brand-amber/10 text-brand-amber',
          )}
        >
          {a.severity}
        </span>
        {showNewBadge ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-brand-success/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-success animate-fade-in">
            ● NEW
          </span>
        ) : null}
        <div className="flex-1" />
        {a.status === 'flagged' ? <span className="pill text-brand-amber">Flagged</span> : null}
        {a.status === 'dismissed' ? <span className="pill">Archived</span> : null}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Source IP</div>
          <div className="font-mono text-3xl font-bold text-white">{a.ip}</div>
          <div className="mt-0.5 text-sm text-slate-300">
            <span className="mr-1">{a.country_flag}</span>
            {a.country} — <span className="text-slate-500">{a.network_tag}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">User-Agent</div>
          <span className="pill mt-1 font-mono normal-case tracking-normal">{a.user_agent}</span>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Asset touched</div>
          <div className="text-sm text-slate-200">
            <span className="font-semibold text-white">{a.asset_used}</span>{' '}
            <span className="text-slate-500">({a.asset_value})</span>
          </div>
        </div>
      </div>

      <button
        className="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-purple hover:underline"
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        Behavior & attack path
      </button>

      {open ? (
        <div className="mt-3 space-y-3 animate-fade-in">
          <div className="grid gap-2 md:grid-cols-3">
            <div className="card bg-bg-terminal/60 p-3">
              <div className="flex items-center gap-2 text-xs text-brand-amber">
                <Gauge className="h-3.5 w-3.5" /> Request rate
              </div>
              <div className="mt-1 text-sm text-slate-200">{a.behavior.requests}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-brand-danger">
                AUTOMATED BOT
              </div>
            </div>
            <div className="card bg-bg-terminal/60 p-3">
              <div className="flex items-center gap-2 text-xs text-brand-amber">
                <Repeat className="h-3.5 w-3.5" /> Probing pattern
              </div>
              <div className="mt-1 text-sm text-slate-200">{a.behavior.pattern}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-brand-danger">
                SCANNER PATTERN
              </div>
            </div>
            <div className="card bg-bg-terminal/60 p-3">
              <div className="flex items-center gap-2 text-xs text-brand-amber">
                <Fingerprint className="h-3.5 w-3.5" /> Fingerprint
              </div>
              <div className="mt-1 text-sm text-slate-200">{a.behavior.fingerprint}</div>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-brand-danger">
                SCRIPT, NOT HUMAN
              </div>
            </div>
          </div>
          <Classification a={a} />

          <div className="card bg-bg-terminal/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
              <ActivitySquare className="h-3.5 w-3.5" /> Probable attack path
            </div>
            <ol className="space-y-1.5 font-mono text-[13px]">
              {a.attack_path.map((p) => (
                <li
                  key={p.step}
                  className={cn(
                    'flex items-start gap-3',
                    p.predicted && 'text-slate-500',
                    p.triggered && 'text-brand-amber',
                  )}
                >
                  <span className="w-10 shrink-0 text-slate-500">Step {p.step}:</span>
                  <span className="flex-1">
                    {p.label}
                    {p.triggered ? (
                      <span className="ml-2 rounded bg-brand-amber/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-amber">
                        ← triggered
                      </span>
                    ) : null}
                    {p.predicted ? (
                      <span className="ml-2 text-[10px] uppercase tracking-widest text-slate-500">
                        (predicted)
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              disabled={a.status === 'flagged'}
              onClick={() => {
                updateAlertStatus(a.id, 'flagged');
                pushToast({ title: `IP ${a.ip} flagged`, tone: 'amber' });
              }}
              className="btn-amber !py-1.5 !text-xs"
            >
              <Flag className="h-3.5 w-3.5" /> Flag IP
            </button>
            <button
              onClick={() => {
                const html = renderReport(a);
                const w = window.open('', '_blank');
                if (w) {
                  w.document.write(html);
                  w.document.close();
                }
              }}
              className="btn-ghost !py-1.5 !text-xs"
            >
              Generate Report
            </button>
            <button
              onClick={() => updateAlertStatus(a.id, 'dismissed')}
              className="btn-ghost !py-1.5 !text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" /> Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function renderReport(a: Alert) {
  return `<!doctype html><html><head><title>Threat report — ${a.ip}</title>
<style>
body{font-family:Inter,system-ui;background:#0D0B1A;color:#e6e4f2;padding:32px;max-width:720px;margin:0 auto}
h1{font-weight:700}.box{border:1px solid rgba(127,119,221,0.3);border-radius:12px;padding:16px;margin:12px 0;background:#1A1730}
code{background:#0A0814;padding:2px 6px;border-radius:4px;color:#EF9F27}
</style></head><body>
<h1>MirrorTrap Threat Report</h1>
<div class="box"><b>Alert ID:</b> ${a.id}<br/><b>Timestamp:</b> ${a.timestamp}<br/><b>Severity:</b> ${a.severity}</div>
<div class="box"><b>Source IP:</b> <code>${a.ip}</code><br/><b>Origin:</b> ${a.country_flag} ${a.country} — ${a.network_tag}<br/><b>User-Agent:</b> <code>${a.user_agent}</code></div>
<div class="box"><b>Asset touched:</b> ${a.asset_used} (${a.asset_value})</div>
<div class="box"><b>Behavior:</b><br/>${a.behavior.requests}<br/>${a.behavior.pattern}<br/>${a.behavior.fingerprint}</div>
<div class="box"><b>Classification:</b> ${a.classification.label} — ${a.classification.confidence}% confidence</div>
<div class="box"><b>Predicted attack path:</b><ol>${a.attack_path
    .map((p) => `<li>${p.label}${p.triggered ? ' ← triggered' : ''}${p.predicted ? ' (predicted)' : ''}</li>`)
    .join('')}</ol></div>
</body></html>`;
}

const REGIONS = [
  { region: 'Eastern Europe', pct: 47 },
  { region: 'Southeast Asia', pct: 28 },
  { region: 'Middle East', pct: 12 },
  { region: 'Other', pct: 13 },
];

const HOT_IPS = [
  { ip: '185.220.101.47', flag: '🇷🇴', country: 'Romania', lastSeen: '2m ago' },
  { ip: '193.189.100.203', flag: '🇷🇺', country: 'Russia', lastSeen: '11m ago' },
  { ip: '45.153.160.138', flag: '🇨🇳', country: 'China', lastSeen: '34m ago' },
];

function RegionalThreatChart() {
  return (
    <div className="card p-5">
      <div className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
        <Globe2 className="h-3.5 w-3.5" /> Attacker Origin Map
      </div>
      <div className="text-sm text-slate-400">
        Attack origin distribution — last 30 days
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart
              data={REGIONS}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
            >
              <CartesianGrid stroke="rgba(127,119,221,0.1)" strokeDasharray="4 4" />
              <XAxis
                type="number"
                domain={[0, 60]}
                stroke="#7F77DD"
                tick={{ fill: '#8c8aa6', fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="region"
                stroke="#7F77DD"
                tick={{ fill: '#e6e4f2', fontSize: 11 }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  background: '#0A0814',
                  border: '1px solid rgba(127,119,221,0.3)',
                  borderRadius: 10,
                  color: '#e6e4f2',
                  fontSize: 12,
                }}
                formatter={(v) => [`${v}%`, 'Share']}
                cursor={{ fill: 'rgba(240,149,149,0.05)' }}
              />
              <Bar
                dataKey="pct"
                fill="#F09595"
                radius={[0, 6, 6, 0]}
                isAnimationActive
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">
            Hot IPs (last 24h)
          </div>
          <ul className="mt-2 space-y-2">
            {HOT_IPS.map((h) => (
              <li
                key={h.ip}
                className="flex items-center gap-2 rounded-2xl border border-border bg-bg-terminal/50 p-2"
              >
                <span className="text-base">{h.flag}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[12px] text-white">{h.ip}</div>
                  <div className="text-[10px] text-slate-500">
                    {h.country} · {h.lastSeen}
                  </div>
                </div>
                <Crosshair className="h-3.5 w-3.5 text-brand-danger" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function AnimatedCounter({
  value,
  flash,
  className,
}: {
  value: number;
  flash: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (display === value) return;
    const dir = value > display ? 1 : -1;
    const int = setInterval(() => {
      setDisplay((d) => {
        if (d === value) {
          clearInterval(int);
          return d;
        }
        return d + dir;
      });
    }, 60);
    return () => clearInterval(int);
  }, [value, display]);
  return (
    <span
      className={cn(
        className,
        flash && 'animate-red-flash rounded-md px-2',
      )}
    >
      {display}
    </span>
  );
}

export function AlertsPage() {
  usePageTitle('MirrorTrap — Alerts');
  const { alerts, simulateAttack } = useApp();
  const [targeting, setTargeting] = useState(false);
  const [counterFlash, setCounterFlash] = useState(false);
  const [dotFast, setDotFast] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const prevCountRef = useRef(alerts.length);
  const prevTopIdRef = useRef<string | null>(alerts[0]?.id ?? null);

  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return alerts.filter((a) => new Date(a.timestamp) >= start).length;
  }, [alerts]);

  const stats = useMemo(() => {
    let bots = 0,
      humans = 0,
      flagged = 0;
    const ips = new Set<string>();
    alerts.forEach((a) => {
      if (a.classification.label === 'Automated Recon Bot') bots += 1;
      else humans += 1;
      if (a.status === 'flagged') flagged += 1;
      ips.add(a.ip);
    });
    return { bots, humans, flagged, uniqueIps: ips.size };
  }, [alerts]);

  // Detect new alert arrival: flash counter + NEW badge + dot speedup
  useEffect(() => {
    if (alerts.length > prevCountRef.current) {
      const topId = alerts[0]?.id;
      if (topId && topId !== prevTopIdRef.current) {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.add(topId);
          return next;
        });
        setCounterFlash(true);
        setDotFast(true);
        setTimeout(() => setCounterFlash(false), 900);
        setTimeout(() => setDotFast(false), 2000);
        setTimeout(() => {
          setNewIds((prev) => {
            const next = new Set(prev);
            next.delete(topId);
            return next;
          });
        }, 3200);
      }
    }
    prevCountRef.current = alerts.length;
    prevTopIdRef.current = alerts[0]?.id ?? null;
  }, [alerts]);

  const onSimulate = () => {
    if (targeting) return;
    setTargeting(true);
    setTimeout(() => {
      simulateAttack();
      setTargeting(false);
    }, 1500);
  };

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(alerts, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirrortrap-alerts-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-danger">
            <AlertTriangle className="h-3.5 w-3.5" /> Alerts
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <AnimatedCounter
              value={today}
              flash={counterFlash}
              className="font-display text-5xl font-bold text-brand-danger tabular-nums"
            />
            <span className="text-sm text-slate-400">tripwires fired today</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span
              className={cn(
                'h-2 w-2 rounded-full bg-brand-danger animate-pulse-dot',
                dotFast && 'animate-pulse-ring',
              )}
            />
            <span className="font-semibold uppercase tracking-widest text-brand-danger">
              MONITORING ACTIVE
            </span>
            <span className="text-slate-500">· {alerts.length} total tracked</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportAll}
            disabled={alerts.length === 0}
            className="btn-ghost !py-2.5"
            title="Download all alerts as JSON"
          >
            <Download className="h-4 w-4" /> Export All
          </button>
          <button onClick={onSimulate} disabled={targeting} className="btn-danger !px-5 !py-3">
            {targeting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> TARGETING…
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" /> SIMULATE ATTACK
              </>
            )}
          </button>
        </div>
      </div>

      <RegionalThreatChart />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-danger">
            <Bot className="h-3 w-3" /> Automated Bots
          </div>
          <div className="mt-1 font-display text-3xl font-bold text-brand-danger tabular-nums">
            {stats.bots}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-300">
            <ShieldAlert className="h-3 w-3" /> Human Attackers
          </div>
          <div className="mt-1 font-display text-3xl font-bold text-red-300 tabular-nums">
            {stats.humans}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-amber">
            <Flag className="h-3 w-3" /> IPs Flagged
          </div>
          <div className="mt-1 font-display text-3xl font-bold text-brand-amber tabular-nums">
            {stats.flagged} <span className="text-sm text-slate-500">/ {stats.uniqueIps}</span>
          </div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="card p-10 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-slate-500" />
          <div className="mt-3 text-lg font-semibold text-white">No tripwires fired yet</div>
          <div className="mt-1 text-sm text-slate-400">
            Deploy PhantomShield decoys, or click SIMULATE ATTACK to see what a real catch looks like.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((a, i) => (
            <AlertCard
              key={a.id}
              a={a}
              isNewest={i === 0}
              isNewArrival={newIds.has(a.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
