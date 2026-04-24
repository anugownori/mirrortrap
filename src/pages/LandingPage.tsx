import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/lib/usePageTitle';
import { useEffect, useRef, useState } from 'react';
import { FullscreenParticles } from '@/components/ui/FullscreenParticles';
import { ParticleBurst } from '@/components/ui/ParticleBurst';

/* ── Orchestrated opening animation ─────────────────────── */
function useTimeline() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const steps = [200, 700, 1200, 1400, 1600, 1900, 2100, 2400, 2600, 2800, 3000];
    const timers: number[] = [];
    for (const ms of steps) {
      timers.push(window.setTimeout(() => setT(ms), ms));
    }
    return () => timers.forEach(clearTimeout);
  }, []);
  return t;
}

/* ── Staggered letter fall ──────────────────────────────── */
function FallingText({ text, active, className }: { text: string; active: boolean; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            opacity: active ? 1 : 0,
            transform: active ? 'translateY(0)' : 'translateY(-20px)',
            transition: `opacity 300ms cubic-bezier(0.22,1,0.36,1) ${i * 40}ms, transform 300ms cubic-bezier(0.22,1,0.36,1) ${i * 40}ms`,
          }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

/* ── Corner reticle marks ───────────────────────────────── */
function Reticle({ corner, visible }: { corner: 'tl' | 'tr' | 'bl' | 'br'; visible: boolean }) {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 14,
    height: 14,
    transition: 'transform 200ms cubic-bezier(0.22,1,0.36,1)',
    transform: visible ? 'scale(1)' : 'scale(0)',
  };
  const border = '1.5px solid #E879F9';
  const styles: Record<string, React.CSSProperties> = {
    tl: { ...base, top: -1, left: -1, borderTop: border, borderLeft: border },
    tr: { ...base, top: -1, right: -1, borderTop: border, borderRight: border },
    bl: { ...base, bottom: -1, left: -1, borderBottom: border, borderLeft: border },
    br: { ...base, bottom: -1, right: -1, borderBottom: border, borderRight: border },
  };
  return <span style={styles[corner]} />;
}

