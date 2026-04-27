import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef<number>(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (Math.abs(to - from) < 0.001) return;

    const start = performance.now();
    startRef.current = start;

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutExpo(t);
      const current = from + (to - from) * eased;

      if (spanRef.current) {
        spanRef.current.textContent =
          prefix + current.toFixed(decimals) + suffix;
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
        if (spanRef.current) {
          spanRef.current.textContent = prefix + to.toFixed(decimals) + suffix;
        }
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration, prefix, suffix, decimals]);

  return (
    <span
      ref={spanRef}
      className={cn('tabular-nums', className)}
    >
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  );
}
