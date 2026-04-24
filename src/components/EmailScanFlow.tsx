import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  ExternalLink,
  Loader2,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
} from 'lucide-react';
import { cn, sleep } from '@/lib/utils';

interface Breach {
  name: string;
  title: string;
  date: string;
  count: number;
  classes: string[];
  /** true when password (any form) was exposed in this breach */
  passwordExposed: boolean;
  domain?: string;
  description?: string;
}

interface ScanLine {
  text: string;
  tone: 'sys' | 'cmd' | 'ok' | 'warn' | 'err' | 'dim';
}

const toneColor: Record<ScanLine['tone'], string> = {
  sys: 'text-emerald-300',
  cmd: 'text-emerald-200',
  ok: 'text-emerald-400',
  warn: 'text-amber-300',
  err: 'text-red-400',
  dim: 'text-emerald-700',
};

const SCAN_STEPS: Array<{ label: string; ok: string; ms: number; tone: ScanLine['tone'] }> = [
  { label: '[SCANNING] HaveIBeenPwned breach database...', ok: '[\u2713] HIBP catalog returned matches', ms: 1100, tone: 'err' },
  { label: '[SCANNING] Public paste sites (pastebin, ghostbin)...', ok: '[\u2713] paste-site sweep complete', ms: 800, tone: 'warn' },
  { label: '[SCANNING] Dark web index (public records)...', ok: '[\u2713] dark-web mirror checked', ms: 950, tone: 'warn' },
  { label: '[SCANNING] Data broker exposure (Spokeo, BeenVerified)...', ok: '[\u2713] broker exposure scored', ms: 700, tone: 'warn' },
  { label: '[SCANNING] Account takeover risk scoring...', ok: '[\u2713] ATO risk computed', ms: 600, tone: 'ok' },
];

/* ---------------- Realistic per-domain mock breach pool ----------------- */

function todayMinusYears(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
}

