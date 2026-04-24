import { useState } from 'react';
import { Bitcoin, Clock, Eye, MessageSquare, ShieldCheck, Star } from 'lucide-react';
import type { DarkWebListing } from '@/lib/hackersEye';
import { cn } from '@/lib/utils';

interface Props {
  listing: DarkWebListing;
  domain: string;
}

export function DarkWebMirrorCard({ listing, domain }: Props) {
  const [mode, setMode] = useState<'listing' | 'fix'>('listing');

  return (
    <div className="relative overflow-hidden rounded-xl border border-red-900/60 bg-[#0a0608]">
      <div className="flex items-center justify-between border-b border-red-900/60 bg-black/60 px-4 py-2 font-mono text-[11px] text-red-400">
        <div className="inline-flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span>deepmarket.onion / /listings/{listing.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}</span>
        </div>
        <span className="text-slate-500">Tor · renewed {listing.last_seen_hours}h ago</span>
      </div>

      <div className="flex flex-col gap-0 p-4 md:flex-row md:items-center md:gap-4">
        <div className="relative h-24 w-full flex-none overflow-hidden rounded-lg border border-red-900/60 bg-gradient-to-br from-red-950 to-black md:h-28 md:w-40">
          <div className="absolute inset-0 bg-[radial-gradient(600px_200px_at_0%_0%,rgba(239,68,68,0.18),transparent)]" />
          <div className="absolute bottom-1.5 left-2 right-2 font-mono text-[10px] leading-tight text-red-200">
            <div>$ cat proof/{domain.replace(/\./g, '_')}_sample.csv</div>
            <div className="text-emerald-300">{listing.sample_line}</div>
          </div>
          <div className="absolute right-1.5 top-1.5 rounded bg-red-500/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-red-200">
            live
          </div>
        </div>

        <div className="mt-3 flex-1 md:mt-0">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-red-400">
            <Eye className="h-3 w-3" /> dark-web mirror · simulated from your real findings
          </div>
          <div className="mt-1 text-[17px] font-bold text-white">{listing.title}</div>
          <div className="mt-0.5 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-400">
            <span className="font-mono text-red-300">@{listing.seller}</span>
            <span className="inline-flex items-center gap-1 text-amber-300">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> {listing.seller_rep}/5
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> {listing.vouches} vouches
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> seen {listing.last_seen_hours}h ago
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2 md:mt-0">
          <Bitcoin className="h-5 w-5 text-amber-300" />
          <div>
            <div className="font-mono text-2xl font-bold text-amber-200">{listing.price_btc}</div>
            <div className="text-right text-[11px] text-slate-400">~${listing.price_usd.toLocaleString('en-US')}</div>
          </div>
        </div>
      </div>

      <div className="border-t border-red-900/60 bg-black/50 px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
            {mode === 'listing' ? 'What the seller is offering' : 'How you shut this down'}
          </div>
          <div className="flex rounded-lg border border-border bg-black/60 p-0.5 text-[10px] font-semibold">
            <button
              onClick={() => setMode('listing')}
              className={cn(
                'rounded-md px-2.5 py-1 transition',
                mode === 'listing'
                  ? 'bg-red-500/20 text-red-200'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              Attacker view
            </button>
            <button
              onClick={() => setMode('fix')}
              className={cn(
                'rounded-md px-2.5 py-1 transition',
                mode === 'fix'
                  ? 'bg-cyan-500/15 text-cyan-200'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              Defender fix
            </button>
          </div>
        </div>

        {mode === 'listing' ? (
          <ul className="space-y-1.5 text-[13px] text-slate-200">
            {listing.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 flex-none rounded-full bg-red-400" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-1.5 text-[13px] text-slate-200">
            <FixRow>Rotate every credential referenced in this listing tonight — assume all leaked passwords are already tested.</FixRow>
            <FixRow>Block external traffic to the ports above; require bastion + SSO for admin interfaces.</FixRow>
            <FixRow>Retire the forgotten subdomains. Put everything new behind MirrorTrap PhantomShield so the next attempt hits a trap first.</FixRow>
            <FixRow>Turn on continuous monitoring so when a new listing surfaces, you learn in hours — not when your data drops.</FixRow>
          </ul>
        )}
      </div>
    </div>
  );
}

function FixRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-none text-cyan-300" />
      <span>{children}</span>
    </li>
  );
}