export function LandingPage() {
  usePageTitle('MirrorTrap \u2014 See yourself through a hacker\u2019s eyes');
  const t = useTimeline();
  const navigate = useNavigate();
  const [neonOn, setNeonOn] = useState(false);
  const flickerRef = useRef<number>(0);

  // Neon flicker at t=1200
  useEffect(() => {
    if (t < 1200) return;
    let step = 0;
    const flicker = [0.2, 1, 0.3, 1];
    const interval = setInterval(() => {
      if (step < flicker.length) {
        setNeonOn(flicker[step] > 0.5);
        step++;
      } else {
        setNeonOn(true);
        clearInterval(interval);
      }
    }, 100);
    flickerRef.current = interval as unknown as number;
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t >= 1200]);

  return (
    <div style={{ background: '#0D0814', overflow: 'hidden', height: '100vh', position: 'relative' }}>
      {/* Fullscreen particles (atmospheric motes) */}
      {t >= 2600 && <FullscreenParticles />}

      {/* Fog layers */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '35%', height: '100%', background: 'radial-gradient(ellipse 100% 80% at 0% 50%, rgba(45,20,65,0.7) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, width: '35%', height: '100%', background: 'radial-gradient(ellipse 100% 80% at 100% 50%, rgba(45,20,65,0.7) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Vignettes */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,2,12,0.9) 0%, transparent 25%)', pointerEvents: 'none', zIndex: 2 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,2,12,0.95) 0%, transparent 30%)', pointerEvents: 'none', zIndex: 2 }} />

      {/* Ground stripes */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '38%',
          background: 'repeating-linear-gradient(to right, transparent, transparent 46px, rgba(192,132,252,0.04) 46px, rgba(192,132,252,0.04) 48px)',
          transform: t >= 2800 ? 'perspective(300px) rotateX(40deg) scaleY(1)' : 'perspective(300px) rotateX(40deg) scaleY(0)',
          transformOrigin: 'bottom center',
          transition: 'transform 600ms cubic-bezier(0.22,1,0.36,1)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Silhouette shapes */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: '18%',
          transform: t >= 2400 ? 'translateX(0)' : 'translateX(-15%)',
          transition: 'transform 700ms cubic-bezier(0.22,1,0.36,1)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <div style={{ position: 'absolute', left: '20%', bottom: 0, width: 16, height: '55%', background: 'rgba(22,14,36,0.85)', filter: 'blur(1.5px)', clipPath: 'polygon(30% 100%, 70% 100%, 55% 0%, 45% 0%)' }} />
        <div style={{ position: 'absolute', left: '55%', bottom: 0, width: 12, height: '70%', background: 'rgba(22,14,36,0.85)', filter: 'blur(1.5px)', clipPath: 'polygon(20% 100%, 80% 100%, 60% 0%, 40% 0%)' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          height: '100%',
          width: '16%',
          transform: t >= 2400 ? 'translateX(0)' : 'translateX(15%)',
          transition: 'transform 700ms cubic-bezier(0.22,1,0.36,1)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <div style={{ position: 'absolute', right: '25%', bottom: 0, width: 24, height: '50%', background: 'rgba(22,14,36,0.85)', filter: 'blur(1.5px)' }} />
      </div>

      {/* Horizontal line sweep at t=200 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          height: 1,
          background: 'rgba(192,132,252,0.4)',
          transform: 'translateX(-50%)',
          width: t >= 200 && t < 700 ? '100vw' : t >= 700 ? 0 : 0,
          transition: t >= 200 && t < 700
            ? 'width 600ms cubic-bezier(0.22,1,0.36,1)'
            : 'width 200ms ease-in',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* BILLBOARD */}
      <div
        style={{
          position: 'absolute',
          top: '48%',
          left: '50%',
          transform: t >= 700
            ? 'translate(-50%, -50%) scale(1)'
            : 'translate(-50%, -50%) scale(0.05)',
          opacity: t >= 700 ? 1 : 0,
          filter: t >= 700 ? 'blur(0px)' : 'blur(40px)',
          transition: 'transform 900ms cubic-bezier(0.16,1,0.3,1), opacity 900ms cubic-bezier(0.16,1,0.3,1), filter 900ms cubic-bezier(0.16,1,0.3,1)',
          width: 'clamp(480px, 62vw, 860px)',
          aspectRatio: '16/9',
          background: 'radial-gradient(ellipse 70% 80% at 38% 45%, rgba(192,132,252,0.22) 0%, rgba(88,28,135,0.12) 35%, rgba(10,8,20,0.97) 75%)',
          border: neonOn ? '1px solid rgba(232,121,249,0.55)' : '1px solid rgba(232,121,249,0.1)',
          borderRadius: 3,
          boxShadow: neonOn
            ? '0 0 0 1px rgba(192,132,252,0.3), 0 0 25px 6px rgba(192,132,252,0.25), 0 0 70px 20px rgba(192,132,252,0.1), 0 0 140px 40px rgba(147,51,234,0.06), inset 0 0 60px rgba(192,132,252,0.05)'
            : '0 0 0 1px rgba(192,132,252,0.05)',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Particle burst canvas inside billboard */}
        <ParticleBurst />

        {/* Corner reticles */}
        <Reticle corner="tl" visible={t >= 1600} />
        <Reticle corner="tr" visible={t >= 1600} />
        <Reticle corner="bl" visible={t >= 1600} />
        <Reticle corner="br" visible={t >= 1600} />

        {/* Shield silhouette */}
        <div style={{ position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
          <svg width="22%" viewBox="0 0 64 80" fill="none" style={{ width: 'clamp(60px, 12%, 100px)' }}>
            <path
              d="M32 2L4 18v24c0 20 28 34 28 34s28-14 28-34V18L32 2z"
              fill="rgba(10,8,20,0.85)"
              stroke="#C084FC"
              strokeOpacity={0.3}
              strokeWidth={1.5}
            />
            <path d="M32 20v32M20 30h24M22 44h20" stroke="#C084FC" strokeOpacity={0.15} strokeWidth={0.5} />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: -16,
              borderRadius: '50%',
              animation: 'pulse-glow 3s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Title */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(2.8rem, 5.5vw, 5.2rem)',
              letterSpacing: '0.18em',
              color: 'white',
              textShadow: '0 0 30px rgba(232,121,249,0.9), 0 0 70px rgba(192,132,252,0.5), 0 0 120px rgba(147,51,234,0.3)',
              lineHeight: 1,
              margin: 0,
            }}
          >
            <FallingText text="MIRRORTRAP" active={t >= 1400} />
          </h1>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(0.55rem, 1vw, 0.85rem)',
              letterSpacing: '0.35em',
              color: 'rgba(245,240,255,0.45)',
              marginTop: '0.75rem',
              opacity: t >= 1900 ? 1 : 0,
              transform: t >= 1900 ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 200ms ease, transform 200ms ease',
            }}
          >
            SEE YOURSELF THROUGH A HACKER&apos;S EYES
          </p>
        </div>
      </div>

      {/* ENTER SYSTEM button */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(48px, 10vh, 96px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
      >
        <button
          data-cursor="hover"
          onClick={() => navigate('/login')}
          className="enter-system-btn"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: 11,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,255,0.85)',
            background: 'transparent',
            border: '1px solid rgba(245,240,255,0.45)',
            borderRadius: 0,
            padding: '13px 52px',
            cursor: 'none',
            transition: 'all 350ms cubic-bezier(0.22,1,0.36,1)',
            opacity: t >= 2100 ? 1 : 0,
            clipPath: t >= 2100 ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
          }}
        >
          ENTER SYSTEM
        </button>
      </div>
    </div>
  );
}
