import { cn } from '@/lib/utils';

export type PulseDotColor = 'green' | 'red' | 'amber' | 'blue';
export type PulseDotSize = 'sm' | 'md' | 'lg';

const COLOR_MAP: Record<PulseDotColor, { dot: string; ring: string; animClass: string }> = {
  green: { dot: 'bg-emerald-500', ring: 'bg-emerald-400', animClass: 'animate-ring-pulse-green' },
  red:   { dot: 'bg-red-500',     ring: 'bg-red-400',     animClass: 'animate-ring-pulse-red' },
  amber: { dot: 'bg-amber-500',   ring: 'bg-amber-400',   animClass: 'animate-ring-pulse-amber' },
  blue:  { dot: 'bg-indigo-500',  ring: 'bg-indigo-400',  animClass: 'animate-ring-pulse-blue' },
};

const SIZE_MAP: Record<PulseDotSize, { wrap: string; dot: string; ring1: string; ring2: string }> = {
  sm: { wrap: 'h-3 w-3', dot: 'h-2 w-2', ring1: 'h-3 w-3', ring2: 'h-4 w-4' },
  md: { wrap: 'h-4 w-4', dot: 'h-2.5 w-2.5', ring1: 'h-4 w-4', ring2: 'h-6 w-6' },
  lg: { wrap: 'h-5 w-5', dot: 'h-3 w-3', ring1: 'h-5 w-5', ring2: 'h-7 w-7' },
};

interface LivePulseDotProps {
  color?: PulseDotColor;
  size?: PulseDotSize;
  className?: string;
}

export function LivePulseDot({ color = 'green', size = 'md', className }: LivePulseDotProps) {
  const c = COLOR_MAP[color];
  const s = SIZE_MAP[size];

  return (
    <span className={cn('relative inline-flex items-center justify-center', s.wrap, className)}>
      {/* Outer expanding ring 2 */}
      <span
        className={cn(
          'absolute rounded-full opacity-30',
          c.ring,
          s.ring2,
        )}
        style={{
          animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
          animationDelay: '0.3s',
        }}
      />
      {/* Outer expanding ring 1 */}
      <span
        className={cn(
          'absolute animate-ping rounded-full opacity-60',
          c.ring,
          s.ring1,
        )}
      />
      {/* Inner solid dot */}
      <span className={cn('relative rounded-full', c.dot, s.dot)} />
    </span>
  );
}
