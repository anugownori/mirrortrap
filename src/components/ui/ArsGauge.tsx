import { useEffect, useState } from 'react';
import { arsLabel } from '@/lib/utils';

export function ArsGauge({ score, size = 220 }: { score: number; size?: number }) {
  const stroke = 5;
  const r = size / 2 - stroke - 4;
  const sweepDeg = 270;
  const startAngle = (360 - sweepDeg) / 2 + 90;
  const sweepRad = (sweepDeg * Math.PI) / 180;
  const c = r * sweepRad;
  const [displayScore, setDisplayScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(c);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1400;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(score * eased));
      const pct = Math.min(100, Math.max(0, score * eased)) / 100;
      setDashOffset(c * (1 - pct));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score, c]);

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
      {/* Radial glow behind gauge */}
      <div
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          left: '-10%',
          top: '-10%',
          background: 'radial-gradient(circle, rgba(192,132,252,0.12) 0%, transparent 65%)',
          filter: 'blur(30px)',
          zIndex: -1,
        }}
      />
      {/* Pulsing ring */}
      <div
        style={{
          position: 'absolute',
          inset: 16,
          borderRadius: '50%',
          animation: 'gaugePulse 4s ease-in-out infinite',
          background: 'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 70%)',
        }}
      />
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="scoreGradient" gradientUnits="userSpaceOnUse"
            x1={cx - r} y1={cy} x2={cx + r} y2={cy}
          >
            <stop offset="0%" stopColor="#1D9E75" />
            <stop offset="45%" stopColor="#C084FC" />
            <stop offset="75%" stopColor="#EF9F27" />
            <stop offset="100%" stopColor="#F09595" />
          </linearGradient>
        </defs>
        {/* Track arc */}
        <path
          d={arcPath(r)}
          fill="none"
          stroke="rgba(192,132,252,0.08)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={arcPath(r)}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: '3.8rem',
            color: 'white',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {displayScore}
        </div>
        <div
          style={{
            fontSize: 9,
            letterSpacing: '0.3em',
            color: 'rgba(245,240,255,0.3)',
            textTransform: 'uppercase',
            marginTop: 4,
          }}
        >
          ARS SCORE
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: '#C084FC',
            textTransform: 'uppercase',
          }}
        >
          {arsLabel(score)}
        </div>
      </div>
    </div>
  );
}
