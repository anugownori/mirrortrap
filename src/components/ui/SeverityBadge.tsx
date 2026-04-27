import { Badge, severityVariant } from './Badge';
import type { Severity } from '@/lib/types';

// Re-export from Badge for new code
export { Badge, severityVariant } from './Badge';
export type { BadgeVariant } from './Badge';

interface SeverityBadgeProps {
  severity: Severity | string;
  className?: string;
}

/**
 * Legacy SeverityBadge — accepts `severity` string prop directly.
 * New code should use `<Badge variant={severityVariant(s)}>` instead.
 */
export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <Badge variant={severityVariant(severity)} className={className}>
      {severity}
    </Badge>
  );
}
