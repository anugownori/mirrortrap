import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Eye,
  Flame,
  Globe,
  Radar,
  ShieldAlert,
  Siren,
  Terminal,
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
}: {
  label: string;
  value: string | number;
  tone: 'red' | 'amber' | 'cyan' | 'green';
  icon: typeof Radar;
}) {
  const map = {
    red: 'text-brand-red bg-brand-red/10 border-brand-red/40',
    amber: 'text-brand-amber bg-brand-amber/10 border-brand-amber/40',
    cyan: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/40',
    green: 'text-brand-green bg-brand-green/10 border-brand-green/40',
  } as const;
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg border', map[tone])}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
          <div className="mt-0.5 font-mono text-2xl text-white tabular-nums">{value}</div>
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
  const hh = Math.floor(remaining / 3600);
  const mm = Math.floor((remaining % 3600) / 60);
  const ss = remaining % 60;
  return (
    <div className="card relative overflow-hidden border-brand-red/50 p-4 animate-danger-flash">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="relative mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red/15 text-brand-red animate-pulse-ring">
            <Siren className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-red">
              BREACH WINDOW OPEN
            </div>
            <div className="mt-0.5 text-sm text-gray-300">
              Estimated time to exploit:{' '}
              <span className="font-mono text-brand-amber">{hours}h</span> — based on your
              current exposure.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-brand-red/40 bg-black/40 px-3 py-2 font-mono text-2xl tabular-nums text-brand-red">
            {pad(hh)}:{pad(mm)}:{pad(ss)}
          </div>
          <Link to="/breach-sim" className="btn-danger !py-2.5">
            <Flame className="h-4 w-4" /> Simulate
          </Link>
        </div>
      </div>
    </div>
  );
}

const MODULE_CARDS = [
  {
    to: '/hackers-eye',
    icon: Eye,
    title: "Hacker's Eye View",
    desc: 'Run full recon scan',
    color: '#ff0040',
  },
  {
    to: '/attack-path',
    icon: Brain,
    title: 'AI Attack Path',
    desc: 'Generate kill chain',
    color: '#00f0ff',
  },
  {
    to: '/breach-sim',
    icon: Flame,
    title: 'Breach Simulator',
    desc: 'Simulate live breach',
    color: '#ff0040',
  },
  {
    to: '/dark-web',
    icon: Globe,
    title: 'Dark Web Mirror',
    desc: 'View dark web profile',
    color: '#ff4444',
  },
  {
    to: '/exposure',
    icon: BarChart3,
    title: 'Exposure Score',
    desc: 'Download dossier',
    color: '#EF9F27',
  },
];

export function DashboardHome() {
  usePageTitle('Dashboard');
  const { latestScan, scans, alerts } = useApp();
  const criticalFindings = useMemo(
    () => latestScan?.findings.filter((f) => f.severity === 'CRITICAL').length ?? 0,
    [latestScan],
  );
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Hackability Score"
          value={latestScan?.ars_score ?? '—'}
          tone="red"
          icon={ShieldAlert}
        />
        <StatCard
          label="Critical Findings"
          value={criticalFindings}
          tone="red"
          icon={Zap}
        />
        <StatCard
          label="Total Scans"
          value={scans.length}
          tone="cyan"
          icon={Radar}
        />
        <StatCard
          label="Active Alerts"
          value={alerts.filter((a) => a.status === 'open').length}
          tone="amber"
          icon={Bell}
        />
      </div>

      {/* Breach countdown */}
      {latestScan ? (
        <BreachCountdown hours={latestScan.estimated_time_to_exploit_hours} />
      ) : null}

      {/* Module quick access */}
      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
          Red Team Modules
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {MODULE_CARDS.map((mod, i) => (
            <motion.div
              key={mod.to}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={mod.to}
                className="group flex flex-col items-center gap-2 rounded-xl border border-gray-800 bg-[#0f0f0f] p-4 text-center transition-all hover:border-opacity-60 hover:shadow-lg"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg border"
                  style={{
                    borderColor: `${mod.color}40`,
                    backgroundColor: `${mod.color}10`,
                    color: mod.color,
                  }}
                >
                  <mod.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold text-white">{mod.title}</div>
                <div className="text-[10px] text-gray-500">{mod.desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ARS Gauge + Recent findings */}
      {latestScan ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card flex flex-col items-center justify-center p-6">
            <ArsGauge score={latestScan.ars_score} />
            <div className="mt-2 text-center">
              <div className="font-mono text-xs text-gray-500">
                {latestScan.domain} — {formatDate(latestScan.timestamp)}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
              Latest Findings
            </div>
            <div className="space-y-2">
              {latestScan.findings.slice(0, 5).map((f) => (
                <div key={f.id} className="flex items-center gap-3 text-sm">
                  <SeverityBadge severity={f.severity} />
                  <span className="flex-1 truncate text-gray-300">{f.title}</span>
                  <span className="text-[10px] text-gray-600">{f.source}</span>
                </div>
              ))}
              {latestScan.findings.length > 5 && (
                <Link
                  to="/hackers-eye"
                  className="flex items-center gap-1 text-xs text-brand-red hover:text-brand-red/80"
                >
                  View all {latestScan.findings.length} findings <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center p-12 text-center">
          <Terminal className="mb-3 h-10 w-10 text-gray-700" />
          <div className="text-lg font-semibold text-white">No scans yet</div>
          <div className="mt-1 text-sm text-gray-500">
            Run your first scan to see your attack surface
          </div>
          <Link to="/hackers-eye" className="btn-primary mt-4">
            <Radar className="h-4 w-4" /> Start Recon
          </Link>
        </div>
      )}

      {/* Recent alerts */}
      {alerts.length > 0 ? (
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Recent Alerts
            </div>
            <Link
              to="/alerts"
              className="flex items-center gap-1 text-xs text-brand-red hover:text-brand-red/80"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg border border-gray-800 bg-black/30 p-3 text-sm"
              >
                <SeverityBadge severity={a.severity} />
                <span className="text-gray-400">{a.country_flag}</span>
                <span className="flex-1 truncate text-gray-300">
                  {a.ip} — {a.asset_used}
                </span>
                <span className="text-[10px] text-gray-600">{formatDate(a.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Scan history */}
      {scans.length > 0 ? (
        <div className="card p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
            Scan History
          </div>
          <div className="space-y-2">
            {scans.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg border border-gray-800 bg-black/30 p-3 text-sm"
              >
                <span
                  className={cn(
                    'rounded px-2 py-0.5 font-mono text-xs font-bold',
                    s.ars_score >= 70 ? 'bg-brand-red/20 text-brand-red' :
                    s.ars_score >= 40 ? 'bg-brand-amber/20 text-brand-amber' :
                    'bg-brand-green/20 text-brand-green',
                  )}
                >
                  {s.ars_score}
                </span>
                <span className="flex-1 font-mono text-gray-300">{s.domain}</span>
                <span className="text-[10px] text-gray-600">{formatDate(s.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
