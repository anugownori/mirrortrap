import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ChevronDown,
  Eye,
  Globe,
  Key,
  Server,
  Shield,
  Skull,
  Star,
  User,
} from 'lucide-react';
import { useApp } from '@/lib/useApp';
import { usePageTitle } from '@/lib/usePageTitle';
import { generateDarkWebListings } from '@/lib/attackData';
import type { DarkWebListing } from '@/lib/types';
import { cn } from '@/lib/utils';

function DarkWebListingCard({
  listing,
  index,
  defenderMode,
}: {
  listing: DarkWebListing;
  index: number;
  defenderMode: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl border border-brand-red/30 bg-black/80 p-5 transition-all hover:border-brand-red/50"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Skull className="h-4 w-4 text-brand-red" />
            <span className="text-sm font-bold text-brand-red">{listing.title}</span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" /> {listing.seller}
            </span>
            <span className="flex items-center gap-1">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3 w-3',
                      i < Math.floor(listing.rating)
                        ? 'fill-brand-amber text-brand-amber'
                        : 'text-gray-700',
                    )}
                  />
                ))}
              <span className="ml-1">({listing.reviews})</span>
            </span>
            <span>Updated {listing.lastUpdated}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#00ff6a]">${listing.price}</div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">
            {listing.currency}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="pill">
          <Key className="h-3 w-3 text-brand-amber" />
          {listing.credentials > 0 ? `${listing.credentials} credentials` : 'Data dump'}
        </span>
        <span className="pill">
          <Server className="h-3 w-3 text-brand-cyan" />
          {listing.accessType}
        </span>
      </div>

      <div className="mt-4 space-y-1.5">
        {listing.details.map((d, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
            <span className="mt-0.5 text-brand-red">{'>'}</span>
            {d}
          </div>
        ))}
      </div>

      {/* Expand for defender fix */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
      >
        <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
        {defenderMode ? 'View remediation' : 'More details'}
      </button>

      <AnimatePresence>
        {expanded && defenderMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden rounded-lg border border-[#00ff6a]/30 bg-[#00ff6a]/5 p-4"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#00ff6a]">
              <Shield className="h-3.5 w-3.5" />
              YOUR FIX
            </div>
            <div className="mt-2 space-y-1.5 text-xs text-gray-300">
              <p>1. Rotate all exposed credentials immediately</p>
              <p>2. Enable MFA on all admin accounts and remote access</p>
              <p>3. Close unnecessary open ports (RDP, MySQL, etc.)</p>
              <p>4. Implement network segmentation and VPN-only access</p>
              <p>5. Set up dark web monitoring for future mentions</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DarkWebPage() {
  usePageTitle('Dark Web Mirror');
  const { latestScan } = useApp();
  const [defenderMode, setDefenderMode] = useState(false);
  const domain = latestScan?.domain ?? 'targetcompany.com';
  const listings = generateDarkWebListings(domain);

  const totalValue = listings.reduce((sum, l) => sum + parseFloat(l.price.replace(',', '')), 0);
  const totalCreds = listings.reduce((sum, l) => sum + l.credentials, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-red/40 bg-brand-red/10 text-brand-red">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Dark Web Mirror</h1>
          <p className="text-sm text-gray-500">
            See your organization's dark web profile
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="card flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-sm">
          {defenderMode ? (
            <>
              <Shield className="h-4 w-4 text-[#00ff6a]" />
              <span className="text-[#00ff6a]">This is what attackers see. Here's your fix.</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 text-brand-red" />
              <span className="text-brand-red">Viewing as attacker — dark web marketplace</span>
            </>
          )}
        </div>
        <button
          onClick={() => setDefenderMode((v) => !v)}
          className={cn(
            'btn text-xs',
            defenderMode
              ? 'bg-[#00ff6a]/10 text-[#00ff6a] border border-[#00ff6a]/30'
              : 'bg-brand-red/10 text-brand-red border border-brand-red/30',
          )}
        >
          {defenderMode ? (
            <><Shield className="h-3.5 w-3.5" /> Defender Mode</>
          ) : (
            <><Eye className="h-3.5 w-3.5" /> Attacker View</>
          )}
        </button>
      </div>

      {/* Dark web marketplace header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-brand-red/40 bg-gradient-to-br from-brand-red/10 via-black to-brand-red/5 p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-red/40 bg-brand-red/10">
            <Skull className="h-6 w-6 text-brand-red" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-brand-red">{domain}</span>
              <span className="rounded bg-brand-red/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-red">
                HIGH VALUE TARGET
              </span>
            </div>
            <div className="mt-0.5 text-xs text-gray-500">
              Dark Web Profile — {listings.length} active listings found
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-brand-red/20 bg-black/40 p-3 text-center">
            <div className="text-xl font-bold text-brand-red">{listings.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">
              Active Listings
            </div>
          </div>
          <div className="rounded-lg border border-brand-red/20 bg-black/40 p-3 text-center">
            <div className="text-xl font-bold text-[#00ff6a]">
              ${totalValue.toLocaleString()}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Total Value</div>
          </div>
          <div className="rounded-lg border border-brand-red/20 bg-black/40 p-3 text-center">
            <div className="text-xl font-bold text-brand-amber">{totalCreds}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">
              Leaked Credentials
            </div>
          </div>
          <div className="rounded-lg border border-brand-red/20 bg-black/40 p-3 text-center">
            <div className="text-xl font-bold text-brand-cyan">2 days</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500">
              Last Updated
            </div>
          </div>
        </div>
      </motion.div>

      {/* Listings */}
      <div className="space-y-4">
        {listings.map((listing, i) => (
          <DarkWebListingCard
            key={listing.id}
            listing={listing}
            index={i}
            defenderMode={defenderMode}
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-center text-xs text-gray-500">
        <AlertTriangle className="mx-auto mb-2 h-4 w-4 text-brand-amber" />
        This is a simulated dark web marketplace view based on public breach databases and OSINT data.
        No actual dark web access occurs. Data shown represents realistic threat scenarios for educational
        and defensive purposes only.
      </div>
    </div>
  );
}
