import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  Code2,
  FileKey,
  Globe,
  Loader2,
  Lock,
  Mail,
  Radar,
  Search,
  Shield,
  Skull,
  Terminal,
} from 'lucide-react';
import { useApp } from '@/lib/useApp';
import { usePageTitle } from '@/lib/usePageTitle';
import type { Finding, ScanSource } from '@/lib/types';
import { generateFindings, computeArsScore, generateScanResult } from '@/lib/mockData';
import { cn, sleep } from '@/lib/utils';

interface TermLine {
  text: string;
  tone: 'green' | 'red' | 'yellow' | 'cyan' | 'dim' | 'white';
}

const SOURCES: Array<{
  key: ScanSource;
  label: string;
  icon: typeof Radar;
  delay: number;
}> = [
  { key: 'crt.sh', label: 'crt.sh — Subdomain Enumeration', icon: Globe, delay: 1200 },
  { key: 'Shodan', label: 'Shodan — Port & Service Scan', icon: Cloud, delay: 1400 },
  { key: 'HaveIBeenPwned', label: 'HaveIBeenPwned — Credential Leaks', icon: FileKey, delay: 1000 },
  { key: 'GitHub', label: 'GitHub Search — Exposed Secrets', icon: Code2, delay: 1600 },
  { key: 'DNS', label: 'DNS/SSL — Certificate & Config', icon: Lock, delay: 800 },
  { key: 'LinkedIn', label: 'OSINT — Employee Harvesting', icon: Mail, delay: 1100 },
  { key: 'DarkWeb', label: 'Dark Web — Breach Mentions', icon: Skull, delay: 1800 },
];

type Phase = 'idle' | 'scanning' | 'complete';

