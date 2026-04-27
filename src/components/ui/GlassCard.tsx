import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'none' | 'purple' | 'cyan' | 'red';
  hover?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function GlassCard({ children, className, glow = 'none', hover = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass',
        glow === 'purple' && 'glass-purple',
        glow === 'cyan' && 'glass-cyan',
        glow === 'red' && 'glass-red',
        hover && 'card-hover cursor-pointer',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}
