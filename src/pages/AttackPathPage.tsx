import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Clock,
  Crosshair,
  Shield,
  Zap,
  Target,
} from 'lucide-react';
import { useApp } from '@/lib/useApp';
import { usePageTitle } from '@/lib/usePageTitle';
import { generateKillChain } from '@/lib/attackData';
import type { AttackStep, KillChain } from '@/lib/types';
import { cn } from '@/lib/utils';

const MITRE_COLORS: Record<string, string> = {
  Reconnaissance: '#00f0ff',
  'Initial Access': '#ff0040',
  Execution: '#ff4444',
  Persistence: '#ff6600',
  'Privilege Escalation': '#ff9900',
  'Defense Evasion': '#ffcc00',
  'Credential Access': '#ff0040',
  Discovery: '#00f0ff',
  'Lateral Movement': '#ff6600',
  Collection: '#ff9900',
  Exfiltration: '#ff0040',
  Impact: '#ff0040',
};

function KillChainNode({
  step,
  isActive,
  onClick,
  defenderMode,
}: {
  step: AttackStep;
  isActive: boolean;
  onClick: () => void;
  defenderMode: boolean;
}) {
  const color = MITRE_COLORS[step.mitrePhase] ?? '#ff0040';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: step.step * 0.1 }}
      className="flex items-start gap-4"
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.15 }}
          onClick={onClick}
          className={cn(
            'relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 transition-all',
            isActive ? 'shadow-lg' : 'opacity-70 hover:opacity-100',
          )}
          style={{
            borderColor: color,
            backgroundColor: isActive ? `${color}20` : 'transparent',
            boxShadow: isActive ? `0 0 20px ${color}40` : 'none',
          }}
        >
          <span className="text-sm font-bold" style={{ color }}>
            {step.step}
          </span>
        </motion.div>
        <div className="h-12 w-px" style={{ backgroundColor: `${color}30` }} />
      </div>

      {/* Content */}
      <motion.div
        onClick={onClick}
        className={cn(
          'flex-1 cursor-pointer rounded-xl border p-4 transition-all',
          isActive && 'shadow-lg',
        )}
        style={{
          borderColor: isActive ? `${color}60` : `${color}20`,
          backgroundColor: isActive ? `${color}08` : 'transparent',
        }}
      >
        <div className="flex items-center gap-2 text-xs">
          <span
            className="rounded px-1.5 py-0.5 font-bold"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {step.mitrePhase}
          </span>
          <span className="text-gray-500">{step.mitreTechnique}</span>
          <span className="ml-auto flex items-center gap-1 text-gray-500">
            <Clock className="h-3 w-3" /> {step.timeMinutes}m
          </span>
        </div>
        <div className="mt-2 text-sm font-semibold text-white">{step.title}</div>
        <div className="mt-1 text-xs text-gray-400">{step.description}</div>

        <AnimatePresence>
          {isActive && defenderMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden rounded-lg border border-[#00ff6a]/30 bg-[#00ff6a]/5 p-3"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#00ff6a]">
                <Shield className="h-3.5 w-3.5" />
                DEFENDER FIX
              </div>
              <div className="mt-1 text-xs text-gray-300">{step.fix}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function AttackPathPage() {
  usePageTitle('AI Attack Path Engine');
  const { latestScan } = useApp();
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [defenderMode, setDefenderMode] = useState(false);
  const [chain, setChain] = useState<KillChain | null>(null);
  const [generating, setGenerating] = useState(false);

  const domain = latestScan?.domain ?? 'targetcompany.com';

  const handleGenerate = async () => {
    setGenerating(true);
    setChain(null);
    await new Promise((r) => setTimeout(r, 2000));
    setChain(generateKillChain(domain));
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AI Attack Path Engine</h1>
          <p className="text-sm text-gray-500">AI-generated multi-step attack chain mapped to MITRE ATT&CK</p>
        </div>
      </div>

      {/* Controls */}
      <div className="card flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Target className="h-4 w-4 text-brand-red" />
          Target: <span className="font-mono text-brand-red">{domain}</span>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary"
        >
          {generating ? (
            <><Zap className="h-4 w-4 animate-spin" /> Generating Attack Chain...</>
          ) : (
            <><Brain className="h-4 w-4" /> Generate Kill Chain</>
          )}
        </button>
        {chain && (
          <button
            onClick={() => setDefenderMode((v) => !v)}
            className={cn(
              'btn',
              defenderMode
                ? 'bg-[#00ff6a]/10 text-[#00ff6a] border border-[#00ff6a]/30'
                : 'bg-brand-red/10 text-brand-red border border-brand-red/30',
            )}
          >
            {defenderMode ? (
              <><Shield className="h-4 w-4" /> Defender Mode</>
            ) : (
              <><Crosshair className="h-4 w-4" /> Attacker Mode</>
            )}
          </button>
        )}
      </div>

      {/* AI Loading state */}
      {generating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-8 text-center"
        >
          <div className="mx-auto h-16 w-16 rounded-full border-2 border-brand-cyan/40 bg-brand-cyan/10 p-4">
            <Brain className="h-full w-full text-brand-cyan animate-pulse" />
          </div>
          <div className="mt-4 font-mono text-sm text-brand-cyan">
            Feeding recon data to AI attack engine...
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Analyzing {latestScan?.findings.length ?? 7} findings across {domain}
          </div>
          <div className="mx-auto mt-4 h-1 w-64 overflow-hidden rounded-full bg-gray-800">
            <motion.div
              className="h-full rounded-full bg-brand-cyan"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}

      {/* Kill Chain */}
      {chain && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Kill chain diagram */}
          <div className="lg:col-span-2 space-y-0">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-cyan">
              <Zap className="h-3.5 w-3.5" /> Attack Kill Chain — {chain.steps.length} Steps
            </div>
            {chain.steps.map((step) => (
              <KillChainNode
                key={step.id}
                step={step}
                isActive={activeStep === step.id}
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                defenderMode={defenderMode}
              />
            ))}
          </div>

          {/* Summary panel */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card border-brand-red/40 p-5"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-brand-red">
                Attack Summary
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Total Time to Breach</div>
                  <div className="text-2xl font-bold text-brand-red">
                    {chain.totalTimeMinutes} minutes
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Data at Risk</div>
                  <div className="text-sm font-semibold text-white">{chain.dataAtRisk}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Attack Likelihood</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-800">
                      <motion.div
                        className="h-full rounded-full bg-brand-red"
                        initial={{ width: 0 }}
                        animate={{ width: `${chain.likelihood}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <span className="text-sm font-bold text-brand-red">{chain.likelihood}%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* MITRE phases */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-5"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                MITRE ATT&CK Phases
              </div>
              <div className="mt-3 space-y-2">
                {chain.steps.map((step) => {
                  const color = MITRE_COLORS[step.mitrePhase] ?? '#ff0040';
                  return (
                    <div key={step.id} className="flex items-center gap-2 text-xs">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-gray-400">{step.mitrePhase}</span>
                      <span className="ml-auto font-mono text-gray-600">{step.mitreTechnique}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Severity breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-5"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Risk Breakdown
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => {
                  const count = chain.steps.filter((s) => s.risk === sev).length;
                  const colors = {
                    CRITICAL: 'text-brand-red bg-brand-red/10 border-brand-red/30',
                    HIGH: 'text-brand-amber bg-brand-amber/10 border-brand-amber/30',
                    MEDIUM: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
                    LOW: 'text-brand-green bg-brand-green/10 border-brand-green/30',
                  };
                  return (
                    <div key={sev} className={cn('rounded-lg border p-2 text-center', colors[sev])}>
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-[10px] font-bold uppercase">{sev}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
