import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Eye,
  Flame,
  Loader2,
  Radar,
  Sparkles,
} from 'lucide-react';
import { HackerTerminal } from '@/components/hackers-eye/HackerTerminal';
import { AttackChainView } from '@/components/hackers-eye/AttackChainView';
import { DarkWebMirrorCard } from '@/components/hackers-eye/DarkWebMirrorCard';
import { HackabilityCard } from '@/components/hackers-eye/HackabilityCard';
import { BreachSimulatorOverlay } from '@/components/hackers-eye/BreachSimulatorOverlay';
import { ParticleField } from '@/components/hackers-eye/ParticleField';
import { useApp } from '@/lib/useApp';
import { runRealScan } from '@/lib/scanApi';
import type { ScanResult } from '@/lib/types';
import {
  buildAttackChain,
  buildDarkWebListing,
  computeHackability,
  generateDossierHtml,
  type AttackChain,
} from '@/lib/hackersEye';
import { usePageTitle } from '@/lib/usePageTitle';

function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '');
}

type Phase = 'idle' | 'recon' | 'synthesizing' | 'ready';

export function HackersViewPage() {
  usePageTitle('Hacker\u2019s Eye View');
  const { latestScan, addScan, pushToast } = useApp();
  const [params, setParams] = useSearchParams();
  const initial = params.get('domain') ?? latestScan?.domain ?? '';
  const [input, setInput] = useState(initial);
  const [domain, setDomain] = useState(initial);
  const [scan, setScan] = useState<ScanResult | null>(
    initial && latestScan?.domain === initial ? latestScan : null,
  );
  const [chain, setChain] = useState<AttackChain | null>(null);
  const [phase, setPhase] = useState<Phase>(scan ? 'ready' : 'idle');
  const [breachOpen, setBreachOpen] = useState(false);
  const [terminalDone, setTerminalDone] = useState(false);
  const runningRef = useRef<string | null>(null);

  const hack = useMemo(() => computeHackability(scan), [scan]);
  const listing = useMemo(() => (scan ? buildDarkWebListing(scan) : null), [scan]);

  const start = useCallback(
    async (raw: string) => {
      const d = normalizeDomain(raw);
      if (!d) return;
      if (runningRef.current === d) return;
      runningRef.current = d;
      setDomain(d);
      setInput(d);
      setPhase('recon');
      setTerminalDone(false);
      setScan(null);
      setChain(null);
      setParams({ domain: d }, { replace: true });
      try {
        const res = await runRealScan({ domain: d });
        setScan(res);
        addScan(res);
        setPhase('synthesizing');
        const built = await buildAttackChain(res);
        setChain(built);
        setPhase('ready');
      } catch {
        pushToast({
          title: 'Recon failed',
          body: 'The OSINT sweep could not complete. Try again in a moment.',
          tone: 'danger',
        });
        setPhase('idle');
      } finally {
        runningRef.current = null;
      }
    },
    [addScan, pushToast, setParams],
  );

  const autoStartRef = useRef(false);
  useEffect(() => {
    if (autoStartRef.current) return;
    if (!initial) return;
    autoStartRef.current = true;
    const id = window.setTimeout(() => {
      void start(initial);
    }, 0);
    return () => window.clearTimeout(id);
  }, [initial, start]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void start(input);
  };

  const onDownload = () => {
    if (!scan || !chain || !listing) return;
    const html = generateDossierHtml({ scan, hack, chain, listing });
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) {
      // Pop-ups blocked — fallback to anchor download.
      const a = document.createElement('a');
      a.href = url;
      a.download = `mirrortrap-dossier-${scan.domain}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const showBody = phase !== 'idle';

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a0a0a] text-white">
      <ParticleField variant="network" className="pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_90%_-10%,rgba(239,68,68,0.16),transparent_60%),radial-gradient(900px_400px_at_-10%_110%,rgba(34,211,238,0.10),transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-5 py-8">
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-red-400">
          <Eye className="h-3.5 w-3.5" /> Hacker&rsquo;s Eye View
          <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-red-300">
            red team simulation
          </span>
        </div>
        <h1 className="mt-2 text-[36px] font-black leading-[1.05] tracking-tight text-white md:text-[44px]">
          See yourself through a <span className="text-red-400">hacker&rsquo;s</span> eyes.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Enter any domain. In 60 seconds MirrorTrap runs the same recon an attacker would — then
          your own AI red-team walks you through the exact steps a breach would take, what ends up
          for sale on the dark web, and how to shut every step down.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-6 flex flex-col gap-3 rounded-xl border border-red-500/30 bg-black/60 p-4 shadow-[0_0_40px_-12px_rgba(239,68,68,0.45)] sm:flex-row sm:items-center"
        >
          <Radar className="hidden h-5 w-5 text-red-400 sm:block" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="yourcompany.com"
            className="flex-1 bg-transparent py-1.5 font-mono text-base text-white placeholder:text-slate-600 focus:outline-none"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={phase === 'recon' || phase === 'synthesizing'}
          />
          <button
            type="submit"
            disabled={phase === 'recon' || phase === 'synthesizing'}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {phase === 'recon' || phase === 'synthesizing' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running recon…
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show me how I look
              </>
            )}
          </button>
        </form>

        {!showBody ? (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <PreviewTile
              title="Module 1 — Hacker&rsquo;s Eye View"
              body="Live green-on-black terminal reel of crt.sh, Shodan, HIBP, GitHub, DNS and header probes."
            />
            <PreviewTile
              title="Module 2 — AI Attack Path"
              body="Multi-step MITRE ATT&CK kill chain built from your real findings. Toggle attacker/defender view."
            />
            <PreviewTile
              title="Module 3 — Breach Simulator"
              body="One red button. Watch a data-specific breach play out in real time with ransom note."
            />
            <PreviewTile
              title="Module 4 — Dark Web Mirror"
              body="Simulated marketplace listing of your org with seller, rep, price in BTC and proof sample."
            />
            <PreviewTile
              title="Module 5 — Hackability Dossier"
              body="0\u2013100 Hackability Score across 5 categories + one-click printable attacker dossier."
            />
            <PreviewTile
              title="Cinematic UI"
              body="Dark black canvas, red / cyan particles, matrix rain on the breach reel. Built to be remembered."
            />
          </div>
        ) : null}

        {showBody ? (
          <div className="mt-6 space-y-5">
            <HackerTerminal
              key={`${domain}:${scan?.id ?? 'recon'}`}
              scan={scan}
              domain={domain}
              onComplete={() => setTerminalDone(true)}
              paused={phase === 'recon' && !scan}
            />

            {phase === 'synthesizing' ? (
              <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-200 animate-fade-in">
                <div className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Synthesizing kill chain from {scan?.findings.length ?? 0} findings…
                </div>
              </div>
            ) : null}

            {scan && chain && listing ? (
              <div className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-5">
                  <div className="lg:col-span-3">
                    <HackabilityCard hack={hack} onDownload={onDownload} />
                  </div>
                  <div className="lg:col-span-2">
                    <BreachButtonCard
                      onClick={() => setBreachOpen(true)}
                      eta={chain.eta_minutes}
                    />
                  </div>
                </div>

                <AttackChainView chain={chain} />

                <DarkWebMirrorCard listing={listing} domain={scan.domain} />

                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 text-sm text-cyan-100">
                  <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-cyan-300">
                    <Sparkles className="h-3.5 w-3.5" /> Next step
                  </div>
                  <p className="mt-1 text-slate-200">
                    Every defender fix above is one PhantomShield decoy away. Upgrade to Enterprise to
                    auto-deploy traps on every step in this kill chain and let MirrorTrap fight back on
                    your behalf in 0.3 seconds.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {scan && chain && breachOpen ? (
        <BreachSimulatorOverlay
          onClose={() => setBreachOpen(false)}
          scan={scan}
          chain={chain}
        />
      ) : null}

      {/* keep terminalDone reactive so Recharts scroll doesn't get stuck */}
      <span className="hidden">{terminalDone ? 'done' : 'running'}</span>
    </div>
  );
}

function PreviewTile({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-black/40 p-4">
      <div className="text-[11px] uppercase tracking-[0.2em] text-red-300">{title}</div>
      <p className="mt-1 text-[13px] text-slate-300">{body}</p>
    </div>
  );
}

function BreachButtonCard({ onClick, eta }: { onClick: () => void; eta: number }) {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-red-600/50 bg-gradient-to-br from-[#1a0000] via-[#0a0000] to-black p-5">
      <div>
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-red-300">
          <AlertTriangle className="h-3 w-3" /> Breach Simulator
        </div>
        <div className="mt-2 text-[18px] font-bold text-white">
          Run the ${eta}-minute breach against yourself.
        </div>
        <p className="mt-1 text-[12.5px] text-slate-300">
          A compressed, domain-specific replay of the kill chain above — files exfiltrated, ransom
          note generated, timer running. No real traffic hits your systems.
        </p>
      </div>
      <button
        onClick={onClick}
        className="group relative mt-4 inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg border border-red-500/70 bg-red-500/90 px-6 py-3 text-base font-bold text-white shadow-[0_0_0_3px_rgba(239,68,68,0.2),0_0_30px_-6px_rgba(239,68,68,0.7)] transition hover:bg-red-500 hover:shadow-[0_0_0_4px_rgba(239,68,68,0.25),0_0_40px_-4px_rgba(239,68,68,0.85)]"
      >
        <Flame className="h-5 w-5 animate-pulse" />
        SIMULATE BREACH
        <span className="pointer-events-none absolute inset-0 animate-pulse-ring rounded-lg" />
      </button>
      <div className="mt-3 text-[11px] text-slate-400">ETA {eta} min · click to begin</div>
    </div>
  );
}
