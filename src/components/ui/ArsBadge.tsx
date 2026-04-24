import { cn } from '@/lib/utils';
import { arsColor, arsLabel } from '@/lib/utils';

const toneMap = {
  green: 'border-brand-success/50 text-brand-success bg-brand-success/10',
  amber: 'border-brand-amber/50 text-brand-amber bg-brand-amber/10',
  red: 'border-brand-danger/50 text-brand-danger bg-brand-danger/10',
} as const;

export function ArsBadge({ score, className }: { score: number; className?: string }) {
  const tone = toneMap[arsColor(score)];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold',
        tone,
        className,
      )}
    >
      <span className="font-mono text-[11px] opacity-70">ARS</span>
      <span className="text-sm font-bold">{score}</span>
      <span className="text-[10px] tracking-wider opacity-80">{arsLabel(score)}</span>
    </span>
  );
}
