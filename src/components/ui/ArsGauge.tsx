import { useEffect, useState } from 'react';
import { arsColor, arsLabel } from '@/lib/utils';

const colorMap = {
  green: '#1D9E75',
  amber: '#EF9F27',
  red: '#F09595',
} as const;

export function ArsGauge({ score, size = 220 }: { score: number; size?: number }) {
  const stroke = 8;
  const r = size / 2 - stroke - 4;
  const sweepDeg = 270;
  const startAngle = (360 - sweepDeg) / 2 + 90;
  const sweepRad = (sweepDeg * Math.PI) / 180;
  const c = r * sweepRad;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1200;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(score * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const pct = Math.min(100, Math.max(0, displayScore)) / 100;
  const color = colorMap[arsColor(score)];
  const cx = size / 2;
  const cy = size / 2;

  const arcPath = (radius: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = startRad + sweepRad;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = sweepDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at center, ${color}15 0%, transparent 70%)`,
        }}
      />
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="ars-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7F77DD" />
            <stop offset="50%" stopColor="#EF9F27" />
            <stop offset="100%" stopColor="#F09595" />
          </linearGradient>
        </defs>
        <path
          d={arcPath(r)}
          fill="none"
          stroke="rgba(127,119,221,0.1)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={arcPath(r)}
          fill="none"
          stroke="url(#ars-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 80ms linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="font-display text-[4rem] font-bold leading-none tabular-nums"
          style={{ color }}
        >
          {displayScore}
        </div>
        <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/40">
          ARS Score
        </div>
        <div className="text-xs font-semibold tracking-[0.2em]" style={{ color }}>
          {arsLabel(score)}
        </div>
      </div>
    </div>
  );
}
