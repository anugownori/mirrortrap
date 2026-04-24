import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  Eye,
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
import { Logo } from './Logo';
import { useApp } from '@/lib/useApp';
import { cn, formatDate } from '@/lib/utils';
import { ArsBadge } from './ui/ArsBadge';
import { EnterpriseDemo } from './EnterpriseDemo';
import { ChatAssistant } from './ChatAssistant';
import { useEffect, useRef, useState } from 'react';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, enterprise: false },
  { to: '/hackers-eye', label: "Hacker's Eye", icon: Eye, enterprise: false },
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
              <kbd className="rounded-md border border-border bg-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-200">
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
              <div className="mt-4 text-xl font-bold text-white">Autonomous defense</div>
              <p className="mt-2 text-sm text-slate-400">
                Available on the Enterprise plan (₹9,999/month). Upgrade to let MirrorTrap fight
                attackers automatically — no human intervention needed.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                className="btn-primary !bg-brand-amber hover:!bg-brand-amber"
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
        <kbd className="rounded border border-brand-amber/40 bg-black/20 px-1 py-px font-mono text-[10px] text-brand-amber">
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
  const { user, signOut, demoMode, setDemoMode, latestScan, alerts, simulateAttack, isEnterprise } =
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

  return (
    <div className="min-h-screen">
      {/* Demo mode banner — keyed so it remounts fresh each time demoMode flips on */}
      {demoMode ? (
        <DemoBanner key="demo-banner" onDismiss={() => setDemoMode(false)} />
      ) : null}

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-[#0D0B1A]/85 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-5">
          <Logo />
          <div className="hidden h-6 w-px bg-border md:block" />
          <form onSubmit={onQuickScan} className="relative hidden max-w-[260px] flex-1 md:flex">
            <Radar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              ref={inputRef}
              value={quickDomain}
              onChange={(e) => setQuickDomain(e.target.value)}
              placeholder="Quick scan domain..."
              className="w-full rounded-lg border border-border bg-bg-terminal py-2 pl-9 pr-10 text-sm font-mono placeholder:text-slate-500 focus:border-brand-purple focus:outline-none"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
              /
            </kbd>
          </form>
          <div className="ml-auto flex items-center gap-3">
            {latestScan ? <ArsBadge score={latestScan.ars_score} /> : null}
            <div className="hidden text-right text-[11px] text-slate-400 md:block">
              <div className="font-mono">Last scan</div>
              <div>{latestScan ? formatDate(latestScan.timestamp) : '—'}</div>
            </div>
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={cn(
                'btn-ghost !py-1.5 !text-[11px] !uppercase tracking-wider',
                demoMode && 'border-brand-amber/60 bg-brand-amber/10 text-brand-amber',
              )}
              title="Press D to toggle"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Demo {demoMode ? 'ON' : 'OFF'}
            </button>
            <button onClick={simulateAttack} className="btn-danger !py-1.5 !text-[11px] !uppercase tracking-wider">
              <Zap className="h-3.5 w-3.5" />
              Simulate Attack
            </button>
            <button
              onClick={() => setShortcutsOpen(true)}
              className="btn-ghost !py-1.5"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (press ?)"
            >
              <Keyboard className="h-4 w-4" />
            </button>
            <div className="hidden flex-col items-end text-right text-[11px] md:flex">
              <span className="text-slate-500">Signed in as</span>
              <span className="font-mono text-slate-300">{user?.email ?? 'guest'}</span>
            </div>
            <button
              onClick={() => {
                void signOut();
                navigate('/');
              }}
              className="btn-ghost !py-1.5"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-border/60 bg-[#0D0B1A]/60 md:block">
          <nav className="sticky top-14 flex flex-col gap-1 p-3">
            {NAV.map(({ to, label, icon: Icon, enterprise }) => {
              const gated = enterprise && !isEnterprise;
              const itemInner = (
                <>
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{label}</span>
                  {enterprise ? (
                    <span
                      className="rounded bg-brand-amber/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-brand-amber"
                      title="Enterprise plan only"
                    >
                      ENT
                    </span>
                  ) : null}
                  {to === '/alerts' && unread > 0 ? (
                    <span className="rounded bg-brand-danger/30 px-1.5 py-0.5 text-[10px] font-semibold text-brand-danger">
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
                    className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
                  >
                    {itemInner}
                  </button>
                );
              }
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-brand-purple/15 text-white shadow-glow'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
                    )
                  }
                >
                  {itemInner}
                </NavLink>
              );
            })}
            <div className="mt-auto pt-6">
              <div className="card p-3 text-[11px] text-slate-400">
                <div className="mb-1 flex items-center gap-1.5 text-brand-purple">
                  <Activity className="h-3.5 w-3.5 animate-pulse-dot" />
                  <span className="font-semibold uppercase tracking-wider">Monitoring Active</span>
                </div>
                Attackers touching honey-assets will appear in Alerts instantly.
              </div>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 animate-fade-in p-6">
          <Outlet />
        </main>
      </div>

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <ChatAssistant />
    </div>
  );
}
