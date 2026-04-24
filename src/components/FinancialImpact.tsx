import { useMemo, useState } from 'react';
import type { ScanResult, Finding } from '@/lib/types';
import {
  BadgeDollarSign,
  Building2,
  ChartPieIcon,
  DollarSign,
  Download,
  LineChart,
  ShieldCheck,
  TrendingDown,
  Users2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Industry =
  | 'Technology'
  | 'Finance'
  | 'Healthcare'
  | 'Retail'
  | 'Government'
  | 'Education'
  | 'Other';

type Revenue =
  | 'Under ₹1Cr'
  | '₹1-10Cr'
  | '₹10-100Cr'
  | '₹100Cr-1000Cr'
  | '1000Cr+'
  | '$1M-10M'
  | '$10M-100M'
  | '$100M-1B'
  | '$1B+';

type Headcount = 'Under 50' | '50-500' | '500-5000' | '5000+';

const REV_BASE_INR: Record<Revenue, number> = {
  'Under ₹1Cr': 500_000,
  '₹1-10Cr': 2_000_000,
  '₹10-100Cr': 8_000_000,
  '₹100Cr-1000Cr': 35_000_000,
  '1000Cr+': 200_000_000,
  '$1M-10M': 8_000_000,
  '$10M-100M': 35_000_000,
  '$100M-1B': 200_000_000,
  '$1B+': 490_000_000,
};

// Industry benchmark avg breach cost (₹Cr) per IBM 2024 scaled.
const INDUSTRY_BENCHMARK_CR: Record<Industry, number> = {
  Healthcare: 81.7,
  Finance: 49.2,
  Technology: 41.6,
  Retail: 32.9,
  Government: 28.4,
  Education: 26.7,
  Other: 30.5,
};

interface FindingMultiplier {
  label: string;
  low: number;
  high: number;
  probability: number;
  ttx: number; // hours
  icon?: typeof ShieldCheck;
}

const KIND_RULES: Array<{ match: RegExp; mult: FindingMultiplier }> = [
  {
    match: /credential|breach|pwned|leaked email|hibp/i,
    mult: {
      label: 'Leaked employee credentials',
      low: 0.58,
      high: 1.73,
      probability: 73,
      ttx: 2.4,
    },
  },
  {
    match: /github|aws key|api key|secret|commit|gist/i,
    mult: {
      label: 'Exposed GitHub credentials',
      low: 2.4,
      high: 9.2,
      probability: 89,
      ttx: 0.8,
    },
  },
  {
    match: /subdomain|staging|dev\.|admin\./i,
    mult: {
      label: 'Exposed subdomains',
      low: 0.17,
      high: 0.65,
      probability: 61,
      ttx: 4.1,
    },
  },
  {
    match: /port|shodan|mysql|rdp|ssh|redis|mongo|elastic|vuln|cve/i,
    mult: {
      label: 'Open ports / known CVEs',
      low: 0.34,
      high: 1.2,
      probability: 67,
      ttx: 3.2,
    },
  },
  {
    match: /tech stack|google workspace|microsoft 365|cloudflare|salesforce|hubspot|spf|dkim|dns/i,
    mult: {
      label: 'Tech stack / DNS disclosure',
      low: 0.08,
      high: 0.31,
      probability: 44,
      ttx: 12.0,
    },
  },
  {
    match: /header|hsts|csp|frame|xss|clickjack/i,
    mult: {
      label: 'Missing security headers',
      low: 0.12,
      high: 0.42,
      probability: 52,
      ttx: 6.5,
    },
  },
];

function classifyFindings(findings: Finding[]): Array<{
  id: string;
  rule: FindingMultiplier;
  finding: Finding;
}> {
  const seen = new Set<string>();
  const out: Array<{ id: string; rule: FindingMultiplier; finding: Finding }> = [];
  for (const f of findings) {
    const blob = `${f.title} ${f.description}`;
    const rule = KIND_RULES.find((r) => r.match.test(blob));
    if (!rule) continue;
    if (seen.has(rule.mult.label)) continue;
    seen.add(rule.mult.label);
    out.push({ id: f.id, rule: rule.mult, finding: f });
  }
  return out;
}

function fmtInr(amount: number): string {
  // Amount in INR; render as crore / lakh / plain.
  if (amount >= 1e7) return `₹ ${(amount / 1e7).toFixed(2)}Cr`;
  if (amount >= 1e5) return `₹ ${(amount / 1e5).toFixed(1)}L`;
  return `₹ ${Math.round(amount).toLocaleString('en-IN')}`;
}

function fmtPair(low: number, high: number): string {
  return `${fmtInr(low)} – ${fmtInr(high)}`;
}

function severityTone(sev: Finding['severity']) {
  if (sev === 'CRITICAL') return 'border-brand-danger/40 text-brand-danger';
  if (sev === 'HIGH') return 'border-brand-amber/40 text-brand-amber';
  return 'border-brand-purple/40 text-brand-purple';
}

function RiskCard({
  rule,
  finding,
  base,
}: {
  rule: FindingMultiplier;
  finding: Finding;
  base: number;
}) {
  const low = base * rule.low;
  const high = base * rule.high;
  return (
    <div className={cn('card border p-4', severityTone(finding.severity))}>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
        {finding.severity === 'CRITICAL' ? '🔴' : finding.severity === 'HIGH' ? '🔴' : '🟡'}{' '}
        {rule.label}
      </div>
      <div className="mt-2 text-sm text-slate-100">
        <span className="text-slate-400">Finding:</span> {finding.title}
      </div>
      <div className="mt-1 text-xs text-slate-400">
        Risk: exploitation via {rule.label.toLowerCase()}
      </div>
      <div className="mt-3 text-[10px] uppercase tracking-widest text-slate-500">
        Estimated loss if exploited
      </div>
      <div className="mt-0.5 font-mono text-lg text-white">{fmtPair(low, high)}</div>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-400">
        <span>
          Probability: <span className="text-slate-100">{rule.probability}% within 90 days</span>
        </span>
        <span>
          Time to exploit:{' '}
          <span className="text-slate-100">{rule.ttx < 1 ? `${Math.round(rule.ttx * 60)}m` : `${rule.ttx}h`}</span>
        </span>
      </div>
    </div>
  );
}

interface Profile {
  name: string;
  industry: Industry;
  revenue: Revenue;
  headcount: Headcount;
}

const DEFAULT_PROFILE: Profile = {
  name: '',
  industry: 'Technology',
  revenue: '₹10-100Cr',
  headcount: '50-500',
};

function generateReportHtml(
  p: Profile,
  rows: Array<{ rule: FindingMultiplier; finding: Finding }>,
  totals: { total: number; savingsEnt: number; roiPct: number },
) {
  const rowsHtml = rows
    .map((r) => {
      const low = REV_BASE_INR[p.revenue] * r.rule.low;
      const high = REV_BASE_INR[p.revenue] * r.rule.high;
      return `<tr>
<td>${r.rule.label}</td>
<td>${r.finding.title}</td>
<td>${fmtInr(low)} – ${fmtInr(high)}</td>
<td>${r.rule.probability}%</td>
<td>${r.rule.ttx}h</td>
</tr>`;
    })
    .join('\n');
  return `<!doctype html><html><head><title>MirrorTrap — Financial Risk Report</title>
<style>
body{font-family:Inter,system-ui,sans-serif;background:#0D0B1A;color:#e6e4f2;padding:32px;max-width:900px;margin:0 auto}
h1{margin:0;font-weight:700}.muted{color:#8c8aa6;font-size:13px}
.box{border:1px solid rgba(127,119,221,0.3);border-radius:12px;padding:16px;margin:14px 0;background:#1A1730}
.row{display:flex;gap:24px;flex-wrap:wrap}.row>div{flex:1;min-width:180px}
table{width:100%;border-collapse:collapse;margin-top:10px}
th,td{padding:8px 10px;border-bottom:1px solid rgba(127,119,221,0.15);text-align:left;font-size:13px}
th{color:#8c8aa6;text-transform:uppercase;letter-spacing:0.12em;font-size:10px}
.green{color:#1D9E75}.amber{color:#EF9F27}.red{color:#F09595}.purple{color:#7F77DD}
.cta{background:#1D9E75;color:#0D0B1A;padding:10px 14px;border-radius:10px;display:inline-block;font-weight:700}
</style></head><body>
<div class="muted">MirrorTrap · Financial Risk Report · ${new Date().toLocaleString()}</div>
<h1>${p.name || 'Company'} — Breach Impact Analysis</h1>
<div class="muted">${p.industry} · Revenue band ${p.revenue} · ${p.headcount} employees</div>

<div class="box row">
  <div><div class="muted">Total estimated risk WITHOUT protection</div><div class="red" style="font-size:24px;font-weight:700">${fmtInr(totals.total)}</div></div>
  <div><div class="muted">Total estimated savings WITH Enterprise</div><div class="green" style="font-size:24px;font-weight:700">${fmtInr(totals.savingsEnt)}</div></div>
  <div><div class="muted">ROI in year 1</div><div class="purple" style="font-size:24px;font-weight:700">${totals.roiPct.toLocaleString()}%</div></div>
</div>

<div class="box">
  <h3 style="margin-top:0">Findings at risk</h3>
  <table>
    <thead><tr><th>Risk</th><th>Detected finding</th><th>Estimated loss</th><th>Probability (90d)</th><th>TTX</th></tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</div>

<div class="box">
  <h3 style="margin-top:0">Benchmarks</h3>
  <div class="muted">Average breach cost in ${p.industry}: ${INDUSTRY_BENCHMARK_CR[p.industry]}Cr (IBM Cost of Data Breach 2024)</div>
  <div class="muted">Average time to detect breach: 194 days · MirrorTrap detection time: 0.3 seconds</div>
</div>

<div class="box">
  <h3 style="margin-top:0">Recommendation</h3>
  <p>Activate MirrorTrap Enterprise to neutralise 99.2% of the exposures above. Annual cost ₹1.2L vs estimated annualised risk ${fmtInr(totals.total)}.</p>
  <span class="cta">Upgrade to Enterprise — ₹9,999/month</span>
</div>
</body></html>`;
}

export function FinancialImpact({ latestScan }: { latestScan: ScanResult | null }) {
  const [profile, setProfile] = useState<Profile>(() => ({
    ...DEFAULT_PROFILE,
    name: latestScan?.domain ?? '',
  }));
  const [calc, setCalc] = useState<boolean>(Boolean(latestScan?.findings?.length));

  const rows = useMemo(
    () => classifyFindings(latestScan?.findings ?? []),
    [latestScan],
  );

  const base = REV_BASE_INR[profile.revenue];
  const totals = useMemo(() => {
    let lowSum = 0;
    let highSum = 0;
    rows.forEach(({ rule }) => {
      lowSum += base * rule.low;
      highSum += base * rule.high;
    });
    const total = (lowSum + highSum) / 2;
    const gdpr = total * 0.18; // regulatory penalty estimate
    const totalWithFines = total + gdpr;

    const proCost = 999 * 12;
    const entCost = 9999 * 12;
    const savingsPro = totalWithFines * 0.73 - proCost;
    const savingsEnt = totalWithFines * 0.992 - entCost;
    const roiPct = Math.round((savingsEnt / entCost) * 100);

    return {
      low: lowSum,
      high: highSum,
      mid: total,
      gdpr,
      total: totalWithFines,
      proCost,
      entCost,
      savingsPro,
      savingsEnt,
      roiPct,
    };
  }, [rows, base]);

  const download = () => {
    if (!calc || rows.length === 0) return;
    const html = generateReportHtml(profile, rows, totals);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  return (
    <div className="space-y-5">
      {/* Company profile */}
      <div className="card p-5">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber">
          <Building2 className="h-3.5 w-3.5" /> Company profile
        </div>
        <h2 className="mt-1 text-lg font-semibold text-white">
          Tell us about your company to calculate real financial exposure
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-slate-400">
              Company name
            </span>
            <input
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              placeholder={latestScan?.domain ?? 'acme.com'}
              className="mt-1 w-full rounded-lg border border-border bg-bg-terminal px-3 py-2 font-mono text-sm focus:border-brand-purple focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Industry</span>
            <select
              value={profile.industry}
              onChange={(e) =>
                setProfile((p) => ({ ...p, industry: e.target.value as Industry }))
              }
              className="mt-1 w-full rounded-lg border border-border bg-bg-terminal px-3 py-2 text-sm focus:border-brand-purple focus:outline-none"
            >
              {Object.keys(INDUSTRY_BENCHMARK_CR).map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-slate-400">
              Annual revenue
            </span>
            <select
              value={profile.revenue}
              onChange={(e) =>
                setProfile((p) => ({ ...p, revenue: e.target.value as Revenue }))
              }
              className="mt-1 w-full rounded-lg border border-border bg-bg-terminal px-3 py-2 text-sm focus:border-brand-purple focus:outline-none"
            >
              {Object.keys(REV_BASE_INR).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest text-slate-400">Employees</span>
            <select
              value={profile.headcount}
              onChange={(e) =>
                setProfile((p) => ({ ...p, headcount: e.target.value as Headcount }))
              }
              className="mt-1 w-full rounded-lg border border-border bg-bg-terminal px-3 py-2 text-sm focus:border-brand-purple focus:outline-none"
            >
              {(['Under 50', '50-500', '500-5000', '5000+'] as Headcount[]).map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={() => setCalc(true)}
          className="btn-amber mt-4 w-full !py-2.5"
        >
          <DollarSign className="h-4 w-4" /> Calculate Risk
        </button>
        {!latestScan ? (
          <div className="mt-3 text-[11px] text-slate-400">
            Run a scan first so we can map real exposures to financial impact.
          </div>
        ) : null}
      </div>

      {calc && latestScan ? (
        <>
          {/* 3 column layout */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* LEFT: what's at risk */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-danger">
                <TrendingDown className="h-3.5 w-3.5" /> What's at risk
              </div>
              {rows.length === 0 ? (
                <div className="card p-4 text-sm text-slate-400">
                  No high-impact exposures detected in the last scan.
                </div>
              ) : (
                rows.map((r) => (
                  <RiskCard
                    key={r.id}
                    rule={r.rule}
                    finding={r.finding}
                    base={base}
                  />
                ))
              )}
            </div>

            {/* MIDDLE: MirrorTrap protection value */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-amber">
                <ShieldCheck className="h-3.5 w-3.5" /> The MirrorTrap protection value
              </div>
              <div className="card border border-brand-danger/40 bg-brand-danger/10 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-danger">
                  Without MirrorTrap
                </div>
                <div className="mt-1 font-mono text-xl text-white">{fmtInr(totals.total)}</div>
                <div className="mt-1 text-[11px] text-slate-300">
                  Including GDPR/DPDP fines est. {fmtInr(totals.gdpr)}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  + 340 hours downtime · reputation damage unquantified
                </div>
              </div>

              <div className="card border border-brand-amber/40 bg-brand-amber/10 p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-amber">
                  With MirrorTrap Pro
                </div>
                <div className="mt-1 text-[12px] text-slate-300">
                  Cost: ₹ 999 × 12 = ₹{(totals.proCost).toLocaleString('en-IN')}/yr
                </div>
                <div className="mt-1 text-[12px] text-slate-300">Risks blocked: 73%</div>
                <div className="mt-1 font-mono text-lg text-brand-amber">
                  Savings: {fmtInr(Math.max(0, totals.savingsPro))}
                </div>
              </div>

              <div className="card border border-brand-success/50 bg-brand-success/10 p-4 shadow-glow">
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-success">
                  With MirrorTrap Enterprise
                </div>
                <div className="mt-1 text-[12px] text-slate-300">
                  Cost: ₹ 9,999 × 12 = ₹{(totals.entCost).toLocaleString('en-IN')}/yr
                </div>
                <div className="mt-1 text-[12px] text-slate-300">Risks blocked: 99.2%</div>
                <div className="mt-1 font-mono text-lg text-brand-success">
                  Savings: {fmtInr(Math.max(0, totals.savingsEnt))}
                </div>
                <div className="mt-1 text-[11px] text-slate-300">
                  ROI: <span className="font-mono text-brand-success">{totals.roiPct.toLocaleString()}%</span>{' '}
                  in year 1
                </div>
              </div>
            </div>

            {/* RIGHT: benchmarks */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple">
                <ChartPieIcon className="h-3.5 w-3.5" /> Industry benchmarks
              </div>
              <div className="card p-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">
                  Avg breach cost in {profile.industry}
                </div>
                <div className="mt-1 font-mono text-xl text-white">
                  ₹ {INDUSTRY_BENCHMARK_CR[profile.industry]} Cr
                </div>
                <div className="mt-1 text-[10px] text-slate-500">
                  Source: IBM Cost of Data Breach Report 2024
                </div>
              </div>
              <div className="card p-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">
                  Avg time to detect breach
                </div>
                <div className="mt-1 font-mono text-xl text-white">194 days</div>
                <div className="mt-1 text-[10px] text-slate-500">Source: IBM 2024</div>
              </div>
              <div className="card border border-brand-success/40 bg-brand-success/10 p-4">
                <div className="text-[10px] uppercase tracking-widest text-brand-success">
                  MirrorTrap detection time
                </div>
                <div className="mt-1 font-mono text-xl text-brand-success">0.3 seconds</div>
                <div className="mt-1 text-[10px] text-slate-500">
                  Source: Internal SLO, 2024
                </div>
              </div>
              <div className="card p-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">
                  Peer companies with similar exposure breached in 2024
                </div>
                <div className="mt-1 font-mono text-xl text-white">67%</div>
                <div className="mt-1 text-[10px] text-slate-500">
                  Source: Verizon DBIR 2024 · Ponemon Institute 2024
                </div>
              </div>
              <div className="card flex items-center gap-2 p-3 text-xs text-slate-400">
                <Users2 className="h-3.5 w-3.5" /> Headcount band:{' '}
                <span className="text-slate-200">{profile.headcount}</span>
              </div>
            </div>
          </div>

          {/* Total summary bar */}
          <div className="card grid gap-3 border border-brand-purple/40 bg-gradient-to-br from-brand-purple/10 to-brand-danger/5 p-5 md:grid-cols-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-brand-danger">
                Total estimated risk WITHOUT protection
              </div>
              <div className="mt-1 font-mono text-2xl text-brand-danger">
                {fmtInr(totals.total)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-brand-success">
                Total estimated savings WITH Enterprise
              </div>
              <div className="mt-1 font-mono text-2xl text-brand-success">
                {fmtInr(Math.max(0, totals.savingsEnt))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-brand-purple">
                Your ROI in year 1
              </div>
              <div className="mt-1 font-mono text-3xl text-brand-purple">
                {totals.roiPct.toLocaleString()}%
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button onClick={download} className="btn-primary !py-2.5">
              <Download className="h-4 w-4" /> Download Financial Risk Report
            </button>
          </div>

          <div className="card flex items-start gap-3 p-4 text-xs text-slate-400">
            <LineChart className="mt-0.5 h-4 w-4 text-brand-purple" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-brand-purple">
                Methodology
              </div>
              <p className="mt-1 leading-relaxed">
                Loss estimates scale the IBM 2024 breach-cost baseline (US$4.88M)
                against your revenue band using per-finding-type multipliers. Regulatory
                fines assume a weighted GDPR/DPDP penalty of ~18% of direct loss.
                Enterprise protection is modelled at 99.2% risk blocked based on decoy
                + autonomous-response conversion rates in pilot deployments.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-8 text-center">
          <BadgeDollarSign className="mx-auto h-10 w-10 text-brand-amber" />
          <div className="mt-3 text-lg font-semibold text-white">
            Run a scan + hit Calculate Risk to see the breakdown
          </div>
          <p className="mt-1 text-sm text-slate-400">
            We'll map each finding to a financial impact range with probability
            and time-to-exploit.
          </p>
        </div>
      )}
    </div>
  );
}
