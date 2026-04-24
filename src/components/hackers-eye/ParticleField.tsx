import { useEffect, useRef } from 'react';

interface Props {
  variant?: 'network' | 'matrix';
  className?: string;
}

export function ParticleField({ variant = 'network', className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = canvas.clientWidth * DPR;
      canvas.height = canvas.clientHeight * DPR;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (variant === 'network') {
      const N = 42;
      const pts = Array.from({ length: N }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35 * DPR,
        vy: (Math.random() - 0.5) * 0.35 * DPR,
        hue: Math.random() > 0.5 ? 0 : 195, // red / cyan
      }));
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < N; i++) {
          const a = pts[i];
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < 0 || a.x > canvas.width) a.vx *= -1;
          if (a.y < 0 || a.y > canvas.height) a.vy *= -1;
        }
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            const a = pts[i];
            const b = pts[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const max = 140 * DPR;
            if (d < max) {
              const alpha = 1 - d / max;
              ctx.strokeStyle = `hsla(${a.hue},90%,60%,${alpha * 0.22})`;
              ctx.lineWidth = 1 * DPR;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
        for (let i = 0; i < N; i++) {
          const p = pts[i];
          ctx.fillStyle = `hsla(${p.hue},90%,65%,0.85)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2 * DPR, 0, Math.PI * 2);
          ctx.fill();
        }
        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
    } else {
      const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ';
      const font = 14 * DPR;
      const cols = Math.ceil(canvas.width / font);
      const drops = Array.from({ length: cols }, () => Math.random() * -50);
      const draw = () => {
        ctx.fillStyle = 'rgba(10,10,10,0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${font}px JetBrains Mono, ui-monospace, monospace`;
        for (let i = 0; i < cols; i++) {
          const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
          const x = i * font;
          const y = drops[i] * font;
          ctx.fillStyle = i % 9 === 0 ? 'rgba(0,255,170,0.9)' : 'rgba(0,255,170,0.35)';
          ctx.fillText(ch, x, y);
          if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i] += 1;
        }
        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [variant]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
