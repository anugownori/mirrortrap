import * as S from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export function Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 select-none">
      <S.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          'relative h-6 w-11 rounded-full border border-border transition-colors',
          checked ? 'bg-brand-success/40' : 'bg-white/5',
        )}
      >
        <S.Thumb
          className={cn(
            'block h-5 w-5 rounded-full bg-white shadow transition-transform',
            'data-[state=checked]:translate-x-5 translate-x-0.5',
            checked ? 'shadow-glow-success' : '',
          )}
        />
      </S.Root>
      {label ? (
        <span className={cn('text-xs font-semibold', checked ? 'text-brand-success' : 'text-slate-400')}>
          {label}
        </span>
      ) : null}
    </label>
  );
}
