import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  FileSearch,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Radar,
  Settings,
  ShieldCheck,
  ShieldHalf,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '@/lib/useApp';
import { cn, formatDate } from '@/lib/utils';
import { ArsBadge } from './ui/ArsBadge';
import { EnterpriseDemo } from './EnterpriseDemo';
import { useEffect, useRef, useState } from 'react';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, enterprise: false },
  { to: '/scan', label: 'New Scan', icon: Radar, enterprise: false },
  { to: '/phantomshield', label: 'PhantomShield', icon: ShieldHalf, enterprise: false },
  { to: '/alerts', label: 'Alerts', icon: Bell, enterprise: false },
  { to: '/protect', label: 'Protect', icon: ShieldCheck, enterprise: true },
  { to: '/reports', label: 'Reports', icon: FileSearch, enterprise: false },
  { to: '/settings', label: 'Settings', icon: Settings, enterprise: false },
];

const SHORTCUTS: Array<[string, string]> = [
  ['D', 'Toggle Demo Mode'],
  ['?', 'Show keyboard shortcuts'],
  ['Esc', 'Close modal'],
  ['/', 'Focus the quick-scan bar'],
  ['Ctrl + S', 'Go to Scan'],
  ['Ctrl + A', 'Go to Alerts'],
];

function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-5 shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
            <Keyboard className="h-3.5 w-3.5" /> Keyboard shortcuts
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="divide-y divide-border">
          {SHORTCUTS.map(([k, l]) => (
            <li key={k} className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-300">{l}</span>
              <kbd className="rounded-full border border-border bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-slate-200">
                {k}
              </kbd>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-[11px] text-slate-500">
          Press <kbd className="pill">?</kbd> anywhere to reopen this.
        </div>
      </div>
    </div>
  );
}

function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <UpgradeModalInner onClose={onClose} />;
}

