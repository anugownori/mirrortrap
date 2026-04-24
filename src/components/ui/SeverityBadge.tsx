import { cn } from '@/lib/utils';
import type { Severity } from '@/lib/types';

const classes: Record<Severity, string> = {
  CRITICAL: 'severity-critical',
  HIGH: 'severity-high',
  MEDIUM: 'severity-medium',
  LOW: 'severity-low',
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5',
        classes[severity],
        className,
      )}
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 500,
        fontSize: '9.5px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}
    >
      {severity === 'CRITICAL' && (
        <span
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#F09595',
            animation: 'critPulse 1.5s ease-in-out infinite',
            display: 'inline-block',
          }}
        />
      )}
      {severity}
    </span>
  );
}
