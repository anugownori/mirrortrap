import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  FileText,
  Fingerprint,
  Ghost,
  Globe,
  Lock,
  Shield,
  ShieldCheck,
  Skull,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '@/lib/useApp';
import { cn } from '@/lib/utils';

interface EnterpriseDemoProps {
  open: boolean;
  onClose: () => void;
  onBackToPlans: () => void;
}

const CHAPTER_DURATIONS = [8000, 8000, 8000, Infinity] as const;
const CHAPTER_TITLES = [
  'The Attack Begins',
  'Neutralization in Real Time',
  'Your 24h Protection Report',
  'Enterprise Plan',
];

export function EnterpriseDemo({ open, onClose, onBackToPlans }: EnterpriseDemoProps) {
  if (!open) return null;
  return (
    <EnterpriseDemoInner onClose={onClose} onBackToPlans={onBackToPlans} />
  );
}

function EnterpriseDemoInner({
  onClose,
  onBackToPlans,
}: Omit<EnterpriseDemoProps, 'open'>) {
  const [chapter, setChapter] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const tickRef = useRef<number | null>(null);
  const { setPlan, pushToast } = useApp();
  const navigate = useNavigate();

  // auto-advance timer (per-chapter) — interval's first tick fills `elapsed` without a sync set
  useEffect(() => {
    const dur = CHAPTER_DURATIONS[chapter];
    if (!Number.isFinite(dur)) return;
    const startedAt = Date.now();
    tickRef.current = window.setInterval(() => {
      setElapsed(Math.min(dur as number, Date.now() - startedAt));
    }, 80);
    const t = window.setTimeout(() => {
      setChapter((c) => Math.min(c + 1, CHAPTER_TITLES.length - 1));
    }, dur);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      window.clearTimeout(t);
    };
  }, [chapter]);

  // esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const progress = useMemo(() => {
    const dur = CHAPTER_DURATIONS[chapter];
    if (!Number.isFinite(dur)) return 1;
    return Math.min(1, elapsed / dur);
  }, [chapter, elapsed]);

  const activateEnterprise = () => {
    setPlan('enterprise');
    pushToast({
      title: 'Enterprise activated!',
      body: 'Redirecting to onboarding…',
      tone: 'success',
    });
    onClose();
    navigate('/protect');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black/85 backdrop-blur-sm animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-[#0A0814]/80 px-5 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-amber/40 bg-brand-amber/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-amber">
          <Sparkles className="h-3 w-3" /> Enterprise Live Demo
        </span>
        <button
          onClick={onBackToPlans}
          className="ml-2 inline-flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to plans
        </button>

        <div className="mx-4 flex flex-1 items-center gap-1">
          {CHAPTER_TITLES.map((title, i) => {
            const isActive = chapter === i;
            const isDone = chapter > i;
            const pct = isDone ? 1 : isActive ? progress : 0;
            return (
              <button
                key={title}
                onClick={() => setChapter(i)}
                className="group flex-1 text-left"
              >
                <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-widest">
                  <span
                    className={cn(
                      'inline-flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-bold',
                      isActive
                        ? 'border-brand-amber bg-brand-amber/20 text-brand-amber'
                        : isDone
                        ? 'border-brand-success bg-brand-success/20 text-brand-success'
                        : 'border-slate-700 bg-slate-900 text-slate-600',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      isActive
                        ? 'text-white'
                        : isDone
                        ? 'text-brand-success'
                        : 'text-slate-500',
                    )}
                  >
                    {title}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800/70">
                  <div
                    className={cn(
                      'h-full transition-all duration-100',
                      isDone
                        ? 'bg-brand-success'
                        : isActive
                        ? 'bg-brand-amber'
                        : 'bg-transparent',
                    )}
                    style={{ width: `${pct * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-bg-terminal text-slate-300 hover:bg-white/5"
          aria-label="Close demo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Chapter content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-6xl">
          {chapter === 0 ? <ChapterOne /> : null}
          {chapter === 1 ? <ChapterTwo /> : null}
          {chapter === 2 ? <ChapterThree /> : null}
          {chapter === 3 ? <ChapterFour onActivate={activateEnterprise} /> : null}
        </div>
      </div>
    </div>
  );
}

/* =======================================================================
 * Chapter 1 — Split-screen attacker vs shield
 * ======================================================================= */

const ATTACK_LINES: Array<{ delay: number; text: string }> = [
  { delay: 0, text: '$ nmap -sV amazon-corp.com' },
  { delay: 600, text: '[+] Port 3306 open — MySQL 8.0' },
  { delay: 1000, text: '[+] Port 22 open — OpenSSH 7.4' },
  { delay: 1600, text: '$ python3 credential_spray.py --target admin@amazon-corp.com' },
  { delay: 2200, text: '[*] Trying password list... 1247 attempts' },
  { delay: 2900, text: '$ curl https://dev.amazon-corp.com/api/v1/employees' },
  { delay: 3600, text: '[+] Response: 200 OK — fetching employee data...' },
  { delay: 4300, text: '$ git clone https://github.com/amazon-corp/internal-config' },
  { delay: 5000, text: '[+] Found: AWS_KEY=AKIA7F3X8N2M9K4L5B6Q in commit history' },
];

const SHIELD_LINES: Array<{ delay: number; text: string }> = [
  { delay: 400, text: '⚡ Port scan detected — deploying decoy services on 3306, 22' },
  { delay: 2000, text: '🛡 Credential spray intercepted — routing to honey login portal' },
  { delay: 3300, text: '🎭 Fake employee data served — 847 fake records delivered' },
  { delay: 4700, text: '🔑 Fake AWS key detected in wild — tripwire armed and tracking' },
  { delay: 5800, text: '✅ ATTACKER IS NOW FULLY INSIDE OUR DECOY NETWORK' },
];

function useTimedLines(lines: Array<{ delay: number; text: string }>) {
  const [shown, setShown] = useState<number[]>([]);
  useEffect(() => {
    const timers = lines.map((l, i) =>
      window.setTimeout(() => setShown((prev) => [...prev, i]), l.delay),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [lines]);
  return shown;
}

function ChapterOne() {
  const atk = useTimedLines(ATTACK_LINES);
  const sld = useTimedLines(SHIELD_LINES);
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-brand-amber">Chapter 1</div>
        <div className="mt-1 text-3xl font-bold text-white">The Attack Begins</div>
        <div className="mt-1 text-sm text-slate-400">
          A real attacker and MirrorTrap Shield — running in parallel, second by second.
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Attacker terminal */}
        <div className="rounded-2xl border-2 border-brand-danger/50 bg-[#140808] p-4 shadow-[0_0_40px_rgba(240,149,149,0.15)]">
          <div className="mb-3 flex items-center gap-2">
            <Skull className="h-4 w-4 text-brand-danger" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-danger">
              Attacker Terminal — Kali Linux
            </span>
            <span className="ml-auto inline-flex h-2 w-2 animate-pulse-dot rounded-full bg-brand-danger" />
          </div>
          <div className="h-[320px] space-y-1 overflow-y-auto font-mono text-[12px] leading-relaxed text-brand-danger/90">
            {ATTACK_LINES.map((l, i) =>
              atk.includes(i) ? (
                <div key={i} className="animate-slide-up">
                  {l.text}
                </div>
              ) : null,
            )}
            <div className="inline-block h-3 w-1.5 animate-caret-blink bg-brand-danger/80 align-middle" />
          </div>
        </div>

        {/* Shield response */}
        <div className="rounded-2xl border-2 border-brand-success/50 bg-[#061612] p-4 shadow-[0_0_40px_rgba(29,158,117,0.2)]">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-success" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-success">
              MirrorTrap Shield — Autonomous Defense
            </span>
            <span className="ml-auto inline-flex h-2 w-2 animate-pulse-dot rounded-full bg-brand-success" />
          </div>
          <div className="h-[320px] space-y-1 overflow-y-auto font-mono text-[12px] leading-relaxed text-brand-success/90">
            {SHIELD_LINES.map((l, i) =>
              sld.includes(i) ? (
                <div key={i} className="animate-slide-up">
                  {l.text}
                </div>
              ) : null,
            )}
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-brand-success/40 bg-brand-success/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-success">
            <Lock className="h-3.5 w-3.5" /> Real System — 100% Untouched
          </div>
        </div>
      </div>
    </div>
  );
}

/* =======================================================================
 * Chapter 2 — Before/after threat cards
 * ======================================================================= */

const THREATS: Array<{
  title: string;
  before: string;
  after: string;
  afterTone: 'success' | 'purple';
}> = [
  {
    title: 'Credential Stuffing Attack',
    before: '1,247 login attempts detected from 185.220.101.47',
    after:
      'All 1,247 attempts hit honey portal. Attacker fingerprinted. IP reported to 47 global threat databases. Time wasted: 4.2 hours.',
    afterTone: 'success',
  },
  {
    title: 'SQL Injection',
    before: 'SQLi attack on /api/users endpoint',
    after:
      'Decoy database served 50,000 fake user records. Attacker downloaded 2.3 GB of useless data. Real DB: untouched.',
    afterTone: 'success',
  },
  {
    title: 'OSINT Reconnaissance',
    before: 'Attacker scraping employee data from LinkedIn + GitHub',
    after:
      'Fake employee profiles served. Fake org chart delivered. Attacker\'s entire intelligence file is now poisoned — they will plan based on completely wrong information.',
    afterTone: 'purple',
  },
  {
    title: 'Ransomware Deployment Attempt',
    before: 'Malicious payload detected attempting file encryption',
    after:
      'Payload executed inside isolated sandbox. Encryption ran on 10,000 fake files. Real files: untouched. Attacker believes attack succeeded.',
    afterTone: 'success',
  },
  {
    title: 'Data Exfiltration',
    before: '3.2 GB data transfer detected to external IP',
    after:
      'All transferred data was AI-generated fake records. Real customer data: 0 bytes exposed. Attacker has been fed garbage.',
    afterTone: 'success',
  },
];

function ChapterTwo() {
  const [shown, setShown] = useState<number[]>([]);
  useEffect(() => {
    const timers = THREATS.map((_, i) =>
      window.setTimeout(() => setShown((p) => [...p, i]), i * 1200),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-brand-amber">Chapter 2</div>
        <div className="mt-1 text-3xl font-bold text-white">Neutralization in Real Time</div>
        <div className="mt-1 text-sm text-slate-400">
          Every threat flipped from red to green, automatically — no human on the keyboard.
        </div>
      </div>

      <div className="space-y-3">
        {THREATS.map((t, i) => (
          <div
            key={t.title}
            className={cn(
              'grid gap-3 transition-all duration-500 md:grid-cols-[260px_24px_1fr]',
              shown.includes(i) ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            {/* Before */}
            <div className="rounded-xl border border-brand-danger/50 bg-brand-danger/10 p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-brand-danger">
                Before · {t.title}
              </div>
              <div className="mt-1.5 text-[12px] text-slate-200">{t.before}</div>
            </div>
            {/* Arrow */}
            <div className="flex items-center justify-center text-brand-amber">→</div>
            {/* After */}
            <div
              className={cn(
                'rounded-xl border p-3',
                t.afterTone === 'success'
                  ? 'border-brand-success/50 bg-brand-success/10'
                  : 'border-brand-purple/50 bg-brand-purple/10',
              )}
            >
              <div
                className={cn(
                  'text-[10px] font-bold uppercase tracking-widest',
                  t.afterTone === 'success' ? 'text-brand-success' : 'text-brand-purple',
                )}
              >
                After · Neutralized in &lt; 0.3s
              </div>
              <div className="mt-1.5 text-[12px] text-slate-100">{t.after}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-[#0A0814] p-4 text-center">
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-around">
          <div>
            <div className="font-mono text-2xl font-bold text-brand-amber">4h 17m</div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">
              Total attacker time wasted
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-brand-success">0 bytes</div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">
              Real data exposed
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold text-brand-success">100%</div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">
              Real systems protected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =======================================================================
 * Chapter 3 — 24h protection report
 * ======================================================================= */

const THREAT_TYPE_PIE = [
  { name: 'Credential', value: 41, color: '#F09595' },
  { name: 'OSINT', value: 28, color: '#7F77DD' },
  { name: 'SQLi', value: 18, color: '#EF9F27' },
  { name: 'Other', value: 13, color: '#1D9E75' },
];

const HOURLY_TREND = Array.from({ length: 24 }, (_, i) => ({
  h: `${i}:00`,
  count: Math.floor(4 + Math.sin(i / 3) * 4 + (i === 3 || i === 14 ? 18 : 0) + Math.random() * 5),
}));

const COUNTRIES = [
  { country: '🇷🇴 Romania', count: 67 },
  { country: '🇨🇳 China', count: 54 },
  { country: '🇷🇺 Russia', count: 48 },
  { country: '🇺🇸 USA', count: 31 },
  { country: 'Other', count: 47 },
];

function ChapterThree() {
  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-brand-amber">Chapter 3</div>
        <div className="mt-1 text-3xl font-bold text-white">
          Everything MirrorTrap did in the last 24 hours — automatically
        </div>
      </div>

      <div className="rounded-2xl border border-brand-success/40 bg-[#061612] p-5">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-brand-success">
          <ShieldCheck className="h-4 w-4" /> MirrorTrap Autonomous Protection Report
          <span className="ml-auto text-slate-500">
            Amazon Corp · Last 24 hours · Enterprise Plan
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ReportStat icon={Shield} label="Threats Detected" value="247" tone="purple" />
          <ReportStat
            icon={CheckCircle2}
            label="Threats Neutralized"
            value="247 (100%)"
            tone="success"
          />
          <ReportStat icon={Ghost} label="Attackers Deceived" value="89" tone="purple" />
          <ReportStat icon={Clock} label="Avg Response Time" value="0.3s" tone="amber" />
          <ReportStat icon={Database} label="Real Data Exposed" value="0 bytes" tone="success" />
          <ReportStat icon={Lock} label="Credentials Protected" value="1,247" tone="success" />
          <ReportStat icon={Globe} label="Countries Blocked" value="34" tone="amber" />
          <ReportStat icon={Cpu} label="Automated Bots Caught" value="201" tone="purple" />
          <ReportStat icon={Fingerprint} label="Human Attackers" value="46" tone="danger" />
          <ReportStat icon={Zap} label="Honey Tokens Fired" value="89" tone="amber" />
          <ReportStat
            icon={Clock}
            label="Attacker Hours Wasted"
            value="847 hrs"
            tone="success"
          />
          <ReportStat icon={FileText} label="Auto-Reports Sent" value="12" tone="purple" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Donut */}
        <div className="card p-4">
          <div className="mb-2 text-[11px] uppercase tracking-widest text-slate-400">
            Threats by type
          </div>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={THREAT_TYPE_PIE}
                  innerRadius={40}
                  outerRadius={65}
                  dataKey="value"
                  stroke="none"
                >
                  {THREAT_TYPE_PIE.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <RTooltip
                  contentStyle={{
                    background: '#0A0814',
                    border: '1px solid rgba(127,119,221,0.3)',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-1 grid grid-cols-2 gap-x-2 text-[11px] text-slate-400">
            {THREAT_TYPE_PIE.map((d) => (
              <li key={d.name} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ background: d.color }}
                />
                {d.name} {d.value}%
              </li>
            ))}
          </ul>
        </div>

        {/* Hourly line */}
        <div className="card p-4">
          <div className="mb-2 text-[11px] uppercase tracking-widest text-slate-400">
            Threats / hour · last 24h (all neutralized)
          </div>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
              <LineChart data={HOURLY_TREND} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="rgba(127,119,221,0.1)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="h"
                  tick={{ fill: '#7a7799', fontSize: 9 }}
                  interval={3}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#7a7799', fontSize: 9 }} axisLine={false} tickLine={false} />
                <RTooltip
                  contentStyle={{
                    background: '#0A0814',
                    border: '1px solid rgba(127,119,221,0.3)',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#1D9E75"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country bars */}
        <div className="card p-4">
          <div className="mb-2 text-[11px] uppercase tracking-widest text-slate-400">
            Top attacker countries
          </div>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
              <BarChart
                data={COUNTRIES}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <XAxis type="number" tick={{ fill: '#7a7799', fontSize: 9 }} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="country"
                  tick={{ fill: '#d4d1ea', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <RTooltip
                  contentStyle={{
                    background: '#0A0814',
                    border: '1px solid rgba(127,119,221,0.3)',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="count" fill="#F09595" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-brand-success/50 bg-brand-success/10 px-4 py-3 text-center text-sm font-bold text-brand-success">
        Your real systems experienced ZERO downtime
      </div>
    </div>
  );
}

function ReportStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
  tone: 'success' | 'amber' | 'purple' | 'danger';
}) {
  const toneClass =
    tone === 'success'
      ? 'text-brand-success border-brand-success/40 bg-brand-success/10'
      : tone === 'amber'
      ? 'text-brand-amber border-brand-amber/40 bg-brand-amber/10'
      : tone === 'danger'
      ? 'text-brand-danger border-brand-danger/40 bg-brand-danger/10'
      : 'text-brand-purple border-brand-purple/40 bg-brand-purple/10';
  return (
    <div className={cn('rounded-lg border p-3', toneClass)}>
      <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-widest opacity-80">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="font-mono text-lg font-bold text-white">{value}</div>
    </div>
  );
}

/* =======================================================================
 * Chapter 4 — Plan features + patch card + CTA
 * ======================================================================= */

const FEATURES = [
  '24/7 Autonomous Threat Detection & Neutralization',
  'Unlimited honey token deployments — auto-refreshed monthly',
  'AI-powered intel poisoning — attackers get fake data automatically',
  'Real-time IP blacklisting — shared to 47 global threat databases',
  'Behavioral fingerprinting — recognizes attackers even on VPN/Tor',
  'Automated monthly security patch reports',
  'Ransomware sandbox isolation',
  'Auto-generated incident reports sent to your team',
  'SOC-grade threat intelligence exports',
  'Dedicated response playbook per threat type',
  'Quarterly security audit by MirrorTrap team',
  'Custom honey asset engineering for your specific stack',
];

function ChapterFour({ onActivate }: { onActivate: () => void }) {
  const [shown, setShown] = useState<number[]>([]);
  useEffect(() => {
    const timers = FEATURES.map((_, i) =>
      window.setTimeout(() => setShown((p) => [...p, i]), i * 150),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-brand-amber">Chapter 4</div>
        <div className="mt-1 text-3xl font-bold text-white">
          Enterprise Plan — Everything Included
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Features */}
        <div className="card p-5">
          <div className="mb-3 text-xs uppercase tracking-widest text-brand-success">
            Autonomous Protection Features
          </div>
          <ul className="space-y-2">
            {FEATURES.map((f, i) => (
              <li
                key={f}
                className={cn(
                  'flex items-start gap-2 text-[13px] text-slate-200 transition-all duration-300',
                  shown.includes(i)
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-1 opacity-0',
                )}
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-success" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Patch card */}
        <div className="rounded-2xl border border-brand-amber/40 bg-[#1a1507] p-5">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber">
            <FileText className="h-4 w-4" /> Security Patch Report — Sample
          </div>
          <div className="mb-1 text-[11px] text-slate-400">
            Generated automatically by MirrorTrap · January 2025
          </div>

          <div className="mt-3">
            <div className="text-[11px] font-bold uppercase tracking-widest text-brand-success">
              Critical patches applied (auto)
            </div>
            <ul className="mt-1.5 space-y-1 text-[12px] text-slate-200">
              <li>• Rotated 3 exposed API credentials</li>
              <li>• Closed 2 unauthenticated subdomains</li>
              <li>• Blocked 34 malicious IP ranges</li>
            </ul>
          </div>

          <div className="mt-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-brand-amber">
              Recommended manual patches
            </div>
            <ul className="mt-1.5 space-y-1 text-[12px] text-slate-200">
              <li>• Update WordPress 5.8 → 6.4</li>
              <li>• Enable MFA on admin@company.com</li>
              <li>• Remove 2019 GitHub commit #a3f9</li>
            </ul>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-lg border border-brand-success/40 bg-brand-success/10 px-3 py-2 text-[12px]">
            <div>
              <div className="text-slate-300">Next audit</div>
              <div className="font-mono text-white">February 15, 2025</div>
            </div>
            <div className="text-right">
              <div className="text-slate-300">Security posture</div>
              <div className="font-mono font-bold text-brand-success">94% Secure</div>
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[94%] bg-brand-success" />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border-2 border-brand-amber/50 bg-gradient-to-b from-[#1a1507] to-[#0A0814] p-6 text-center shadow-[0_0_60px_rgba(239,159,39,0.25)]">
        <button
          onClick={onActivate}
          className="btn-primary !bg-brand-amber !px-8 !py-4 text-base !text-black hover:!bg-brand-amber"
        >
          Activate Enterprise — ₹9,999/month
        </button>
        <div className="mt-2 text-[11px] text-slate-400">
          Cancel anytime · Setup in 10 minutes · Dedicated onboarding call included
        </div>
        <div className="mx-auto mt-4 max-w-xl text-base font-bold text-white">
          While you read this, MirrorTrap neutralized 3 attacks.
          <br />
          Without Enterprise, those were real threats on your real data.
        </div>
      </div>
    </div>
  );
}
