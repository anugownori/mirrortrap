import { useEffect, useRef } from 'react';

const COLORS = ['#C084FC', '#E879F9', '#A855F7', 'rgba(255,255,255,0.8)'];
const COUNT = 100;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  px: number;
  py: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  trail: boolean;
}

function spawn(cx: number, cy: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.5 + Math.random() * 2.5;
  return {
    x: cx,
    y: cy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    px: cx,
    py: cy,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 1 + Math.random() * 1.5,
    life: 0,
    maxLife: 180 + Math.random() * 180,
    trail: Math.random() > 0.6,
  };
}

export function ParticleBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const particles: Particle[] = Array.from({ length: COUNT }, () => {
      const p = spawn(cx, cy);
      p.life = Math.random() * p.maxLife;
      return p;
    });

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      for (const p of particles) {
        p.px = p.x;
        p.py = p.y;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.trail) {
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = p.color.replace(')', `,${alpha * 0.3})`).replace('rgba', 'rgba').replace('rgb(', 'rgba(');
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.includes('rgba')
          ? p.color.replace(/[\d.]+\)$/, `${alpha})`)
          : p.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();

        if (p.life >= p.maxLife) {
          Object.assign(p, spawn(centerX, centerY));
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}
