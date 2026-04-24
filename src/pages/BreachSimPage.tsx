import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  FileWarning,
  Flame,
  Lock,
  Play,
  Shield,
  Skull,
  Terminal,
  Zap,
} from 'lucide-react';
import { useApp } from '@/lib/useApp';
import { usePageTitle } from '@/lib/usePageTitle';
import { generateBreachSimulation } from '@/lib/attackData';
import type { BreachEvent, BreachSimulation } from '@/lib/types';
import { cn, sleep } from '@/lib/utils';

type Phase = 'ready' | 'running' | 'complete';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formatBreachTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

function BreachEventCard({ event, index }: { event: BreachEvent; index: number }) {
  const severityColors = {
    info: 'border-brand-cyan/30 bg-brand-cyan/5',
    warning: 'border-brand-amber/30 bg-brand-amber/5',
    critical: 'border-brand-red/40 bg-brand-red/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className={cn('rounded-lg border p-3', severityColors[event.severity])}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-gray-500">
          T+{formatBreachTime(event.timestamp)}
        </span>
        <span
          className={cn(
            'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
            event.severity === 'critical' && 'bg-brand-red/20 text-brand-red',
            event.severity === 'warning' && 'bg-brand-amber/20 text-brand-amber',
            event.severity === 'info' && 'bg-brand-cyan/20 text-brand-cyan',
          )}
        >
          {event.action}
        </span>
      </div>
      <div className="mt-1.5 text-sm text-gray-200">{event.detail}</div>
      {event.filesAccessed && (
        <div className="mt-2 space-y-0.5 font-mono text-[11px] text-gray-500">
          {event.filesAccessed.map((f) => (
            <div key={f} className="flex items-center gap-1">
              <FileWarning className="h-3 w-3 text-brand-amber" />
              {f}
            </div>
          ))}
        </div>
      )}
      {event.dataSize && (
        <div className="mt-1 flex items-center gap-1 text-xs text-brand-red">
          <Database className="h-3 w-3" />
          {event.dataSize} exfiltrated
        </div>
      )}
    </motion.div>
  );
}

