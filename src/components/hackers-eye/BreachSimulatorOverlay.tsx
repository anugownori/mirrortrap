import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Flame,
  HardDrive,
  Radio,
  ShieldX,
  Skull,
  Timer,
  X,
} from 'lucide-react';
import type { ScanResult } from '@/lib/types';
import type { AttackChain, BreachSim } from '@/lib/hackersEye';
import { buildBreachSim } from '@/lib/hackersEye';
import { ParticleField } from './ParticleField';
import { cn } from '@/lib/utils';

interface Props {
  onClose: () => void;
  scan: ScanResult;
  chain: AttackChain;
}

function formatBytes(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  return `${(n / 1000).toFixed(0)} KB`;
}

export function BreachSimulatorOverlay({ onClose, scan, chain }: Props) {
  const sim: BreachSim = useMemo(() => buildBreachSim(scan, chain), [scan, chain]);
  const [t, setT] = useState(0);
  const [done, setDone] = useState(false);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    startRef.current = performance.now();
    const dur = 22_000; // 22s compressed
    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / dur;
      const secs = Math.min(sim.total_seconds, Math.round(elapsed * sim.total_seconds));
      setT(secs);
      if (elapsed >= 1) {
        setDone(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [sim.total_seconds]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const progress = (t / sim.total_seconds) * 100;
  const bytesNow = Math.round((sim.bytes_exfil * t) / sim.total_seconds);
  const filesNow = Math.round((sim.files_exfil * t) / sim.total_seconds);
  const recordsNow = Math.round((sim.records_exposed * t) / sim.total_seconds);
  const firedSteps = sim.steps.filter((s) => s.at_seconds <= t);

  return (
    <div className="fixed inset-0 z-[80] bg-[#050505] text-white">
      <ParticleField variant="matrix" className="absolute inset-0 opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-transparent to-transparent" />

      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full border border-red-500/40 bg-black/60 p-2 text-red-300 hover:bg-red-500/20"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative mx-auto flex h-full max-w-6xl flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-red-400">
            <AlertTriangle className="h-3.5 w-3.5 animate-pulse" /> Simulated breach of{' '}
            <span className="text-red-200">{scan.domain}</span>
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-sm text-red-200">
            <Timer className="h-4 w-4" />
            {t}s
            <span className="text-slate-500">/ {sim.total_seconds}s</span>
          </div>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-red-950/60">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-red-400 to-red-200 transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-3">
            <div className="grid grid-cols-3 gap-3">
              <StatTile label="Records exfil" value={recordsNow.toLocaleString('en-IN')} icon={HardDrive} />
              <StatTile label="Files exfil" value={filesNow.toLocaleString('en-IN')} icon={Radio} />
              <StatTile label="Bytes over C2" value={formatBytes(bytesNow)} icon={Flame} />
            </div>

            <div className="relative flex-1 overflow-hidden rounded-xl border border-red-900/60 bg-black/70 p-4 font-mono text-[12.5px] leading-relaxed">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-red-300">
                <ShieldX className="h-3 w-3" /> live attack log — attacker side
              </div>
              <div className="space-y-1.5 overflow-y-auto pr-2" style={{ maxHeight: '42vh' }}>
                {firedSteps.map((s, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded border-l-2 px-3 py-2',
                      s.tone === 'crit'
                        ? 'border-red-500 bg-red-500/10 text-red-200'
                        : s.tone === 'danger'
                        ? 'border-red-400 bg-red-500/5 text-red-300'
                        : s.tone === 'warn'
                        ? 'border-amber-500 bg-amber-500/5 text-amber-200'
                        : 'border-emerald-700 bg-emerald-500/5 text-emerald-200',
                    )}
                  >
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                      <span>[t+{s.at_seconds.toString().padStart(3, '0')}s]</span>
                      <span className="text-white">{s.label}</span>
                    </div>
                    <div className="mt-0.5">{s.detail}</div>
                  </div>
                ))}
                {!done ? (
                  <div className="text-red-400">
                    <span className="inline-block h-3 w-2 animate-caret-blink bg-red-400 align-middle" />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="relative overflow-hidden rounded-xl border border-red-700/60 bg-[#0a0000] p-4">
              <div className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-red-400">
                <Skull className="h-3.5 w-3.5" /> generated ransom note
              </div>
              <pre className="max-h-[46vh] overflow-y-auto whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-red-200">
                {sim.ransom_note}
              </pre>
            </div>

            {done ? (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-100 animate-fade-in">
                <div className="text-[11px] uppercase tracking-[0.22em] text-amber-300">
                  That breach took {Math.floor(sim.total_seconds / 60)}m {sim.total_seconds % 60}s.
                </div>
                <div className="mt-1 text-white">
                  MirrorTrap PhantomShield would have caught step 2 in 0.3 seconds and frozen the
                  attacker there — no data loss, no ransom note, no 3 a.m. board call.
                </div>
                <button
                  onClick={onClose}
                  className="mt-3 rounded-md border border-amber-500/60 bg-amber-500/20 px-3 py-1.5 text-[12px] font-semibold text-amber-100 hover:bg-amber-500/30"
                >
                  Close — show me the fix
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Ic,
}: {
  label: string;
  value: string;
  icon: typeof HardDrive;
}) {
  return (
    <div className="rounded-lg border border-red-900/60 bg-black/60 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-red-300">
        <Ic className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 font-mono text-lg font-bold text-white">{value}</div>
    </div>
  );
}