export function HackersEyePage() {
  usePageTitle('Hacker\'s Eye View');
  const { addScan } = useApp();
  const [params] = useSearchParams();
  const [domain, setDomain] = useState(params.get('domain') ?? '');
  const [phase, setPhase] = useState<Phase>('idle');
  const [termLines, setTermLines] = useState<TermLine[]>([]);
  const [currentSource, setCurrentSource] = useState(0);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [score, setScore] = useState(0);
  const termRef = useRef<HTMLDivElement>(null);

  const addLine = useCallback((line: TermLine) => {
    setTermLines((prev) => [...prev, line]);
  }, []);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [termLines]);

  const runScan = useCallback(async () => {
    if (!domain.trim()) return;
    const d = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*/, '');
    setPhase('scanning');
    setTermLines([]);
    setFindings([]);
    setCurrentSource(0);

    addLine({ text: `root@mirrortrap:~# ./recon.sh --target ${d} --full`, tone: 'green' });
    await sleep(600);
    addLine({ text: `[*] MirrorTrap Recon Engine v3.1 initialized`, tone: 'cyan' });
    addLine({ text: `[*] Target: ${d}`, tone: 'cyan' });
    addLine({ text: `[*] Mode: FULL ATTACK SURFACE ENUMERATION`, tone: 'cyan' });
    addLine({ text: ``, tone: 'dim' });
    await sleep(400);

    const allFindings = generateFindings(d);

    for (let i = 0; i < SOURCES.length; i++) {
      const src = SOURCES[i];
      setCurrentSource(i);
      addLine({ text: `[SCANNING] ${src.label}...`, tone: 'dim' });
      await sleep(src.delay);

      const srcFindings = allFindings.filter((f) => f.source === src.key);
      if (srcFindings.length > 0) {
        for (const f of srcFindings) {
          const toneMap: Record<string, TermLine['tone']> = {
            CRITICAL: 'red',
            HIGH: 'yellow',
            MEDIUM: 'yellow',
            LOW: 'green',
          };
          addLine({
            text: `  [${f.severity}] ${f.title}`,
            tone: toneMap[f.severity] ?? 'white',
          });
        }
      } else {
        addLine({ text: `  [OK] Scan complete — minor findings`, tone: 'green' });
      }
      addLine({ text: ``, tone: 'dim' });
    }

    const ars = computeArsScore(allFindings);
    setFindings(allFindings);
    setScore(ars);

    await sleep(500);
    addLine({ text: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, tone: 'red' });
    addLine({ text: `  HACKABILITY SCORE: ${ars}/100`, tone: 'red' });
    addLine({ text: `  FINDINGS: ${allFindings.length} vulnerabilities identified`, tone: 'yellow' });
    addLine({ text: `  EST. TIME TO BREACH: ${(Math.max(0.5, 7 - ars / 20) + Math.random()).toFixed(1)} hours`, tone: 'yellow' });
    addLine({ text: `  STATUS: ${ars >= 70 ? 'CRITICAL — IMMEDIATE ACTION REQUIRED' : ars >= 40 ? 'ELEVATED — REMEDIATION RECOMMENDED' : 'MODERATE'}`, tone: ars >= 70 ? 'red' : 'yellow' });
    addLine({ text: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, tone: 'red' });
    addLine({ text: ``, tone: 'dim' });
    addLine({ text: `root@mirrortrap:~# _`, tone: 'green' });

    const scan = generateScanResult(d);
    scan.ars_score = ars;
    scan.findings = allFindings;
    addScan(scan);

    setPhase('complete');
  }, [domain, addLine, addScan]);

  const toneColors: Record<TermLine['tone'], string> = {
    green: 'text-[#00ff6a]',
    red: 'text-[#ff0040]',
    yellow: 'text-[#EF9F27]',
    cyan: 'text-[#00f0ff]',
    dim: 'text-gray-600',
    white: 'text-gray-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-red/40 bg-brand-red/10 text-brand-red">
          <Radar className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Hacker's Eye View</h1>
          <p className="text-sm text-gray-500">See exactly what an attacker sees in 60 seconds</p>
        </div>
      </div>

      {/* Input bar */}
      <div className="card p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runScan()}
              placeholder="Enter domain, email, or company name..."
              className="w-full rounded-lg border border-border bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-brand-red/50 focus:outline-none focus:ring-1 focus:ring-brand-red/30"
              disabled={phase === 'scanning'}
            />
          </div>
          <button
            onClick={runScan}
            disabled={phase === 'scanning' || !domain.trim()}
            className="btn-primary whitespace-nowrap"
          >
            {phase === 'scanning' ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Scanning...</>
            ) : (
              <><Terminal className="h-4 w-4" /> Start Recon</>
            )}
          </button>
        </div>
      </div>

      {/* Split view: Terminal + Findings */}
      {phase !== 'idle' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Hacker Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
          >
            <div className="mb-2 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#00ff6a]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#00ff6a]">
                Attacker Terminal
              </span>
              {phase === 'scanning' && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-[#00ff6a] animate-pulse-dot" />
                  Scanning source {currentSource + 1}/{SOURCES.length}
                </span>
              )}
            </div>
            <div
              ref={termRef}
              className="flex-1 rounded-xl border border-[#00ff6a]/20 bg-black p-4 font-mono text-[12px] leading-relaxed overflow-y-auto"
              style={{ minHeight: 420, maxHeight: 600 }}
            >
              <AnimatePresence>
                {termLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={toneColors[line.tone]}
                  >
                    {line.text || '\u00A0'}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Findings Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-cyan" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-cyan">
                Discovered Vulnerabilities
              </span>
              {findings.length > 0 && (
                <span className="ml-auto text-xs text-gray-500">{findings.length} findings</span>
              )}
            </div>
            <div
              className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-brand-cyan/20 bg-black/50 p-4"
              style={{ minHeight: 420, maxHeight: 600 }}
            >
              {findings.length === 0 && phase === 'scanning' && (
                <div className="flex h-full items-center justify-center text-sm text-gray-600">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Waiting for findings...
                </div>
              )}
              <AnimatePresence>
                {findings.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'rounded-lg border p-3',
                      f.severity === 'CRITICAL' && 'border-brand-red/40 bg-brand-red/5',
                      f.severity === 'HIGH' && 'border-brand-amber/40 bg-brand-amber/5',
                      f.severity === 'MEDIUM' && 'border-yellow-500/30 bg-yellow-500/5',
                      f.severity === 'LOW' && 'border-brand-green/30 bg-brand-green/5',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-bold',
                          f.severity === 'CRITICAL' && 'bg-brand-red/20 text-brand-red',
                          f.severity === 'HIGH' && 'bg-brand-amber/20 text-brand-amber',
                          f.severity === 'MEDIUM' && 'bg-yellow-500/20 text-yellow-400',
                          f.severity === 'LOW' && 'bg-brand-green/20 text-brand-green',
                        )}
                      >
                        {f.severity}
                      </span>
                      <span className="text-[10px] text-gray-500">{f.source}</span>
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-white">{f.title}</div>
                    <div className="mt-1 text-xs text-gray-400">{f.description}</div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 rounded-xl border border-brand-red/40 bg-brand-red/10 p-4 text-center"
                >
                  <div className="text-5xl font-bold text-brand-red">{score}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-red">
                    Hackability Score
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    {score >= 70
                      ? 'CRITICAL — Your organization is highly vulnerable to attack'
                      : score >= 40
                        ? 'ELEVATED — Significant attack surface detected'
                        : 'MODERATE — Some exposure detected'}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Source status cards */}
      {phase === 'scanning' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {SOURCES.map((src, i) => {
            const Icon = src.icon;
            const done = i < currentSource;
            const active = i === currentSource;
            return (
              <motion.div
                key={src.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'rounded-lg border p-3 text-center text-xs',
                  done && 'border-brand-green/30 bg-brand-green/5',
                  active && 'border-brand-cyan/40 bg-brand-cyan/5 animate-border-pulse',
                  !done && !active && 'border-gray-800 bg-black/30',
                )}
              >
                <Icon className={cn('mx-auto h-5 w-5', done ? 'text-brand-green' : active ? 'text-brand-cyan animate-pulse' : 'text-gray-700')} />
                <div className={cn('mt-1.5', done ? 'text-brand-green' : active ? 'text-brand-cyan' : 'text-gray-700')}>
                  {done ? 'Done' : active ? 'Scanning...' : 'Pending'}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
