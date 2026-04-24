import { useEffect, useMemo, useRef, useState } from 'react';
import type { Finding, ScanResult } from '@/lib/types';
import { Cpu } from 'lucide-react';

type Tone = 'sys' | 'cmd' | 'ok' | 'warn' | 'err' | 'dim';

interface Line {
  t: Tone;
  text: string;
}

const tones: Record<Tone, string> = {
  sys: 'text-emerald-300',
  cmd: 'text-emerald-200',
  ok: 'text-emerald-400',
  warn: 'text-amber-300',
  err: 'text-red-400',
  dim: 'text-emerald-700',
};

function banner(domain: string): Line[] {
  return [
    { t: 'dim', text: '================================================================' },
    { t: 'sys', text: `  mirrortrap/attacker-eye v4.2  ::  target=${domain}` },
    { t: 'dim', text: '  session:nopersist  proxy:chain[dk][ru][ro]  ttl=900' },
    { t: 'dim', text: '================================================================' },
    { t: 'cmd', text: `$ hackeye init --target ${domain} --mode passive` },
    { t: 'dim', text: '  [*] spinning up OSINT probes...' },
  ];
}

function linesForSource(key: Finding['source'], findings: Finding[], domain: string): Line[] {
  const ok = findings.filter((f) => f.source === key);
  const rows: Line[] = [];
  switch (key) {
    case 'DNS':
      rows.push({ t: 'cmd', text: `$ dig +noall +answer ${domain} ANY @8.8.8.8` });
      if (ok.length === 0) rows.push({ t: 'dim', text: '  [~] dns returned empty' });
      ok.slice(0, 4).forEach((f) => rows.push({ t: 'ok', text: `  [+] ${f.title}` }));
      break;
    case 'crt.sh':
      rows.push({ t: 'cmd', text: `$ curl -s 'https://crt.sh/?q=%25.${domain}&output=json' | jq` });
      if (ok.length) {
        ok.slice(0, 3).forEach((f) =>
          rows.push({
            t: f.severity === 'HIGH' || f.severity === 'CRITICAL' ? 'warn' : 'ok',
            text: `  [+] ${f.title}`,
          }),
        );
        const subs = (ok[0]?.real_data as { subdomains?: string[] })?.subdomains ?? [];
        subs.slice(0, 4).forEach((s) => rows.push({ t: 'dim', text: `      ${s}` }));
      } else {
        rows.push({ t: 'dim', text: '  [~] no certificates indexed for this host' });
      }
      break;
    case 'Shodan':
      rows.push({ t: 'cmd', text: `$ curl -s https://internetdb.shodan.io/$(dig +short ${domain} | head -1)` });
      if (ok.length) {
        ok.forEach((f) =>
          rows.push({
            t: f.severity === 'CRITICAL' ? 'err' : 'warn',
            text: `  [!] ${f.title}`,
          }),
        );
      } else {
        rows.push({ t: 'ok', text: '  [~] no publicly indexed services via Shodan' });
      }
      break;
    case 'GitHub':
      rows.push({ t: 'cmd', text: `$ gh api 'search/code?q="${domain}"+extension:env'` });
      if (ok.length) {
        ok.forEach((f) => rows.push({ t: 'warn', text: `  [!] ${f.title}` }));
      } else {
        rows.push({ t: 'dim', text: '  [~] no high-confidence public leaks' });
      }
      break;
    case 'HaveIBeenPwned':
      rows.push({ t: 'cmd', text: `$ hibp breach-domain ${domain}` });
      if (ok.length) {
        ok.forEach((f) =>
          rows.push({
            t: f.severity === 'CRITICAL' ? 'err' : 'warn',
            text: `  [!] ${f.title}`,
          }),
        );
      } else {
        rows.push({ t: 'dim', text: '  [~] no public breach linked in catalog' });
      }
      break;
    case 'Security Headers':
      rows.push({ t: 'cmd', text: `$ curl -sI https://${domain} | grep -iE 'hsts|csp|x-frame'` });
      ok.forEach((f) => rows.push({ t: 'warn', text: `  [!] ${f.title}` }));
      if (!ok.length) rows.push({ t: 'dim', text: '  [~] headers audit unavailable' });
      break;
  }
  return rows;
}

function buildReel(scan: ScanResult | null, domain: string): Line[] {
  const base = banner(domain);
  if (!scan) {
    return [
      ...base,
      { t: 'dim', text: '  awaiting domain...' },
    ];
  }
  const order: Finding['source'][] = [
    'DNS',
    'crt.sh',
    'Shodan',
    'GitHub',
    'HaveIBeenPwned',
    'Security Headers',
  ];
  const rows: Line[] = [...base];
  order.forEach((k, i) => {
    rows.push({ t: 'dim', text: '' });
    rows.push({ t: 'dim', text: `[${i + 1}/${order.length}] ${k} :: ${scan.findings.filter((f) => f.source === k).length} signal(s)` });
    rows.push(...linesForSource(k, scan.findings, scan.domain));
  });
  rows.push({ t: 'dim', text: '' });
  rows.push({ t: 'dim', text: '================================================================' });
  rows.push({ t: 'err', text: `  HACKABILITY CONFIRMED  ::  ARS=${scan.ars_score}/100  ETT=${scan.estimated_time_to_exploit_hours}h` });
  rows.push({ t: 'warn', text: `  PRIMARY ENTRY  ::  ${scan.primary_entry_path}` });
  rows.push({ t: 'dim', text: '  > proceeding to kill-chain synthesis…' });
  rows.push({ t: 'dim', text: '================================================================' });
  return rows;
}

interface Props {
  scan: ScanResult | null;
  domain: string;
  speedMs?: number;
  onComplete?: () => void;
  paused?: boolean;
}

export function HackerTerminal({ scan, domain, speedMs = 70, onComplete, paused }: Props) {
  const reel = useMemo(() => buildReel(scan, domain), [scan, domain]);
  const [idx, setIdx] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (paused) return;
    if (idx >= reel.length) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }
    const t = setTimeout(() => setIdx((v) => v + 1), speedMs + Math.random() * 40);
    return () => clearTimeout(t);
  }, [idx, reel.length, speedMs, onComplete, paused]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [idx]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-900/60 bg-black p-5 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]">
      <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-3 flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
            <Cpu className="h-3 w-3" /> attacker@hackeye:~
          </span>
        </div>
        <span className="font-mono text-[10px] text-emerald-600">
          {idx}/{reel.length} lines
        </span>
      </div>
      <div
        ref={boxRef}
        className="mt-3 h-[360px] overflow-y-auto font-mono text-[12.5px] leading-relaxed"
      >
        {reel.slice(0, idx).map((l, i) => (
          <div key={i} className={tones[l.t]}>
            {l.text || '\u00A0'}
          </div>
        ))}
        {idx < reel.length ? (
          <span className="inline-block h-3 w-2 bg-emerald-400 align-middle animate-caret-blink" />
        ) : null}
      </div>
    </div>
  );
}
