import { useEffect, useState } from 'react';
import { arsColor, arsLabel } from '@/lib/utils';

const colorMap = {
  green: '#00ff6a',
  amber: '#EF9F27',
  red: '#ff0040',
} as const;

export function ArsGauge({ score, size = 220 }: { score: number; size?: number }) {
  const stroke = size * 0.08;
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1200;
    const from = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(from + (score - from) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const pct = Math.min(100, Math.max(0, displayScore)) / 100;
  const color = colorMap[arsColor(score)];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,0,64,0.1)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{
            transition: 'stroke-dashoffset 80ms linear',
            filter: `drop-shadow(0 0 8px ${color}60)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-[0.25em] text-gray-500">
          Hackability
        </div>
        <div className="mt-1 text-5xl font-bold tabular-nums" style={{ color }}>
          {displayScore}
        </div>
        <div className="text-xs font-semibold tracking-[0.2em]" style={{ color }}>
          {arsLabel(score)}
        </div>
      </div>
    </div>
  );
}
