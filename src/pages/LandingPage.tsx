import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Check,
  Eye,
  FileBarChart,
  Ghost,
  Radar,
  ShieldHalf,
  Zap,
} from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';
import { Logo } from '@/components/Logo';
import { useEffect, useRef, useState } from 'react';

const HERO_TERMINAL_LINES: Array<{ text: string; tone: 'dim' | 'ok' | 'warn' | 'err' | 'cmd' }> = [
  { text: '$ mirrortrap scan targetcompany.com', tone: 'cmd' },
  { text: '[SCANNING] HaveIBeenPwned API...', tone: 'dim' },
  { text: '[✓] 3 leaked emails found', tone: 'err' },
  { text: '[SCANNING] Shodan.io...', tone: 'dim' },
  { text: '[✓] 2 exposed services found', tone: 'warn' },
  { text: '[SCANNING] crt.sh subdomains...', tone: 'dim' },
  { text: '[✓] 8 subdomains enumerated', tone: 'ok' },
  { text: '[SCANNING] GitHub public search...', tone: 'dim' },
  { text: '[✓] 1 credential pattern found', tone: 'err' },
  { text: '[SCANNING] DNS records...', tone: 'dim' },
  { text: '[✓] Tech stack identified: AWS + MySQL', tone: 'ok' },
  { text: '', tone: 'dim' },
  { text: '>>> ARS SCORE: 84 / 100  CRITICAL', tone: 'err' },
  { text: '>>> Estimated time-to-exploit: 2.4h', tone: 'warn' },
  { text: '>>> Primary entry: leaked AWS key → S3', tone: 'warn' },
];

const toneColor = {
  cmd: 'text-brand-purple',
  dim: 'text-slate-500',
  ok: 'text-[#00FF88]',
  warn: 'text-brand-amber',
  err: 'text-brand-danger',
} as const;

