import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X } from 'lucide-react';
import { useApp } from '@/lib/useApp';
import { cn } from '@/lib/utils';

const toneStyles: Record<string, { bar: string; icon: ReactNode }> = {
  info: {
    bar: 'border-border',
    icon: <Info className="h-4 w-4 text-brand-purple" />,
  },
  success: {
    bar: 'border-brand-success/60 shadow-glow-success',
    icon: <CheckCircle2 className="h-4 w-4 text-brand-success" />,
  },
  danger: {
    bar: 'border-brand-danger/60 shadow-glow-danger',
    icon: <ShieldAlert className="h-4 w-4 text-brand-danger" />,
  },
  amber: {
    bar: 'border-brand-amber/60 shadow-glow-amber',
    icon: <AlertTriangle className="h-4 w-4 text-brand-amber" />,
  },
};

export function Toaster() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const tone = toneStyles[t.tone ?? 'info'];
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto card animate-slide-in-top p-3 flex gap-3 items-start',
              tone.bar,
            )}
          >
            <div className="mt-0.5">{tone.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-100">{t.title}</div>
              {t.body ? <div className="text-xs text-slate-400">{t.body}</div> : null}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-slate-500 hover:text-slate-200"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