function UpgradeModalInner({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <>
      {!demoOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-6 animate-fade-in"
          onClick={onClose}
        >
          <div
            className="card w-full max-w-md p-6 shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber">
                <ShieldCheck className="h-4 w-4" /> Enterprise feature
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-amber/40 bg-brand-amber/10 text-brand-amber">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div className="mt-4 font-display text-xl font-bold text-white">Autonomous defense</div>
              <p className="mt-2 text-sm text-slate-400">
                Available on the Enterprise plan (₹9,999/month). Upgrade to let MirrorTrap fight
                attackers automatically — no human intervention needed.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                className="btn-amber"
                onClick={() => {
                  onClose();
                  navigate('/#pricing');
                }}
              >
                Upgrade to Enterprise
              </button>
              <button className="btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn-ghost !border-brand-amber/40 !text-brand-amber"
                onClick={() => setDemoOpen(true)}
              >
                <Sparkles className="h-4 w-4" /> Show Demo
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <EnterpriseDemo
        open={demoOpen}
        onClose={onClose}
        onBackToPlans={() => setDemoOpen(false)}
      />
    </>
  );
}

function DemoBanner({ onDismiss }: { onDismiss: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex items-center gap-3 border-b border-brand-amber/40 bg-brand-amber/10 px-5 py-2 text-[12px] text-brand-amber animate-slide-up">
      <Sparkles className="h-3.5 w-3.5" />
      <span className="flex-1 font-semibold uppercase tracking-[0.18em]">
        ⚡ DEMO MODE ACTIVE — showing targetcompany.com dataset — Press{' '}
        <kbd className="rounded-full border border-brand-amber/40 bg-black/20 px-1.5 py-px font-mono text-[10px] text-brand-amber">
          D
        </kbd>{' '}
        to toggle
      </span>
      <button
        onClick={() => {
          setDismissed(true);
          onDismiss();
        }}
        className="text-brand-amber hover:text-white"
        aria-label="Turn off demo mode"
        title="Turn off demo mode"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function DashboardShell() {
  const { signOut, demoMode, setDemoMode, latestScan, alerts, simulateAttack, isEnterprise } =
    useApp();
  const navigate = useNavigate();
  const [quickDomain, setQuickDomain] = useState('');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const unread = alerts.filter((a) => a.status === 'open').length;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (e.key === 'Escape') {
        setShortcutsOpen(false);
        return;
      }
      if (typing) return;
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setDemoMode(!demoMode);
      }
      if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen((v) => !v);
      }
      if (e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        navigate('/scan');
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        navigate('/alerts');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [demoMode, setDemoMode, navigate]);

  const onQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    const d = quickDomain.trim();
    if (!d) return;
    navigate(`/scan?domain=${encodeURIComponent(d)}&auto=1`);
  };

  /* Scroll-aware pill shrink */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0D0814' }}>
      {/* Interior page background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 80% 35% at 50% 0%, rgba(192,132,252,0.055) 0%, transparent 60%),
            linear-gradient(rgba(192,132,252,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(192,132,252,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 52px 52px, 52px 52px',
        }}
      />
      {/* Noise grain */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 0.025,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: '256px 256px',
        }}
      />
      {/* Demo mode banner */}
      {demoMode ? (
        <DemoBanner key="demo-banner" onDismiss={() => setDemoMode(false)} />
      ) : null}

      {/* ── Floating pill top bar ──────────────────────── */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-40 flex justify-center px-4" style={{ paddingTop: 18 }}>
        <div
          className="pointer-events-auto flex items-center gap-2 rounded-full"
          style={{
            background: 'rgba(20,14,34,0.82)',
            backdropFilter: scrolled ? 'blur(36px) saturate(180%)' : 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: scrolled ? 'blur(36px) saturate(180%)' : 'blur(28px) saturate(180%)',
            border: '1px solid rgba(192,132,252,0.18)',
            boxShadow: '0 0 0 1px rgba(192,132,252,0.07), 0 8px 32px rgba(0,0,0,0.55), 0 0 80px rgba(192,132,252,0.04)',
            padding: '5px 6px',
            transform: scrolled ? 'scale(0.96)' : 'scale(1)',
            transition: 'all 400ms ease',
          }}
        >
          {/* MT monogram */}
          <div className="flex items-center gap-1.5 px-2" data-cursor="hover">
            <svg width="16" height="16" viewBox="0 0 64 80" fill="none">
              <path d="M32 2L4 18v24c0 20 28 34 28 34s28-14 28-34V18L32 2z" stroke="#C084FC" strokeWidth="2" fill="none" />
            </svg>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, color: '#C084FC', marginRight: 4 }}>MT</span>
          </div>
          <div className="hidden h-5 w-px bg-white/10 md:block" />
          <form onSubmit={onQuickScan} className="relative hidden max-w-[240px] flex-1 md:flex">
            <Radar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              ref={inputRef}
              value={quickDomain}
              onChange={(e) => setQuickDomain(e.target.value)}
              placeholder="Quick scan..."
              className="w-full rounded-full border border-white/10 bg-white/5 py-1.5 pl-8 pr-8 text-xs font-mono placeholder:text-slate-500 focus:border-brand-purple focus:outline-none"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
              /
            </kbd>
          </form>
          {latestScan ? <ArsBadge score={latestScan.ars_score} /> : null}
          <div className="hidden text-right text-[10px] text-slate-400 md:block">
            <div className="font-mono">Last scan</div>
            <div>{latestScan ? formatDate(latestScan.timestamp) : '—'}</div>
          </div>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={cn(
              'btn-ghost !py-1.5 !px-3 !text-[10px]',
              demoMode && '!border-brand-amber/60 !bg-brand-amber/10 !text-brand-amber',
            )}
            title="Press D to toggle"
          >
            <Sparkles className="h-3 w-3" />
            Demo {demoMode ? 'ON' : 'OFF'}
          </button>
          <button onClick={simulateAttack} className="btn-danger !py-1.5 !px-3 !text-[10px]">
            <Zap className="h-3 w-3" />
            Attack
          </button>
          <button
            onClick={() => setShortcutsOpen(true)}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (press ?)"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              void signOut();
              navigate('/');
            }}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="flex min-h-screen pt-16">
        {/* ── Sidebar ──────────────────────────────────── */}
        <aside className="hidden w-56 shrink-0 md:block" style={{ borderRight: '1px solid rgba(192,132,252,0.06)' }}>
          <nav className="sticky top-20 flex flex-col gap-1 p-3 pt-4">
            {NAV.map(({ to, label, icon: Icon, enterprise }) => {
              const gated = enterprise && !isEnterprise;
              const itemInner = (
                <>
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{label}</span>
                  {enterprise ? (
                    <span
                      className="rounded-full bg-brand-amber/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand-amber"
                      title="Enterprise plan only"
                    >
                      ENT
                    </span>
                  ) : null}
                  {to === '/alerts' && unread > 0 ? (
                    <span className="rounded-full bg-brand-danger/30 px-1.5 py-0.5 text-[10px] font-semibold text-brand-danger">
                      {unread}
                    </span>
                  ) : null}
                </>
              );
              if (gated) {
                return (
                  <button
                    key={to}
                    onClick={() => setUpgradeOpen(true)}
                    className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors hover:bg-white/5"
                    data-cursor="hover"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: '10.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,255,0.4)' }}
                  >
                    {itemInner}
                  </button>
                );
              }
              return (
                <NavLink
                  key={to}
                  to={to}
                  data-cursor="hover"
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-2 rounded-full px-3 py-2 transition-colors',
                      isActive
                        ? 'text-[#C084FC]'
                        : 'hover:text-[rgba(245,240,255,0.85)]',
                    )
                  }
                  style={({ isActive }) => ({
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 500,
                    fontSize: '10.5px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase' as const,
                    color: isActive ? '#C084FC' : 'rgba(245,240,255,0.4)',
                    background: isActive ? 'rgba(192,132,252,0.14)' : 'transparent',
                  })}
                >
                  {itemInner}
                </NavLink>
              );
            })}
            <div className="mt-auto pt-6">
              <div className="rounded-[14px] p-3 text-[11px]" style={{ background: 'rgba(20,14,34,0.55)', border: '1px solid rgba(192,132,252,0.1)', color: 'rgba(245,240,255,0.4)' }}>
                <div className="mb-1 flex items-center gap-1.5" style={{ color: '#C084FC' }}>
                  <Activity className="h-3.5 w-3.5 animate-pulse-dot" />
                  <span className="font-semibold uppercase tracking-wider">Monitoring Active</span>
                </div>
                Attackers touching honey-assets will appear in Alerts instantly.
              </div>
            </div>
          </nav>
        </aside>

        {/* ── Content ──────────────────────────────────── */}
        <main className="flex-1 page-enter p-6">
          <Outlet />
        </main>
      </div>

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