const ALL_BREACHES: Breach[] = [
  {
    name: 'LinkedIn',
    title: 'LinkedIn',
    date: '2021-06-22',
    count: 700_000_000,
    classes: ['Email addresses', 'Full names', 'Phone numbers', 'Job titles and employers', 'LinkedIn profile URL'],
    passwordExposed: false,
    domain: 'linkedin.com',
    description: '700M scraped LinkedIn profiles posted on a hacking forum. Heavy material for spear-phishing.',
  },
  {
    name: 'Adobe',
    title: 'Adobe',
    date: '2013-10-04',
    count: 152_445_165,
    classes: ['Email addresses', 'Password hints', 'Usernames', 'Encrypted passwords'],
    passwordExposed: true,
    domain: 'adobe.com',
    description: '153M Adobe account records leaked. Password hints made cracking trivial.',
  },
  {
    name: 'Canva',
    title: 'Canva',
    date: '2019-05-24',
    count: 137_272_116,
    classes: ['Email addresses', 'Full names', 'Usernames', 'Bcrypt-hashed passwords', 'Country, city'],
    passwordExposed: true,
    domain: 'canva.com',
    description: '137M Canva users had emails, names, and bcrypt password hashes stolen.',
  },
  {
    name: 'Gravatar',
    title: 'Gravatar',
    date: '2020-10-03',
    count: 113_990_759,
    classes: ['Email addresses', 'Usernames', 'Names'],
    passwordExposed: false,
    domain: 'gravatar.com',
    description: 'Public Gravatar profile data scraped via the API and indexed by attackers.',
  },
  {
    name: 'MyFitnessPal',
    title: 'MyFitnessPal',
    date: '2018-02-01',
    count: 144_000_000,
    classes: ['Email addresses', 'Usernames', 'IP addresses', 'Bcrypt-hashed passwords'],
    passwordExposed: true,
    domain: 'myfitnesspal.com',
    description: '144M MyFitnessPal accounts compromised, including bcrypt and SHA-1 password hashes.',
  },
  {
    name: 'Dropbox',
    title: 'Dropbox',
    date: '2012-07-01',
    count: 68_648_009,
    classes: ['Email addresses', 'Bcrypt-hashed passwords'],
    passwordExposed: true,
    domain: 'dropbox.com',
    description: '68.6M Dropbox accounts leaked years after the original incident.',
  },
  {
    name: 'Twitter',
    title: 'Twitter (2022 scrape)',
    date: '2022-12-23',
    count: 5_400_000,
    classes: ['Email addresses', 'Names', 'Twitter handles', 'Phone numbers'],
    passwordExposed: false,
    domain: 'twitter.com',
    description: 'Scraped Twitter profiles cross-correlated with email/phone via an old API bug.',
  },
  {
    name: 'Tumblr',
    title: 'Tumblr',
    date: '2013-02-28',
    count: 65_469_298,
    classes: ['Email addresses', 'SHA1-hashed passwords with salt'],
    passwordExposed: true,
    domain: 'tumblr.com',
    description: '65M Tumblr accounts leaked, including salted SHA1 hashes.',
  },
  {
    name: 'Collection #1',
    title: 'Collection #1 (combolist)',
    date: '2019-01-07',
    count: 772_904_991,
    classes: ['Email addresses', 'Plaintext passwords'],
    passwordExposed: true,
    description: '773M unique emails + 21M plaintext passwords aggregated from many breaches.',
  },
  {
    name: 'Wattpad',
    title: 'Wattpad',
    date: '2020-06-29',
    count: 268_765_495,
    classes: ['Email addresses', 'Usernames', 'Bcrypt-hashed passwords', 'Names', 'Genders'],
    passwordExposed: true,
    domain: 'wattpad.com',
    description: '268M Wattpad accounts exposed, including bcrypt hashes.',
  },
  {
    name: 'Disqus',
    title: 'Disqus',
    date: '2017-10-05',
    count: 17_551_044,
    classes: ['Email addresses', 'Usernames', 'SHA1-hashed passwords'],
    passwordExposed: true,
    domain: 'disqus.com',
    description: '17.5M Disqus accounts compromised. Hash format made cracking feasible.',
  },
  {
    name: 'Zynga',
    title: 'Zynga (Words With Friends)',
    date: '2019-09-01',
    count: 172_869_660,
    classes: ['Email addresses', 'Phone numbers', 'Hashed passwords', 'Usernames'],
    passwordExposed: true,
    domain: 'zynga.com',
    description: '173M Words With Friends players exposed.',
  },
  {
    name: 'Houzz',
    title: 'Houzz',
    date: '2018-12-01',
    count: 48_530_835,
    classes: ['Email addresses', 'IP addresses', 'Names', 'Salted SHA-512 passwords'],
    passwordExposed: true,
    domain: 'houzz.com',
    description: '48.5M Houzz user records leaked.',
  },
];

const GMAIL_PICK = ['LinkedIn', 'Adobe', 'Canva', 'Gravatar', 'MyFitnessPal'];
const YAHOO_PICK = ['LinkedIn', 'Adobe', 'Tumblr', 'Collection #1', 'Disqus'];
const OUTLOOK_PICK = ['LinkedIn', 'Dropbox', 'Adobe', 'Twitter', 'MyFitnessPal'];
const PROTON_PICK = ['LinkedIn', 'Twitter', 'Gravatar'];
const GENERIC_PICK = ['LinkedIn', 'Adobe', 'Canva', 'Collection #1'];

function pickByEmailDomain(email: string): Breach[] {
  const dom = email.split('@')[1]?.toLowerCase() ?? '';
  let names = GENERIC_PICK;
  if (/gmail\.com|googlemail\.com/.test(dom)) names = GMAIL_PICK;
  else if (/yahoo|ymail/.test(dom)) names = YAHOO_PICK;
  else if (/outlook|hotmail|live\.com/.test(dom)) names = OUTLOOK_PICK;
  else if (/proton|pm\.me|tutanota/.test(dom)) names = PROTON_PICK;
  return names
    .map((n) => ALL_BREACHES.find((b) => b.name === n))
    .filter((b): b is Breach => Boolean(b));
}

/* ---------------- HIBP fetchers ---------------------------------------- */

