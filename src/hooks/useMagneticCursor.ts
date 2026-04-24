import { useEffect, useRef, useState } from 'react';

export function useMagneticCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const real = useRef({ x: -200, y: -200 });
  const anim = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      real.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let cx = -200,
      cy = -200;

    const tick = () => {
      cx = lerp(cx, real.current.x, 0.1);
      cy = lerp(cy, real.current.y, 0.1);
      setPos({ x: cx, y: cy });
      anim.current = requestAnimationFrame(tick);
    };
    anim.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(anim.current!);
    };
  }, []);

  return { lerped: pos, real };
}
