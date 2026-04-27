import { CircularGauge } from './CircularGauge';
import { arsRiskLabel, arsScoreColor } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface ArsGaugeProps {
  score: number;
  size?: number;
  showDelta?: boolean;
  delta?: number | null;
  className?: string;
}

export function ArsGauge({ score, size = 160, delta, className }: ArsGaugeProps) {
  const riskLabel = arsRiskLabel(score);
  const color = arsScoreColor(score);

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <CircularGauge
        value={score}
        size={size}
        strokeWidth={12}
        sublabel="/ 100"
        animationDuration={1200}
      />
      <div className="text-center">
        <div
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color }}
        >
          {riskLabel} RISK
        </div>
        {delta !== null && delta !== undefined && (
          <div
            className={cn(
              'mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              delta > 0
                ? 'bg-red-500/15 text-red-400'
                : delta < 0
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-white/5 text-text-muted',
            )}
          >
            {delta > 0 ? '▲' : delta < 0 ? '▼' : '—'}{' '}
            {delta > 0 ? '+' : ''}
            {delta} vs last scan
          </div>
        )}
      </div>
    </div>
  );
}
