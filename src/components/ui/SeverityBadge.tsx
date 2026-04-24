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
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-widest',
        classes[severity],
        className,
      )}
    >
      {severity}
    </span>
  );
}
