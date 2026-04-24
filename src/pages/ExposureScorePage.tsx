import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Download,
  Eye,
  FileText,
  Fingerprint,
  Key,
  Network,
  Shield,
  Skull,
  Users,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useApp } from '@/lib/useApp';
import { usePageTitle } from '@/lib/usePageTitle';
import { generateExposureScore } from '@/lib/attackData';
import type { ExposureBreakdown, ExposureScore } from '@/lib/types';
import { cn } from '@/lib/utils';

function AnimatedScore({ target }: { target: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 2000;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      setV(Math.round(target * e));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const color =
    target >= 80 ? '#ff0040' : target >= 60 ? '#EF9F27' : target >= 40 ? '#ffcc00' : '#00ff6a';

  const circumference = 2 * Math.PI * 80;
  const dashoffset = circumference - (v / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="200" height="200" className="-rotate-90">
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="12"
        />
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{ filter: `drop-shadow(0 0 10px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold" style={{ color }}>
          {v}
        </div>
        <div className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ color }}>
          /100
        </div>
      </div>
    </div>
  );
}

function BreakdownBar({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string;
  value: number;
  icon: typeof Eye;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Icon className="h-4 w-4" style={{ color }} />
          {label}
        </div>
        <span className="font-mono text-sm font-bold" style={{ color }}>
          {value}/100
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-800">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: delay + 0.2 }}
        />
      </div>
    </motion.div>
  );
}

function generatePDF(domain: string, score: ExposureScore) {
  const doc = new jsPDF();
  const { breakdown: b } = score;

  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(255, 0, 64);
  doc.setFontSize(24);
  doc.text('ATTACKER DOSSIER', 20, 30);

  doc.setTextColor(150, 150, 150);
  doc.setFontSize(10);
  doc.text(`CLASSIFICATION: RED TEAM THREAT INTEL`, 20, 38);
  doc.text(`Generated: ${new Date().toISOString()}`, 20, 44);

  doc.setDrawColor(255, 0, 64);
  doc.line(20, 50, 190, 50);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(`Target: ${domain}`, 20, 62);

  doc.setFontSize(40);
  doc.setTextColor(255, 0, 64);
  doc.text(`${score.hackabilityScore}`, 20, 90);
  doc.setFontSize(14);
  doc.text(`/ 100 HACKABILITY`, 55, 90);

  doc.setFontSize(12);
  doc.setTextColor(255, 0, 64);
  doc.text(`Risk Level: ${score.riskLevel}`, 20, 102);

  doc.setDrawColor(255, 0, 64);
  doc.line(20, 110, 190, 110);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('EXPOSURE BREAKDOWN', 20, 122);

  const categories = [
    ['Digital Footprint', b.digitalFootprint],
    ['Credential Leak Severity', b.credentialLeaks],
    ['Attack Surface Width', b.attackSurface],
    ['Patch Lag Score', b.patchLag],
    ['Social Engineering Vulnerability', b.socialEngineering],
  ] as const;

  let y = 134;
  doc.setFontSize(10);
  for (const [label, val] of categories) {
    doc.setTextColor(180, 180, 180);
    doc.text(`${label}:`, 20, y);
    doc.setTextColor(255, val >= 70 ? 0 : val >= 40 ? 159 : 255, val >= 70 ? 64 : val >= 40 ? 39 : 106);
    doc.text(`${val}/100`, 130, y);

    doc.setFillColor(40, 40, 40);
    doc.rect(20, y + 3, 100, 4, 'F');
    const barColor = val >= 70 ? [255, 0, 64] : val >= 40 ? [239, 159, 39] : [0, 255, 106];
    doc.setFillColor(barColor[0], barColor[1], barColor[2]);
    doc.rect(20, y + 3, val, 4, 'F');

    y += 16;
  }

  doc.setDrawColor(255, 0, 64);
  doc.line(20, y + 5, 190, y + 5);

  y += 18;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('EXECUTIVE SUMMARY', 20, y);

  y += 10;
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(score.summary, 165);
  doc.text(lines, 20, y);

  y += lines.length * 5 + 15;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.text('GENERATED BY MIRRORTRAP — RED TEAM SIMULATION PLATFORM', 20, y);
  doc.text('This report is for authorized security testing purposes only.', 20, y + 6);

  doc.save(`mirrortrap-dossier-${domain}-${Date.now()}.pdf`);
}

export function ExposureScorePage() {
  usePageTitle('Exposure Score');
  const { latestScan } = useApp();
  const domain = latestScan?.domain ?? 'targetcompany.com';
  const findingCount = latestScan?.findings.length ?? 7;

  const score = useMemo(() => generateExposureScore(domain, findingCount), [domain, findingCount]);

  const breakdownItems: Array<{
    label: string;
    key: keyof ExposureBreakdown;
    icon: typeof Eye;
    color: string;
  }> = [
    { label: 'Digital Footprint Exposure', key: 'digitalFootprint', icon: Fingerprint, color: '#00f0ff' },
    { label: 'Credential Leak Severity', key: 'credentialLeaks', icon: Key, color: '#ff0040' },
    { label: 'Attack Surface Width', key: 'attackSurface', icon: Network, color: '#EF9F27' },
    { label: 'Patch Lag Score', key: 'patchLag', icon: Shield, color: '#ff6600' },
    { label: 'Social Engineering Vulnerability', key: 'socialEngineering', icon: Users, color: '#ff9900' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Exposure Score & Risk Dossier</h1>
          <p className="text-sm text-gray-500">Your organization's hackability assessment</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card flex flex-col items-center p-8 lg:col-span-1"
        >
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
            Hackability Score
          </div>
          <div className="mt-4">
            <AnimatedScore target={score.hackabilityScore} />
          </div>
          <div className="mt-4 text-center">
            <span
              className={cn(
                'rounded px-3 py-1 text-sm font-bold',
                score.riskLevel === 'EXTREME' && 'bg-brand-red/20 text-brand-red',
                score.riskLevel === 'HIGH' && 'bg-brand-amber/20 text-brand-amber',
                score.riskLevel === 'MODERATE' && 'bg-yellow-500/20 text-yellow-400',
                score.riskLevel === 'LOW' && 'bg-brand-green/20 text-brand-green',
              )}
            >
              {score.riskLevel} RISK
            </span>
          </div>
          <div className="mt-2 text-center text-xs text-gray-500">
            Target: <span className="font-mono text-brand-red">{domain}</span>
          </div>

          {/* Download PDF */}
          <button
            onClick={() => generatePDF(domain, score)}
            className="btn-primary mt-6 w-full"
          >
            <Download className="h-4 w-4" />
            Download Attacker Dossier (PDF)
          </button>
        </motion.div>

        {/* Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 lg:col-span-2"
        >
          <div className="mb-6 text-xs font-bold uppercase tracking-widest text-gray-400">
            Exposure Breakdown
          </div>
          <div className="space-y-6">
            {breakdownItems.map((item, i) => (
              <BreakdownBar
                key={item.key}
                label={item.label}
                value={score.breakdown[item.key]}
                icon={item.icon}
                color={item.color}
                delay={i * 0.1}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-red">
          <FileText className="h-3.5 w-3.5" />
          Executive Threat Summary
        </div>
        <p className="text-sm leading-relaxed text-gray-300">{score.summary}</p>
      </motion.div>

      {/* Threat categories detail */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: Fingerprint,
            title: 'Digital Footprint',
            score: score.breakdown.digitalFootprint,
            desc: 'Subdomains, DNS records, SSL certs, and publicly indexed pages that reveal your infrastructure.',
            color: '#00f0ff',
          },
          {
            icon: Key,
            title: 'Credential Leaks',
            score: score.breakdown.credentialLeaks,
            desc: 'Employee emails and passwords found in public breach databases, paste sites, and dark web dumps.',
            color: '#ff0040',
          },
          {
            icon: Network,
            title: 'Attack Surface',
            score: score.breakdown.attackSurface,
            desc: 'Open ports, exposed services, misconfigured cloud resources, and accessible admin panels.',
            color: '#EF9F27',
          },
          {
            icon: Shield,
            title: 'Patch Lag',
            score: score.breakdown.patchLag,
            desc: 'Known CVEs affecting detected software versions. Time since last security update.',
            color: '#ff6600',
          },
          {
            icon: Users,
            title: 'Social Engineering',
            score: score.breakdown.socialEngineering,
            desc: 'Public employee data, org charts, job postings that reveal tech stack and internal processes.',
            color: '#ff9900',
          },
          {
            icon: Skull,
            title: 'Overall Hackability',
            score: score.hackabilityScore,
            desc: 'Weighted composite score representing how easily an attacker could compromise your organization.',
            color: score.hackabilityScore >= 70 ? '#ff0040' : '#EF9F27',
          },
        ].map((cat, i) => (
          <motion.div
            key={cat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            className="card p-4"
          >
            <div className="flex items-center gap-2">
              <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
              <span className="text-sm font-semibold text-white">{cat.title}</span>
              <span
                className="ml-auto font-mono text-sm font-bold"
                style={{ color: cat.color }}
              >
                {cat.score}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">{cat.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