/* ── Particle mesh canvas ─────────────────────────────── */
function ParticleMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const PARTICLE_COUNT = 120;
    const CONNECT_DIST = 150;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w(), h());
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w()) p.vx *= -1;
        if (p.y < 0 || p.y > h()) p.vy *= -1;
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = 0.12 * (1 - dist / CONNECT_DIST);
            ctx.strokeStyle = `rgba(127,119,221,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx.fillStyle = 'rgba(127,119,221,0.4)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

function HeroTerminal() {
  const [visible, setVisible] = useState(1);
  useEffect(() => {
    const int = setInterval(() => {
      setVisible((v) => (v >= HERO_TERMINAL_LINES.length ? 1 : v + 1));
    }, 520);
    return () => clearInterval(int);
  }, []);
  return (
    <div className="terminal scanlines relative h-[280px] overflow-hidden shadow-glow">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
        <span className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
        <span className="h-2 w-2 rounded-full bg-[#28CA42]" />
        <span className="ml-2 font-mono text-[11px] text-slate-500">mirrortrap — live scan</span>
      </div>
      <div className="space-y-0.5">
        {HERO_TERMINAL_LINES.slice(0, visible).map((line, i) => (
          <div key={i} className={toneColor[line.tone]}>
            {line.text}
            {i === visible - 1 ? (
              <span className="ml-1 inline-block h-3.5 w-2 bg-current align-middle animate-caret-blink" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCallout({ value, label }: { value: string; label: string }) {
  return (
    <div className="card card-hover p-5">
      <div className="font-display text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-white/40">{label}</div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Radar,
    title: 'OSINT Scanner',
    body: '5-source attack-surface sweep: HIBP, Shodan, crt.sh, GitHub, DNS. See yourself through a hacker\'s eyes.',
  },
  {
    icon: Ghost,
    title: 'PhantomShield Decoys',
    body: 'Deploy AI-generated honey assets — fake AWS keys, decoy admins, tracking URLs — that trip the moment they\'re touched.',
  },
  {
    icon: Eye,
    title: 'Attacker Intelligence',
    body: 'Every tripwire is enriched with IP origin, behavior analysis, and a predicted attack path. No more raw logs — actual narratives.',
  },
  {
    icon: FileBarChart,
    title: 'Threat Reports',
    body: 'Executive-ready dossiers with ARS trend, findings, and remediation. Generated in a click.',
  },
];

const PRICING = [
  {
    name: 'Free',
    price: '₹0',
    tagline: 'Single-shot OSINT scan',
    features: [
      '1 domain / month',
      'Findings summary + ARS score',
      'Static report export',
      'Community support',
    ],
    cta: 'Start free',
    href: '/scan',
    featured: false,
  },
  {
    name: 'Pro',
    price: '₹999',
    suffix: '/mo',
    tagline: 'Full platform — recommended',
    features: [
      'Unlimited scans + historical trend',
      'PhantomShield — all 4 decoys',
      'Real-time alerts + attacker dossiers',
      'AI-generated remediation playbooks',
    ],
    cta: 'Go Pro',
    href: '/signup',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '₹9,999',
    suffix: '/mo',
    tagline: 'Teams + SSO + custom assets',
    features: [
      'Unlimited users + SSO',
      'Custom decoy asset engineering',
      'Incident response integrations',
      'Dedicated analyst',
    ],
    cta: 'Talk to sales',
    href: '/signup',
    featured: false,
  },
];

const HOW_IT_WORKS = [
  {
    icon: Radar,
    tone: 'text-brand-purple bg-brand-purple/10 border-brand-purple/40',
    title: '1. Scan',
    body: 'We analyze 5 public sources and score your exposure in 60 seconds.',
  },
  {
    icon: Ghost,
    tone: 'text-brand-amber bg-brand-amber/10 border-brand-amber/40',
    title: '2. Trap',
    body: 'Deploy AI honey tokens that look real to attackers but alert you instantly.',
  },
  {
    icon: Zap,
    tone: 'text-brand-danger bg-brand-danger/10 border-brand-danger/40',
    title: '3. Catch',
    body: "When a tripwire fires, get the attacker's IP, behavior profile, and attack path.",
  },
];

const MARQUEE_TEXT =
  'OSINT SCAN \u00B7 HONEYPOT DECOYS \u00B7 REAL-TIME ALERTS \u00B7 ARS SCORING \u00B7 THREAT INTELLIGENCE \u00B7 ';

export function LandingPage() {
  usePageTitle('MirrorTrap — See yourself through a hacker\u2019s eyes');
  return (
    <div className="page-enter">
      {/* ── Floating pill navbar ──────────────────────────── */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-6">
        <nav
          className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/[0.08] px-3 py-1.5 shadow-nav-pill"
          style={{
            background: 'rgba(26,23,48,0.75)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderColor: 'rgba(127,119,221,0.2)',
          }}
        >
          <Logo />
          <div className="mx-3 h-5 w-px bg-white/10" />
          <a
            href="#features"
            className="rounded-full px-4 py-2 text-xs font-medium uppercase tracking-widest text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="rounded-full px-4 py-2 text-xs font-medium uppercase tracking-widest text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Pricing
          </a>
          <div className="mx-2 h-5 w-px bg-white/10" />
          <Link
            to="/login"
            className="rounded-full px-4 py-2 text-xs font-medium uppercase tracking-widest text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Sign in
          </Link>
          <Link to="/scan" className="btn-primary !py-2 !text-[10px]">
            Scan Free
            <ArrowRight className="h-3 w-3" />
          </Link>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden">
        <ParticleMesh />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pt-32 pb-16 lg:grid-cols-2 lg:gap-14 lg:pt-40 lg:pb-20">
          <div>
            <h1
              className="font-display font-bold leading-[0.95] tracking-[-0.03em] text-white"
              style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)' }}
            >
              SEE YOURSELF
              <br />
              THROUGH A<br />
              <span className="text-brand-purple">HACKER&apos;S EYES</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg font-light leading-relaxed text-white/55">
              Scan your company&apos;s public attack surface. Deploy AI-generated decoy traps.
              Catch attackers before they reach your real systems.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/scan" className="btn-primary !px-7 !py-3.5 !text-sm">
                Scan Your Domain Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="btn-ghost !px-7 !py-3.5 !text-sm"
              >
                See a live demo
              </Link>
            </div>
            <div className="mt-4 text-[11px] uppercase tracking-widest text-slate-500">
              No credit card &middot; 1-minute scan &middot; Data never stored without consent
            </div>
          </div>
          <div className="relative">
            <HeroTerminal />
          </div>
        </div>

        {/* Stat callouts */}
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-8 md:grid-cols-3">
          <StatCallout value="91%" label="of breaches start with reconnaissance" />
          <StatCallout value="4.2hrs" label="average time from recon to breach" />
          <StatCallout value="$4.9M" label="average breach cost in 2024" />
        </div>
      </section>

      {/* ── Marquee strip ────────────────────────────────── */}
      <div
        className="overflow-hidden border-y py-3"
        style={{ borderColor: 'rgba(127,119,221,0.1)' }}
      >
        <div className="animate-marquee flex whitespace-nowrap">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="text-xs uppercase tracking-widest text-white/20"
            >
              {MARQUEE_TEXT.repeat(6)}
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="border-t" style={{ borderColor: 'rgba(127,119,221,0.08)' }}>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-12 max-w-2xl">
            <div className="section-label">Platform</div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              Reconnaissance, weaponized for the defender.
            </h2>
            <p className="mt-3 text-slate-400">
              Four modules. One mission: watch yourself the way a nation-state would — then set traps.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card card-hover flex gap-4 p-6">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-semibold text-white">{title}</div>
                  <div className="mt-1 text-sm text-slate-400">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="how" className="border-t" style={{ borderColor: 'rgba(127,119,221,0.08)' }}>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-12 max-w-2xl">
            <div className="section-label">How it works</div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              Three steps. One hour. No SIEM required.
            </h2>
            <p className="mt-3 text-slate-400">
              From the attacker's OSINT window to the moment a tripwire fires — every layer
              captured in a single workflow.
            </p>
          </div>
          <div className="relative grid grid-cols-1 gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="card card-hover h-full p-6">
                  <div
                    className={
                      'inline-flex h-11 w-11 items-center justify-center rounded-xl border ' +
                      s.tone
                    }
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 font-display text-lg font-semibold text-white">{s.title}</div>
                  <div className="mt-1 text-sm text-slate-400">{s.body}</div>
                </div>
                {i < HOW_IT_WORKS.length - 1 ? (
                  <div className="pointer-events-none absolute right-[-18px] top-1/2 hidden -translate-y-1/2 md:block">
                    <ArrowRight className="h-5 w-5 text-brand-purple/70" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="border-t" style={{ borderColor: 'rgba(127,119,221,0.08)' }}>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-12 max-w-2xl">
            <div className="section-label">Pricing</div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              Built for hackathon-stage teams and seed-stage security leads.
            </h2>
          </div>
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={
                  'card p-6 transition-transform ' +
                  (p.featured
                    ? 'relative scale-[1.03] border-brand-purple/60 glow-purple'
                    : 'card-hover')
                }
              >
                {p.featured ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-purple px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-glow">
                    Most Popular
                  </div>
                ) : null}
                <div className="text-xs uppercase tracking-widest text-slate-400">{p.name}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold text-white">{p.price}</span>
                  {p.suffix ? <span className="text-sm text-slate-400">{p.suffix}</span> : null}
                </div>
                <div className="mt-1 text-sm text-white/60">{p.tagline}</div>
                <ul className="mt-6 space-y-2.5 text-sm text-white/60">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-brand-purple" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={p.href}
                  className={'mt-6 w-full ' + (p.featured ? 'btn-primary' : 'btn-ghost')}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PhantomShield callout ─────────────────────────── */}
      <section className="border-t" style={{ borderColor: 'rgba(127,119,221,0.08)' }}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 py-20 md:grid-cols-2">
          <div>
            <div className="section-label">
              <ShieldHalf className="h-3 w-3 text-brand-amber" /> PhantomShield
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold text-white md:text-3xl">
              The decoy layer your SOC didn&apos;t know it was missing.
            </h3>
            <p className="mt-3 text-slate-400">
              Fake AWS keys, honey admin portals, tracking URLs. If anyone touches them, you know —
              with the IP, timing, and inferred intent. No SIEM required.
            </p>
            <Link to="/signup" className="btn-amber mt-6">
              Deploy PhantomShield <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber">
              <Bot className="h-3.5 w-3.5" /> Live tripwire feed
            </div>
            <div className="terminal scanlines">
              <div className="text-brand-danger">
                [14:32:07] Honey token accessed — IP 185.220.101.47 — 🇷🇴 Romania
              </div>
              <div className="text-brand-amber">
                [14:33:22] Fake AWS key validation attempt — python-requests/2.31
              </div>
              <div className="text-brand-danger">
                [14:35:49] Decoy login /admin — 3 password attempts — Tor exit
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t" style={{ borderColor: 'rgba(127,119,221,0.08)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-slate-500 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={16} />
            <span>&copy; {new Date().getFullYear()} MirrorTrap. Built for defenders.</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-slate-200">
              Sign in
            </Link>
            <Link to="/signup" className="hover:text-slate-200">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
