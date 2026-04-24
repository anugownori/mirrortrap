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
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider',
        classes[severity],
        className,
      )}
    >
      {severity}
    </span>
  );
}
