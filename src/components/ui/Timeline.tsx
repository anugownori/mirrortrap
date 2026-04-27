import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface TimelineStep {
  step: number;
  title: string;
  subtitle?: string;
  timestamp?: string;
  severity?: 'info' | 'high' | 'critical' | 'success';
  details?: string;
  tool?: string;
  ip?: string;
  confidence?: number;
  icon?: ReactNode;
}

interface TimelineProps {
  steps: TimelineStep[];
  activeStep?: number;
  onStepClick?: (step: number) => void;
}

const SEVERITY_STYLES = {
  info:     { ring: 'border-indigo-500/60',     bg: 'bg-indigo-500/15',    text: 'text-indigo-400', dot: 'bg-indigo-500' },
  high:     { ring: 'border-amber-500/60',      bg: 'bg-amber-500/15',     text: 'text-amber-400',  dot: 'bg-amber-500' },
  critical: { ring: 'border-red-500/70',        bg: 'bg-red-500/15',       text: 'text-red-400',    dot: 'bg-red-500' },
  success:  { ring: 'border-emerald-500/60',    bg: 'bg-emerald-500/15',   text: 'text-emerald-400', dot: 'bg-emerald-500' },
};

function relativeTs(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return iso;
  }
}

export function Timeline({ steps, activeStep, onStepClick }: TimelineProps) {
  return (
    <div className="relative space-y-0">
      {/* Connecting line */}
      <div className="absolute left-5 top-10 bottom-10 w-px bg-gradient-to-b from-indigo-500/40 via-indigo-500/20 to-transparent" />

      {steps.map((step, idx) => {
        const isActive = step.step === activeStep;
        const isCompleted = activeStep !== undefined && step.step < activeStep;
        const styles = SEVERITY_STYLES[step.severity ?? 'info'];
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.step} className={cn('relative', !isLast && 'pb-6')}>
            {/* Step indicator */}
            <div className="flex gap-4">
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => onStepClick?.(step.step)}
                  className={cn(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isActive && `${styles.ring} ${styles.bg} shadow-lg`,
                    isCompleted && 'border-emerald-500/60 bg-emerald-500/20',
                    !isActive && !isCompleted && 'border-white/10 bg-white/5',
                    onStepClick && 'cursor-pointer hover:scale-110',
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-bold',
                        isActive ? styles.text : 'text-text-muted',
                      )}
                    >
                      {step.step}
                    </span>
                  )}
                  {isActive && (
                    <span className={cn(
                      'absolute inset-0 animate-ping rounded-full opacity-30',
                      styles.dot,
                    )} />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className={cn('flex-1 rounded-xl p-4 transition-all duration-300', isActive && `${styles.bg} border border-current/20`)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={cn('font-semibold text-base', isActive ? 'text-text-primary' : 'text-text-secondary')}>
                      {step.title}
                    </div>
                    {step.subtitle && (
                      <div className="mt-0.5 text-sm text-text-muted">{step.subtitle}</div>
                    )}
                  </div>
                  {step.timestamp && (
                    <div className="flex items-center gap-1 text-xs text-text-muted whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {relativeTs(step.timestamp)}
                    </div>
                  )}
                </div>

                {isActive && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    {step.details && (
                      <p className="text-sm text-text-secondary leading-relaxed">{step.details}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs">
                      {step.tool && (
                        <span className="flex items-center gap-1 text-text-muted">
                          <span className="font-semibold text-text-secondary">Tool:</span>
                          <span className="font-mono">{step.tool}</span>
                        </span>
                      )}
                      {step.ip && (
                        <span className="flex items-center gap-1 text-text-muted">
                          <span className="font-semibold text-text-secondary">IP:</span>
                          <span className="font-mono text-amber-400">{step.ip}</span>
                        </span>
                      )}
                      {step.confidence !== undefined && (
                        <span className="flex items-center gap-1 text-text-muted">
                          <span className="font-semibold text-text-secondary">Confidence:</span>
                          <span className={cn('font-mono', styles.text)}>{step.confidence}%</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!isActive && step.confidence !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 rounded-full bg-white/5">
                      <div
                        className={cn('h-full rounded-full', styles.dot)}
                        style={{ width: `${step.confidence}%`, opacity: 0.6 }}
                      />
                    </div>
                    <span className="text-xs text-text-muted">{step.confidence}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
