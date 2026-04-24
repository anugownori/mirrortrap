import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Eye,
  Flame,
  Globe,
  Radar,
  Shield,
  Skull,
  Terminal,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/lib/usePageTitle';
import { Logo } from '@/components/Logo';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { useEffect, useState } from 'react';

const HERO_TERMINAL_LINES: Array<{ text: string; tone: 'dim' | 'green' | 'red' | 'yellow' | 'cyan' | 'cmd' }> = [
  { text: 'root@mirrortrap:~# ./recon.sh --target targetcompany.com --full', tone: 'green' },
  { text: '[*] MirrorTrap Recon Engine v3.1 initialized', tone: 'cyan' },
  { text: '[*] Target: targetcompany.com', tone: 'cyan' },
  { text: '[*] Mode: FULL ATTACK SURFACE ENUMERATION', tone: 'cyan' },
  { text: '', tone: 'dim' },
  { text: '[SCANNING] crt.sh — Subdomain Enumeration...', tone: 'dim' },
  { text: '  [HIGH] 14 subdomains enumerated via CT logs', tone: 'yellow' },
  { text: '  [CRITICAL] dev.targetcompany.com — no auth wall', tone: 'red' },
  { text: '[SCANNING] Shodan — Port & Service Scan...', tone: 'dim' },
  { text: '  [HIGH] Port 3306 (MySQL) open to internet', tone: 'yellow' },
  { text: '  [HIGH] Jenkins CI at port 8080 — default creds', tone: 'yellow' },
  { text: '[SCANNING] HaveIBeenPwned — Credential Leaks...', tone: 'dim' },
  { text: '  [CRITICAL] 3 employee emails in breach database', tone: 'red' },
  { text: '  [CRITICAL] CEO email found with plaintext password', tone: 'red' },
  { text: '[SCANNING] GitHub — Exposed Secrets...', tone: 'dim' },
  { text: '  [CRITICAL] AWS key pattern in public commit a7f2c91', tone: 'red' },
  { text: '[SCANNING] Dark Web — Breach Mentions...', tone: 'dim' },
  { text: '  [CRITICAL] 3 active listings on dark web marketplace', tone: 'red' },
  { text: '', tone: 'dim' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', tone: 'red' },
  { text: '  HACKABILITY SCORE: 87/100  [EXTREME RISK]', tone: 'red' },
  { text: '  ESTIMATED TIME TO BREACH: 18 minutes', tone: 'red' },
  { text: '  RECORDS AT RISK: 2.4M user records', tone: 'red' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', tone: 'red' },
];

const toneColor = {
  cmd: 'text-[#00ff6a]',
  green: 'text-[#00ff6a]',
  dim: 'text-gray-600',
  cyan: 'text-[#00f0ff]',
  yellow: 'text-[#EF9F27]',
  red: 'text-[#ff0040]',
} as const;

function HeroTerminal() {
  const [visible, setVisible] = useState(1);
  useEffect(() => {
    const int = setInterval(() => {
      setVisible((v) => (v >= HERO_TERMINAL_LINES.length ? 1 : v + 1));
    }, 400);
    return () => clearInterval(int);
  }, []);
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#00ff6a]/20 bg-black p-4 font-mono text-[12px] leading-relaxed shadow-[0_0_40px_rgba(0,255,106,0.1)]" style={{ height: 380 }}>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff0040]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#EF9F27]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#00ff6a]" />
        <span className="ml-2 text-[10px] text-gray-600">mirrortrap — live recon session</span>
      </div>
      <div className="space-y-0.5 overflow-hidden">
        {HERO_TERMINAL_LINES.slice(0, visible).map((line, i) => (
          <div key={i} className={toneColor[line.tone]}>
            {line.text}
            {i === visible - 1 ? (
              <span className="ml-1 inline-block h-3.5 w-2 bg-[#00ff6a] align-middle animate-caret-blink" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

const MODULES = [
  {
    icon: Eye,
    title: "Hacker's Eye View",
    body: 'See exactly what an attacker sees in 60 seconds — exposed subdomains, leaked credentials, open ports, dark web mentions.',
    color: '#ff0040',
  },
  {
    icon: Brain,
    title: 'AI Attack Path Engine',
    body: 'AI generates a realistic multi-step attack chain mapped to MITRE ATT&CK. Click any node to see the fix.',
    color: '#00f0ff',
  },
  {
    icon: Flame,
    title: 'Breach Simulator',
    body: 'One red button. Watch a live animated breach unfold using YOUR actual vulnerabilities. The demo moment judges remember.',
    color: '#ff0040',
  },
  {
    icon: Globe,
    title: 'Dark Web Mirror',
    body: 'See your organization listed on a dark web marketplace — credentials for sale, access prices, buyer reviews.',
    color: '#ff4444',
  },
  {
    icon: BarChart3,
    title: 'Hackability Score',
    body: 'Single 0-100 score with breakdown across 5 attack vectors. Download a PDF attacker dossier in one click.',
    color: '#EF9F27',
  },
  {
    icon: Shield,
    title: 'Defender Mode',
    body: 'Toggle any view from attacker to defender. Every vulnerability shows the exact fix. Attacker left, defender right.',
    color: '#00ff6a',
  },
];

export function LandingPage() {
  usePageTitle('See yourself through a hacker\'s eyes');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      <ParticleBackground />

      {/* Nav */}
      <header className="relative z-10 border-b border-brand-red/10 bg-[#0a0a0a]/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/signup" className="btn-primary !py-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red">
              <Skull className="h-3.5 w-3.5" /> RED TEAM SIMULATION PLATFORM
            </div>
            <h1 className="text-4xl font-bold leading-tight text-white lg:text-6xl">
              See yourself through{' '}
              <span className="bg-gradient-to-r from-[#ff0040] to-[#ff4444] bg-clip-text text-transparent">
                a hacker's eyes
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-gray-400">
              MirrorTrap shows you exactly how attackers see your organization — then shows you how to stop them.
              Live recon. AI attack chains. Breach simulation. Dark web exposure.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary !px-6 !py-3 text-base">
                <Radar className="h-5 w-5" /> Start Free Scan
              </Link>
              <Link to="/login" className="btn-ghost !px-6 !py-3 text-base">
                <Terminal className="h-5 w-5" /> Live Demo
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { value: '60s', label: 'Full recon scan' },
                { value: '5+', label: 'Attack vectors' },
                { value: '18min', label: 'Avg time to breach' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-brand-red">{s.value}</div>
                  <div className="text-xs uppercase tracking-wider text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HeroTerminal />
          </motion.div>
        </div>
      </section>

      {/* Tagline */}
      <section className="relative z-10 border-y border-brand-red/10 bg-brand-red/5 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl font-semibold text-gray-300 lg:text-2xl"
          >
            "The platform that showed me{' '}
            <span className="text-brand-red">exactly how I'd get hacked</span>."
          </motion.p>
        </div>
      </section>

      {/* Modules */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white">
            5 Modules.{' '}
            <span className="text-brand-red">Complete Red Team Platform.</span>
          </h2>
          <p className="mt-3 text-gray-500">
            From reconnaissance to breach simulation — every step an attacker takes, visualized and fixable.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-xl border border-gray-800 bg-[#0f0f0f] p-6 transition-all hover:border-opacity-60 hover:shadow-lg"
              style={{ ['--hover-color' as string]: mod.color }}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border"
                style={{
                  borderColor: `${mod.color}40`,
                  backgroundColor: `${mod.color}10`,
                  color: mod.color,
                }}
              >
                <mod.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{mod.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{mod.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 border-t border-gray-800 bg-[#050505] px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-white">How MirrorTrap Works</h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: '01', title: 'Scan', desc: 'Enter your domain. We scan 7+ sources in 60 seconds.', color: '#00f0ff' },
              { step: '02', title: 'Discover', desc: 'See every vulnerability through an attacker\'s terminal.', color: '#ff0040' },
              { step: '03', title: 'Simulate', desc: 'AI builds attack chains. Breach simulator shows the worst case.', color: '#EF9F27' },
              { step: '04', title: 'Fix', desc: 'Toggle to defender mode. Every finding has a fix. Export the dossier.', color: '#00ff6a' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 font-mono text-lg font-bold"
                  style={{ borderColor: s.color, color: s.color }}
                >
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-white lg:text-4xl">
            Ready to see how hackable you are?
          </h2>
          <p className="mt-4 text-gray-400">
            Free scan. No credit card. Results in 60 seconds.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/signup" className="btn-primary !px-8 !py-3 text-base">
              <Radar className="h-5 w-5" /> Start Free Scan
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 bg-[#050505] px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Logo />
            <span className="ml-2">Red Team Simulation Platform</span>
          </div>
          <div className="text-xs text-gray-600">
            Built for hackathon demo — all rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
