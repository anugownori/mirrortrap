import { useState } from 'react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Crosshair,
  Flame,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  Unlock,
} from 'lucide-react';
import type { AttackChain, MitreStep } from '@/lib/hackersEye';
import { cn } from '@/lib/utils';

const TACTIC_ICON: Record<MitreStep['tactic'], typeof Crosshair> = {
  Reconnaissance: Crosshair,
  'Initial Access': Unlock,
  Execution: Flame,
  'Lateral Movement': Network,
  Exfiltration: Target,
};

interface Props {
  chain: AttackChain;
}

export function AttackChainView({ chain }: Props) {
  const [expanded, setExpanded] = useState<string | null>(chain.steps[0]?.id ?? null);
  const [mode, setMode] = useState<'attacker' | 'defender'>('attacker');

  return (
    <div className="relative overflow-hidden rounded-xl border border-red-900/50 bg-gradient-to-b from-[#120507] to-[#0a0a0a] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-red-400">
            <Bot className="h-3.5 w-3.5" /> AI Attack Path Engine
            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-red-300">
              MITRE ATT&CK
            </span>
            {chain.provenance === 'ai' ? (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                <Sparkles className="mr-1 inline h-3 w-3" />
                Claude-generated
              </span>
            ) : (
              <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-slate-300">
                deterministic
              </span>
            )}
          </div>
          <div className="mt-1 text-[17px] font-bold leading-tight text-white">
            {chain.summary}
          </div>
          <div className="mt-0.5 text-[12px] text-slate-400">
            ETA to breach <span className="text-red-300">{chain.eta_minutes} min</span> · Data at risk:{' '}
            <span className="text-amber-300">{chain.data_at_risk}</span>
          </div>
        </div>
        <div className="flex rounded-lg border border-border bg-black/60 p-0.5 text-[11px] font-semibold">
          <button
            onClick={() => setMode('attacker')}
            className={cn(
              'rounded-md px-3 py-1.5 transition',
              mode === 'attacker'
                ? 'bg-red-500/20 text-red-200'
                : 'text-slate-400 hover:text-slate-200',
            )}
          >
            Attacker view
          </button>
          <button
            onClick={() => setMode('defender')}
            className={cn(
              'rounded-md px-3 py-1.5 transition',
              mode === 'defender'
                ? 'bg-cyan-500/15 text-cyan-200'
                : 'text-slate-400 hover:text-slate-200',
            )}
          >
            Defender fix
          </button>
        </div>
      </div>

      <div className="mt-5 hidden items-center gap-2 lg:flex">
        {chain.steps.map((s, i) => {
          const Ic = TACTIC_ICON[s.tactic];
          const active = expanded === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setExpanded(s.id)}
              className={cn(
                'group flex flex-1 flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition',
                active
                  ? 'border-red-500/60 bg-red-500/10 shadow-[0_0_0_1px_rgba(248,113,113,0.3)]'
                  : 'border-border bg-black/40 hover:border-red-500/40',
              )}
            >
              <div className="flex w-full items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-red-300">
                <span className="rounded bg-red-500/20 px-1.5 py-0.5 font-mono text-red-200">
                  {s.techniqueId}
                </span>
                <span className="truncate">{s.tactic}</span>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
                <Ic className="h-3.5 w-3.5 text-red-300" />
                {s.technique}
              </div>
              {i < chain.steps.length - 1 ? (
                <ArrowRight className="absolute hidden" />
              ) : null}
            </button>
          );
        })}
      </div>

      <ol className="mt-4 space-y-2">
        {chain.steps.map((s, i) => {
          const Ic = TACTIC_ICON[s.tactic];
          const open = expanded === s.id;
          return (
            <li
              key={s.id}
              className={cn(
                'overflow-hidden rounded-lg border transition',
                open ? 'border-red-500/50 bg-black/60' : 'border-border bg-black/30',
              )}
            >
              <button
                onClick={() => setExpanded(open ? null : s.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <span
                  className={cn(
                    'flex h-8 w-8 flex-none items-center justify-center rounded-full border font-mono text-[12px] font-bold',
                    open
                      ? 'border-red-500/60 bg-red-500/15 text-red-200'
                      : 'border-border bg-black/50 text-slate-300',
                  )}
                >
                  {i + 1}
                </span>
                <Ic className={cn('h-4 w-4 flex-none', open ? 'text-red-300' : 'text-slate-400')} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    <span className="text-red-300">{s.tactic}</span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      {s.techniqueId}
                    </span>
                    {s.source ? (
                      <span className="rounded bg-slate-800/60 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                        via {s.source}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 truncate text-[14px] font-semibold text-white">
                    {s.technique}
                  </div>
                </div>
                {open ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </button>
              {open ? (
                <div className="grid gap-3 border-t border-border/60 px-4 py-4 md:grid-cols-2">
                  <div
                    className={cn(
                      'rounded-lg border p-3 text-[13px] leading-relaxed',
                      mode === 'attacker'
                        ? 'border-red-500/40 bg-red-500/5'
                        : 'border-border bg-black/40 opacity-60',
                    )}
                  >
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-red-300">
                      <Crosshair className="h-3 w-3" /> Attacker playbook
                    </div>
                    <p className="text-slate-200">{s.attackerNarrative}</p>
                  </div>
                  <div
                    className={cn(
                      'rounded-lg border p-3 text-[13px] leading-relaxed',
                      mode === 'defender'
                        ? 'border-cyan-500/40 bg-cyan-500/5'
                        : 'border-border bg-black/40 opacity-60',
                    )}
                  >
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                      <ShieldCheck className="h-3 w-3" /> Defender fix
                    </div>
                    <p className="text-slate-200">{s.defenderFix}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      MirrorTrap can auto-deploy a decoy for this step on the Enterprise plan.
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
