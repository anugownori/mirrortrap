import { useEffect, useRef, useState } from 'react';
import { useMagneticCursor } from '@/hooks/useMagneticCursor';

export function CustomCursor() {
  const { lerped, real } = useMagneticCursor();
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('[data-cursor="hover"], a, button');
      setHovering(!!el);
    };
    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    document.addEventListener('mouseover', onOver);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  useEffect(() => {
    if (dotRef.current) {
      dotRef.current.style.transform = `translate(-50%, -50%) translate(${real.current.x}px, ${real.current.y}px)`;
    }
  });

  const outerScale = clicking ? 0.3 : hovering ? 1.8 : 1;
  const outerBg = clicking ? 'rgba(192,132,252,0.5)' : 'transparent';
  const outerRadius = hovering && !clicking ? '40%' : '50%';

  return (
    <>
      {/* Outer ring - follows lerped position */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 32,
          height: 32,
          borderRadius: outerRadius,
          border: '1px solid rgba(192,132,252,0.6)',
          background: outerBg,
          pointerEvents: 'none',
          zIndex: 9999,
          transform: `translate(-50%, -50%) translate(${lerped.x}px, ${lerped.y}px) scale(${outerScale})`,
          transition: 'transform 200ms cubic-bezier(0.22,1,0.36,1), border-radius 200ms ease, background 150ms ease',
          boxShadow: '0 0 12px rgba(192,132,252,0.4), 0 0 40px rgba(192,132,252,0.1)',
          mixBlendMode: hovering ? 'screen' : 'normal',
        }}
      />
      {/* Inner dot - follows real cursor exactly */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#C084FC',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
    </>
  );
}