export function BreachSimPage() {
  usePageTitle('Breach Simulator');
  const { latestScan } = useApp();
  const [phase, setPhase] = useState<Phase>('ready');
  const [sim, setSim] = useState<BreachSimulation | null>(null);
  const [visibleEvents, setVisibleEvents] = useState<BreachEvent[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [showRansom, setShowRansom] = useState(false);
  const eventsRef = useRef<HTMLDivElement>(null);

  const domain = latestScan?.domain ?? 'targetcompany.com';

  useEffect(() => {
    if (eventsRef.current) {
      eventsRef.current.scrollTop = eventsRef.current.scrollHeight;
    }
  }, [visibleEvents]);

  const runBreach = useCallback(async () => {
    setPhase('running');
    setVisibleEvents([]);
    setElapsed(0);
    setShowRansom(false);

    const simulation = generateBreachSimulation(domain);
    setSim(simulation);

    for (let i = 0; i < simulation.events.length; i++) {
      const event = simulation.events[i];
      const prevTime = i > 0 ? simulation.events[i - 1].timestamp : 0;
      const delay = Math.min(2000, (event.timestamp - prevTime) * 40 + 300);
      await sleep(delay);
      setVisibleEvents((prev) => [...prev, event]);
      setElapsed(event.timestamp);
    }

    await sleep(1500);
    setShowRansom(true);
    setPhase('complete');
  }, [domain]);

  const progress = sim ? Math.min(100, (elapsed / sim.totalDurationSeconds) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-red/40 bg-brand-red/10 text-brand-red">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Breach Simulator</h1>
          <p className="text-sm text-gray-500">
            Live animated breach scenario based on actual vulnerabilities
          </p>
        </div>
      </div>

      {/* Big Red Button */}
      {phase === 'ready' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card flex flex-col items-center justify-center p-12"
        >
          <div className="mb-6 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
              Target Domain
            </div>
            <div className="mt-1 font-mono text-2xl text-brand-red">{domain}</div>
          </div>

          <motion.button
            onClick={runBreach}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-brand-red bg-brand-red/10 transition-all hover:bg-brand-red/20 hover:shadow-glow-red"
          >
            <div className="absolute inset-0 rounded-full animate-pulse-ring" />
            <div className="flex flex-col items-center">
              <Play className="h-12 w-12 text-brand-red" />
              <span className="mt-2 text-xs font-bold uppercase tracking-widest text-brand-red">
                Simulate Breach
              </span>
            </div>
          </motion.button>

          <div className="mt-6 max-w-sm text-center text-xs text-gray-500">
            This will simulate a realistic breach scenario based on discovered vulnerabilities.
            No real systems are accessed or harmed.
          </div>
        </motion.div>
      )}

      {/* Running / Complete */}
      {phase !== 'ready' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Event feed */}
          <div className="lg:col-span-2">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-brand-red">
                  <Zap className="h-3 w-3" />
                  {phase === 'running' ? 'BREACH IN PROGRESS' : 'BREACH COMPLETE'}
                </span>
                <span className="font-mono text-gray-500">
                  T+{formatBreachTime(elapsed)} / {sim ? formatBreachTime(sim.totalDurationSeconds) : '--:--'}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-800">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    phase === 'complete' ? 'bg-brand-red' : 'bg-brand-red/80',
                  )}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div
              ref={eventsRef}
              className="space-y-3 overflow-y-auto rounded-xl border border-brand-red/20 bg-black/50 p-4"
              style={{ maxHeight: 600 }}
            >
              {visibleEvents.map((ev, i) => (
                <BreachEventCard key={ev.id} event={ev} index={i} />
              ))}
            </div>
          </div>

          {/* Stats sidebar */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card border-brand-red/40 p-5"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-brand-red">
                Breach Metrics
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-xs text-gray-500">Time Elapsed</div>
                  <div className="font-mono text-3xl text-brand-red">
                    {formatBreachTime(elapsed)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Events Triggered</div>
                  <div className="text-2xl font-bold text-white">{visibleEvents.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Critical Actions</div>
                  <div className="text-2xl font-bold text-brand-red">
                    {visibleEvents.filter((e) => e.severity === 'critical').length}
                  </div>
                </div>
                {sim && phase === 'complete' && (
                  <div>
                    <div className="text-xs text-gray-500">Records Exfiltrated</div>
                    <div className="text-2xl font-bold text-brand-red">
                      {sim.recordsExfiltrated.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {phase === 'running' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card border-brand-red/30 p-5"
              >
                <div className="flex items-center gap-2 text-xs text-brand-red">
                  <Terminal className="h-3.5 w-3.5 animate-pulse" />
                  Live Attack Feed
                </div>
                <div className="mt-2 font-mono text-[11px] text-gray-500">
                  {visibleEvents.length > 0
                    ? visibleEvents[visibleEvents.length - 1].detail
                    : 'Initializing attack simulation...'}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Ransom Note */}
      <AnimatePresence>
        {showRansom && sim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="space-y-6"
          >
            {/* End screen */}
            <div className="card border-brand-red/60 bg-brand-red/5 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Skull className="mx-auto h-16 w-16 text-brand-red" />
              </motion.div>
              <div className="mt-4 font-mono text-3xl font-bold text-brand-red">
                BREACH COMPLETE
              </div>
              <div className="mt-2 text-lg text-gray-300">
                This breach took{' '}
                <span className="font-mono text-brand-red">
                  {Math.floor(sim.totalDurationSeconds / 60)}m {sim.totalDurationSeconds % 60}s
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {sim.recordsExfiltrated.toLocaleString()} records exfiltrated
              </div>
            </div>

            {/* Ransom note */}
            <div className="card border-brand-red/40 p-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-red">
                <Lock className="h-3.5 w-3.5" />
                Simulated Ransom Note
              </div>
              <pre className="whitespace-pre-wrap rounded-lg border border-brand-red/20 bg-black p-4 font-mono text-xs text-brand-red/80">
                {sim.ransomNote}
              </pre>
            </div>

            {/* How to stop it */}
            <div className="card border-[#00ff6a]/30 bg-[#00ff6a]/5 p-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00ff6a]">
                <Shield className="h-3.5 w-3.5" />
                Here's How to Stop It
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { title: 'Rotate all credentials', desc: 'Change Jenkins admin password, rotate AWS keys, update DB credentials' },
                  { title: 'Enable MFA everywhere', desc: 'Enforce multi-factor authentication on all admin interfaces and VPN' },
                  { title: 'Restrict network access', desc: 'Place Jenkins behind VPN, restrict RDS to private subnets only' },
                  { title: 'Implement DLP monitoring', desc: 'Set up CloudTrail alerts, VPC flow logs, and data loss prevention rules' },
                  { title: 'Encrypt backups', desc: 'Enable SSE-KMS on all S3 buckets, encrypt database dumps at rest' },
                  { title: 'Upgrade password hashing', desc: 'Migrate from MD5 to bcrypt/argon2 for all user passwords immediately' },
                ].map((fix) => (
                  <div key={fix.title} className="rounded-lg border border-[#00ff6a]/20 bg-black/30 p-3">
                    <div className="text-sm font-semibold text-[#00ff6a]">{fix.title}</div>
                    <div className="mt-1 text-xs text-gray-400">{fix.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setPhase('ready');
                  setVisibleEvents([]);
                  setSim(null);
                  setShowRansom(false);
                }}
                className="btn-ghost"
              >
                Reset Simulation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
