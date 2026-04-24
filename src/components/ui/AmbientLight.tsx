import { useEffect, useState } from 'react';

export function AmbientLight() {
  const [pos, setPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(192,132,252,0.07) 0%, rgba(147,51,234,0.03) 40%, transparent 70%)`,
      }}
    />
  );
}
