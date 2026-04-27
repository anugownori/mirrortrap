import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { arsScoreColor, arsRiskLabel } from '@/lib/design-system';

interface CircularGaugeProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string; // override auto color
  animationDuration?: number;
  className?: string;
}

function getAutoColor(value: number): string {
  return arsScoreColor(value);
}

export function CircularGauge({
  value,
  size = 160,
  strokeWidth = 12,
  label,
  sublabel,
  color,
  animationDuration = 1200,
  className,
}: CircularGaugeProps) {
  const progressRef = useRef<SVGCircleElement>(null);
  const clampedValue = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;
  const autoColor = color ?? getAutoColor(clampedValue);
  const riskLabel = arsRiskLabel(clampedValue);

  // Tick marks
  const ticks = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const cx = size / 2;
    const cy = size / 2;
    const r1 = radius + strokeWidth * 0.6;
    const r2 = radius + strokeWidth * 1.1;
    return {
      x1: cx + r1 * Math.cos(rad),
      y1: cy + r1 * Math.sin(rad),
      x2: cx + r2 * Math.cos(rad),
      y2: cy + r2 * Math.sin(rad),
    };
  });

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    // Start at full offset (empty), animate to target
    el.style.transition = 'none';
    el.style.strokeDashoffset = String(circumference);
    // Force reflow
    void el.getBoundingClientRect();
    el.style.transition = `stroke-dashoffset ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`;
    el.style.strokeDashoffset = String(offset);
  }, [value, circumference, offset, animationDuration]);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        ))}
        {/* Progress arc */}
        <circle
          ref={progressRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={autoColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{
            filter: `drop-shadow(0 0 8px ${autoColor}80)`,
          }}
        />
      </svg>

      {/* Center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ transform: 'none' }}
      >
        <span
          className="font-mono font-bold tabular-nums leading-none"
          style={{ fontSize: size * 0.25, color: autoColor }}
        >
          {clampedValue}
        </span>
        {label && (
          <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {label}
          </span>
        )}
        {!label && (
          <span className="mt-1 text-xs font-semibold uppercase tracking-wider" style={{ color: autoColor }}>
            {riskLabel}
          </span>
        )}
        {sublabel && (
          <span className="mt-0.5 text-xs text-text-muted">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
