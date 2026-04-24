import { Download, Fingerprint, KeyRound, Network, Timer, UserSearch } from 'lucide-react';
import type { HackabilityBreakdown } from '@/lib/hackersEye';
import { cn } from '@/lib/utils';

interface Props {
  hack: HackabilityBreakdown;
  onDownload: () => void;
  disabled?: boolean;
}

const CATS: Array<{
  key: keyof Omit<HackabilityBreakdown, 'total' | 'grade' | 'verdict'>;
  label: string;
  icon: typeof Fingerprint;
  hint: string;
}> = [
  { key: 'footprint', label: 'Digital footprint', icon: Fingerprint, hint: 'subdomains + brand mentions visible from the open web' },
  { key: 'credentials', label: 'Credential leaks', icon: KeyRound, hint: 'HIBP matches + secrets surfaced in public repos' },
  { key: 'surface', label: 'Attack surface', icon: Network, hint: 'ports + services exposed to the internet' },
  { key: 'patchLag', label: 'Patch lag', icon: Timer, hint: 'missing headers + known CVEs on exposed services' },
  { key: 'socialEng', label: 'Social engineering', icon: UserSearch, hint: 'tech stack clues + employee data hints for phishing' },
];

function gradeTone(grade: HackabilityBreakdown['grade']) {
  switch (grade) {
    case 'F':
      return 'text-red-400 border-red-500/50 bg-red-500/10';
    case 'D':
      return 'text-orange-300 border-orange-500/50 bg-orange-500/10';
    case 'C':
      return 'text-amber-300 border-amber-500/50 bg-amber-500/10';
    case 'B':
      return 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10';
    default:
      return 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';
  }
}

export function HackabilityCard({ hack, onDownload, disabled }: Props) {
  const tone = gradeTone(hack.grade);
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-black/60 p-5">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
        <div className="flex-none">
          <div className="text-[10px] uppercase tracking-[0.22em] text-red-300">Hackability Score</div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="font-mono text-[64px] font-black leading-none text-white">
              {hack.total}
            </div>
            <div className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-sm font-bold', tone)}>
              Grade {hack.grade}
            </div>
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">
            0 = ghost · 100 = gift-wrapped
          </div>
          <p className="mt-3 max-w-sm text-[13px] text-slate-300">{hack.verdict}</p>
          <button
            onClick={onDownload}
            disabled={disabled}
            className="btn-amber mt-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download Attacker Dossier
          </button>
        </div>

        <div className="flex-1 space-y-3">
          {CATS.map((c) => {
            const v = hack[c.key];
            return (
              <div key={c.key}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="inline-flex items-center gap-1.5 text-slate-300">
                    <c.icon className="h-3.5 w-3.5 text-red-300" />
                    {c.label}
                  </span>
                  <span className="font-mono font-semibold text-white">{v}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={cn(
                      'h-full rounded-full transition-[width] duration-700',
                      v >= 70 ? 'bg-red-500' : v >= 45 ? 'bg-amber-400' : v >= 20 ? 'bg-cyan-400' : 'bg-emerald-500',
                    )}
                    style={{ width: `${Math.min(100, v)}%` }}
                  />
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">{c.hint}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
