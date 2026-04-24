import { useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardSpotlightProps {
  children: ReactNode;
  className?: string;
}

export function CardSpotlight({ children, className }: CardSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [angle, setAngle] = useState(0);

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const lx = e.clientX - rect.left;
    const ly = e.clientY - rect.top;
    setLocal({ x: lx, y: ly });
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setAngle(Math.atan2(ly - cy, lx - cx) * (180 / Math.PI) + 180);
  };

  return (
    <div
      ref={ref}
      data-cursor="hover"
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'card-spotlight relative overflow-hidden rounded-[14px] border border-[rgba(192,132,252,0.1)] transition-[border-color,box-shadow] duration-300',
        hovered && 'border-[rgba(192,132,252,0.3)]',
        className,
      )}
      style={{
        background: 'rgba(20,14,34,0.55)',
        backdropFilter: 'blur(16px)',
        boxShadow: hovered
          ? 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 32px rgba(0,0,0,0.4), 0 0 32px rgba(192,132,252,0.07)'
          : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Spotlight layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 200ms ease',
          background: `radial-gradient(320px circle at ${local.x}px ${local.y}px, rgba(192,132,252,0.11) 0%, transparent 65%)`,
        }}
      />
      {/* Rotating border glow */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: -1,
            pointerEvents: 'none',
            zIndex: 0,
            borderRadius: 'inherit',
            background: `conic-gradient(from ${angle}deg at 50% 50%, transparent 0deg, rgba(192,132,252,0.5) 0deg, rgba(232,121,249,0.3) 40deg, transparent 80deg)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: 1,
          }}
        />
      )}
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