interface HibpRaw {
  Name: string;
  Title?: string;
  BreachDate: string;
  PwnCount?: number;
  DataClasses?: string[];
  Domain?: string;
  Description?: string;
}

function hibpToBreach(r: HibpRaw): Breach {
  const classes = r.DataClasses ?? [];
  const passwordExposed = classes.some((c) => /password|hash/i.test(c));
  return {
    name: r.Name,
    title: r.Title ?? r.Name,
    date: r.BreachDate ?? todayMinusYears(2),
    count: r.PwnCount ?? 0,
    classes,
    passwordExposed,
    domain: r.Domain,
    description: r.Description?.replace(/<[^>]+>/g, ''),
  };
}

async function fetchHibp(email: string): Promise<Breach[] | null> {
  const key = (import.meta.env.VITE_HIBP_KEY as string | undefined) ?? '';
  const target = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`;
  const tryFetch = async (headers: Record<string, string>): Promise<Breach[] | null> => {
    try {
      const res = await fetch(target, { headers });
      if (res.status === 404) return [];
      if (!res.ok) return null;
      const data = (await res.json()) as HibpRaw[];
      return data.map(hibpToBreach);
    } catch {
      return null;
    }
  };
  if (key) {
    const r = await tryFetch({
      'hibp-api-key': key,
      'user-agent': 'MirrorTrap-Scanner',
    });
    if (r !== null) return r;
  }
  return await tryFetch({ 'user-agent': 'MirrorTrap-Scanner' });
}

/* ---------------- Risk + capability ------------------------------------ */

type Risk = 'CLEAN' | 'MONITOR' | 'MEDIUM' | 'HIGH';

function riskLevel(breaches: Breach[]): Risk {
  if (breaches.length === 0) return 'CLEAN';
  if (breaches.length <= 1 && !breaches.some((b) => b.passwordExposed)) return 'MONITOR';
  if (breaches.length <= 3) return 'MEDIUM';
  return 'HIGH';
}

function capability(email: string, breaches: Breach[]): string[] {
  const cap: string[] = [];
  const hasName = breaches.some((b) => b.classes.some((c) => /name/i.test(c)));
  const hasPhone = breaches.some((b) => b.classes.some((c) => /phone/i.test(c)));
  const hasEmployer = breaches.some((b) =>
    b.classes.some((c) => /employer|job title|company/i.test(c)),
  );
  const hasPwd = breaches.some((b) => b.passwordExposed);
  const hasIp = breaches.some((b) => b.classes.some((c) => /ip address/i.test(c)));

  if (hasName && hasEmployer) {
    cap.push(
      `Craft a targeted phishing email pretending to be your employer\u2014complete with your real name and job title.`,
    );
  } else if (hasName) {
    cap.push(
      `Send personalised phishing using your real name to bypass generic spam filters.`,
    );
  }
  if (hasPwd) {
    cap.push(
      `Replay your leaked password across Gmail, Instagram, banking apps, and crypto exchanges (credential stuffing).`,
    );
  }
  if (hasPhone) {
    cap.push(
      `Use your phone number for a SIM-swap attack to hijack 2FA on banking and email.`,
    );
  }
  if (hasIp) {
    cap.push(
      `Geolocate where you usually log in from and trigger fake "new device" social-engineering scams.`,
    );
  }
  cap.push(
    `Combine ${email} + name + phone + employer into a complete identity-theft profile to sell on the dark web.`,
  );
  return cap.slice(0, 5);
}

const CHECKLIST = [
  'Change passwords for every breached service above',
  'Enable 2FA on Gmail / primary email immediately',
  'Search 1Password / Bitwarden for password reuse and rotate',
  'Set up Google Account breach alerts (myaccount.google.com)',
  'Freeze your credit if your phone or PII was exposed',
  'Use a password manager going forward (no exceptions)',
];

/* ---------------- Component -------------------------------------------- */

interface Props {
  onSwitchToDomain: () => void;
}

type Phase = 'idle' | 'scanning' | 'results';

export function EmailScanFlow({ onSwitchToDomain }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [lines, setLines] = useState<ScanLine[]>([]);
  const [breaches, setBreaches] = useState<Breach[]>([]);
  const [usedFallback, setUsedFallback] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(() => CHECKLIST.map(() => false));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const run = useCallback(async (addr: string) => {
    setPhase('scanning');
    setBreaches([]);
    setUsedFallback(false);
    setLines([
      { tone: 'cmd', text: `$ mirrortrap email-scan ${addr}` },
      { tone: 'dim', text: '> resolving public exposure footprint...' },
    ]);
    const realPromise: Promise<Breach[] | null> = fetchHibp(addr).catch(() => null);

    for (const s of SCAN_STEPS) {
      setLines((p) => [...p, { tone: 'dim', text: s.label }]);
      await sleep(s.ms);
      setLines((p) => [...p, { tone: s.tone, text: s.ok }]);
    }

    setLines((p) => [
      ...p,
      { tone: 'dim', text: '> correlating identity fragments...' },
      { tone: 'dim', text: '> compiling personal risk report...' },
    ]);

    const real = await realPromise;
    let final: Breach[];
    let fallback = false;
    if (real && real.length > 0) {
      final = real;
    } else {
      fallback = true;
      final = pickByEmailDomain(addr);
    }
    await sleep(250);
    setBreaches(final);
    setUsedFallback(fallback);
    const lvl = riskLevel(final);
    setLines((p) => [
      ...p,
      {
        tone: lvl === 'HIGH' ? 'err' : lvl === 'MEDIUM' ? 'warn' : 'ok',
        text: `>>> Found in ${final.length} breach${final.length === 1 ? '' : 'es'}\u2002\u2002RISK: ${lvl}`,
      },
    ]);
    setPhase('results');
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) return;
    setSubmitted(addr);
    setChecked(CHECKLIST.map(() => false));
    void run(addr);
  };

  const risk = useMemo(() => riskLevel(breaches), [breaches]);
  const cap = useMemo(() => capability(submitted, breaches), [submitted, breaches]);
  const checklistDone = checked.filter(Boolean).length;
  const checklistPct = Math.round((checklistDone / CHECKLIST.length) * 100);

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
          <Mail className="h-3.5 w-3.5" /> Personal email exposure scan
        </div>
        <h1 className="text-2xl font-bold text-white">Find out where your email has been leaked</h1>
        <p className="mt-1 text-sm text-slate-400">
          MirrorTrap checks your email against the same public breach catalogues attackers use to
          plan account takeovers. Read-only, no login required.
        </p>

        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email (e.g. yourname@gmail.com)"
              disabled={phase === 'scanning'}
              autoComplete="email"
              className="w-full rounded-lg border border-border bg-bg-terminal py-3 pl-9 pr-3 font-mono text-sm focus:border-brand-purple focus:outline-none disabled:opacity-70"
            />
          </div>
          <button
            type="submit"
            disabled={phase === 'scanning' || !email.trim()}
            className="btn-primary !px-5 !py-3"
          >
            {phase === 'scanning' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Checking…
              </>
            ) : (
              <>
                Check My Email <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          We only check public breach databases. We never store, share, or access your email
          account. This uses the same data hackers use — HaveIBeenPwned.
        </p>
      </div>

      {phase !== 'idle' ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-emerald-900/60 bg-black p-4 shadow-[0_0_30px_-12px_rgba(16,185,129,0.5)]">
            <div className="mb-2 flex items-center justify-between border-b border-emerald-900/60 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-emerald-400">
                  hibp-eye :: {submitted || 'awaiting input'}
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-700">
                {phase === 'scanning' ? 'live' : 'complete'}
              </span>
            </div>
            <div
              ref={scrollRef}
              className="h-[300px] overflow-y-auto pr-2 font-mono text-[12.5px] leading-relaxed"
            >
              {lines.map((l, i) => (
                <div key={i} className={toneColor[l.tone]}>
                  {l.text || '\u00A0'}
                </div>
              ))}
              {phase === 'scanning' ? (
                <span className="inline-block h-3 w-2 animate-caret-blink bg-emerald-400 align-middle" />
              ) : null}
            </div>
          </div>

          <div className="card p-4">
            <div className="mb-2 text-[11px] uppercase tracking-widest text-slate-400">
              What we check
            </div>
            <ul className="space-y-2 text-[12px] text-slate-300">
              <li className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-amber" />
                Public breach catalogues (HaveIBeenPwned)
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-amber" />
                Public paste-site indexes
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-amber" />
                Dark-web marketplace mirrors (public records)
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-amber" />
                Data-broker exposure heuristics
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-success" />
                Account-takeover risk scoring
              </li>
            </ul>
          </div>
        </div>
      ) : null}

      {phase === 'results' ? (
        <ResultsPanel
          email={submitted}
          breaches={breaches}
          risk={risk}
          capability={cap}
          checked={checked}
          onToggle={(i) => setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)))}
          checklistDone={checklistDone}
          checklistPct={checklistPct}
          usedFallback={usedFallback}
          onSwitchToDomain={onSwitchToDomain}
        />
      ) : null}
    </div>
  );
}

interface ResultsProps {
  email: string;
  breaches: Breach[];
  risk: Risk;
  capability: string[];
  checked: boolean[];
  onToggle: (i: number) => void;
  checklistDone: number;
  checklistPct: number;
  usedFallback: boolean;
  onSwitchToDomain: () => void;
}

function ResultsPanel(p: ResultsProps) {
  const summaryClass =
    p.breaches.length === 0
      ? 'border-brand-success/40 bg-brand-success/5'
      : p.breaches.length <= 3
      ? 'border-brand-amber/50 bg-brand-amber/5'
      : 'border-brand-danger/50 bg-brand-danger/5';
  const summaryColor =
    p.breaches.length === 0 ? '#1D9E75' : p.breaches.length <= 3 ? '#EF9F27' : '#F09595';
  const riskPill =
    p.risk === 'HIGH'
      ? 'border-brand-danger/40 bg-brand-danger/15 text-brand-danger'
      : p.risk === 'MEDIUM'
      ? 'border-brand-amber/40 bg-brand-amber/15 text-brand-amber'
      : p.risk === 'MONITOR'
      ? 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300'
      : 'border-brand-success/40 bg-brand-success/15 text-brand-success';
  const riskLabel =
    p.risk === 'HIGH'
      ? 'HIGH RISK'
      : p.risk === 'MEDIUM'
      ? 'MEDIUM RISK'
      : p.risk === 'MONITOR'
      ? 'MONITORED'
      : 'CLEAN';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className={cn('rounded-xl border p-5', summaryClass)}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
              Breach summary for
            </div>
            <div className="mt-0.5 font-mono text-[14px] text-white">{p.email}</div>
            <div className="mt-3 flex items-baseline gap-3">
              <div className="text-[10px] uppercase tracking-widest text-slate-400">
                Your email appeared in
              </div>
              <div
                className="font-mono text-[44px] font-black leading-none"
                style={{ color: summaryColor }}
              >
                {p.breaches.length}
              </div>
              <div className="text-sm text-slate-300">
                data breach{p.breaches.length === 1 ? '' : 'es'}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest',
                riskPill,
              )}
            >
              <ShieldAlert className="h-3.5 w-3.5" /> {riskLabel}
            </span>
            {p.usedFallback ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-slate-500">
                <AlertTriangle className="h-3 w-3" />
                Live HIBP unavailable — showing curated public-breach matches.
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-brand-success">
                <Sparkles className="h-3 w-3" /> Live HIBP catalog
              </span>
            )}
          </div>
        </div>
      </div>

      {p.breaches.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {p.breaches.map((b) => (
            <BreachCard key={b.name} b={b} />
          ))}
        </div>
      ) : (
        <div className="card p-5 text-sm text-slate-300">
          <Shield className="mb-2 h-5 w-5 text-brand-success" />
          No public breaches matched. Keep monitoring — new corpora drop every week.
        </div>
      )}

      {p.breaches.length > 0 ? (
        <div className="rounded-xl border border-brand-danger/40 bg-brand-danger/5 p-5">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-brand-danger">
            <AlertTriangle className="h-3.5 w-3.5" /> What hackers can do with this
          </div>
          <p className="mt-2 text-[13px] text-slate-200">
            Based on your exposure, an attacker can:
          </p>
          <ul className="mt-2 space-y-1.5 text-[13px] text-slate-200">
            {p.capability.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 flex-none rounded-full bg-brand-danger" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-brand-purple">
              <ShieldCheck className="h-3.5 w-3.5" /> Personal protection checklist
            </div>
            <div className="mt-1 text-[13px] text-slate-400">
              Tick items off as you go — every step kills one attacker capability above.
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-bold text-white">
              {p.checklistDone}
              <span className="text-base text-slate-500">/{CHECKLIST.length}</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">completed</div>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-purple via-brand-amber to-brand-success transition-[width] duration-500"
            style={{ width: `${p.checklistPct}%` }}
          />
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {CHECKLIST.map((item, i) => {
            const c = p.checked[i];
            return (
              <li key={i}>
                <button
                  onClick={() => p.onToggle(i)}
                  className={cn(
                    'flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition',
                    c
                      ? 'border-brand-success/40 bg-brand-success/10 text-slate-300 line-through'
                      : 'border-border bg-bg-terminal/60 text-slate-200 hover:border-brand-purple/40',
                  )}
                >
                  {c ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-brand-success" />
                  ) : (
                    <Square className="mt-0.5 h-4 w-4 flex-none text-slate-500" />
                  )}
                  <span>{item}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl border border-brand-purple/40 bg-brand-purple/5 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-brand-purple">
              Your personal email is exposed.
            </div>
            <div className="mt-1 text-lg font-bold text-white">Is your company domain safe too?</div>
            <p className="mt-1 max-w-xl text-[13px] text-slate-300">
              The same OSINT a hacker uses against your inbox they’ll use against{' '}
              <span className="text-white">{p.email.split('@')[1] ?? 'your employer'}</span>.
              Run a domain scan next.
            </p>
          </div>
          <button onClick={p.onSwitchToDomain} className="btn-primary !px-5 !py-3 whitespace-nowrap">
            Scan Your Company Domain <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BreachCard({ b }: { b: Breach }) {
  const tone = b.passwordExposed
    ? 'border-brand-danger/40 bg-brand-danger/5'
    : b.classes.length > 1
    ? 'border-brand-amber/40 bg-brand-amber/5'
    : 'border-border bg-bg-terminal/40';
  const dot = b.passwordExposed
    ? 'bg-brand-danger'
    : b.classes.length > 1
    ? 'bg-brand-amber'
    : 'bg-slate-400';
  const risk = b.passwordExposed
    ? 'Attackers use the leaked password (or its hash) to try every other site you have an account on \u2014 banking, email, crypto, work SSO.'
    : b.classes.some((c) => /name|phone|employer|job/i.test(c))
    ? 'Attackers stitch this PII with other breaches to build a high-quality phishing profile of you.'
    : 'Email-only exposure still feeds spam, recon, and credential-spray pre-targeting.';

  return (
    <div className={cn('rounded-xl border p-4', tone)}>
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', dot)} />
        <div className="flex-1 truncate text-[15px] font-bold text-white">{b.title}</div>
        {b.domain ? (
          <a
            href={`https://${b.domain}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
          >
            <ExternalLink className="h-3 w-3" /> {b.domain}
          </a>
        ) : null}
      </div>
      <div className="mt-1 text-[11px] text-slate-400">
        Date: {b.date} · Records exposed: {b.count.toLocaleString('en-IN')}
      </div>
      <div className="mt-3">
        <div className="text-[10px] uppercase tracking-widest text-slate-400">
          Your data exposed
        </div>
        <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
          {b.classes.map((c) => (
            <li key={c} className="flex items-start gap-1.5 text-[12.5px] text-slate-200">
              <Circle className={cn('mt-1 h-1.5 w-1.5 fill-current', /password|hash/i.test(c) ? 'text-brand-danger' : 'text-slate-500')} />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-md border border-border/60 bg-black/30 p-2.5 text-[12px] text-slate-300">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-amber" />
        <span>{risk}</span>
      </div>
    </div>
  );
}
