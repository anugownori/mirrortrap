import type { Finding, ScanResult, Severity } from './types';

/* ----------------------- Hackability Score ------------------------------ */

export interface HackabilityBreakdown {
  total: number;
  footprint: number;
  credentials: number;
  surface: number;
  patchLag: number;
  socialEng: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  verdict: string;
}

const SEV_WEIGHT: Record<Severity, number> = {
  CRITICAL: 26,
  HIGH: 16,
  MEDIUM: 8,
  LOW: 2,
};

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function bySource(findings: Finding[], src: Finding['source']) {
  return findings.filter((f) => f.source === src);
}

export function computeHackability(scan: ScanResult | null): HackabilityBreakdown {
  if (!scan) {
    return {
      total: 0,
      footprint: 0,
      credentials: 0,
      surface: 0,
      patchLag: 0,
      socialEng: 0,
      grade: 'A',
      verdict: 'No scan yet — run the Hacker\u2019s Eye recon to compute your exposure.',
    };
  }
  const f = scan.findings;

  // Digital footprint — crt.sh subdomains + DNS + GitHub brand refs.
  const crt = bySource(f, 'crt.sh');
  const dns = bySource(f, 'DNS');
  const gh = bySource(f, 'GitHub');
  const subCount = Array.isArray((crt[0]?.real_data as { subdomains?: string[] })?.subdomains)
    ? ((crt[0]?.real_data as { subdomains: string[] }).subdomains.length)
    : crt.reduce((acc, x) => acc + SEV_WEIGHT[x.severity], 0);
  const footprint = clamp(
    Math.round(
      (subCount > 50 ? 45 : subCount > 20 ? 32 : subCount > 5 ? 20 : 8) +
        dns.reduce((a, x) => a + SEV_WEIGHT[x.severity] * 0.6, 0) +
        gh.reduce((a, x) => a + SEV_WEIGHT[x.severity] * 0.4, 0),
    ),
  );

  // Credentials — HIBP + GitHub exposures.
  const hibp = bySource(f, 'HaveIBeenPwned');
  const credentials = clamp(
    Math.round(
      hibp.reduce((a, x) => a + SEV_WEIGHT[x.severity] * 1.4, 0) +
        gh.reduce((a, x) => a + (x.title.toLowerCase().includes('secret') ? 30 : 10), 0),
    ),
  );

  // Attack surface width — Shodan ports + subdomains.
  const shodan = bySource(f, 'Shodan');
  const ports = ((shodan[0]?.real_data as { ports?: number[] })?.ports ?? []).length;
  const surface = clamp(
    Math.round(
      (ports > 8 ? 60 : ports > 3 ? 38 : ports > 0 ? 20 : 6) +
        crt.reduce((a, x) => a + SEV_WEIGHT[x.severity] * 0.3, 0),
    ),
  );

  // Patch lag — security headers + CVE pills in Shodan meta + tech-stack age.
  const sh = bySource(f, 'Security Headers');
  const vulns = ((shodan[0]?.real_data as { vulns?: string[] })?.vulns ?? []).length;
  const patchLag = clamp(
    Math.round(
      sh.reduce((a, x) => a + SEV_WEIGHT[x.severity] * 1.2, 0) + vulns * 18 + 8,
    ),
  );

  // Social engineering — tech stack + employee DNS hints + GitHub brand refs.
  const techList = ((dns.find((d) => Array.isArray((d.real_data as { tech?: string[] })?.tech))
    ?.real_data as { tech?: string[] })?.tech ?? []);
  const socialEng = clamp(
    Math.round(
      techList.length * 7 +
        hibp.reduce((a, x) => a + SEV_WEIGHT[x.severity] * 0.8, 0) +
        gh.length * 5 +
        10,
    ),
  );

  const weighted = Math.round(
    footprint * 0.22 +
      credentials * 0.26 +
      surface * 0.22 +
      patchLag * 0.18 +
      socialEng * 0.12,
  );
  const total = clamp(Math.max(weighted, Math.round(scan.ars_score * 0.9)));

  const grade: HackabilityBreakdown['grade'] =
    total >= 80 ? 'F' : total >= 65 ? 'D' : total >= 45 ? 'C' : total >= 25 ? 'B' : 'A';

  const verdict =
    total >= 80
      ? 'Severe exposure. A motivated attacker needs hours, not days, to reach sensitive systems.'
      : total >= 65
      ? 'High exposure. Multiple entry points are discoverable from the open internet.'
      : total >= 45
      ? 'Moderate exposure. An attacker could stitch a few findings into a workable plan.'
      : total >= 25
      ? 'Contained exposure. Tighten the remaining loose ends highlighted below.'
      : 'Minimal exposure. Keep MirrorTrap running so regressions never ship.';

  return { total, footprint, credentials, surface, patchLag, socialEng, grade, verdict };
}

/* ----------------------- MITRE Attack Chain ----------------------------- */

export interface MitreStep {
  id: string;
  tactic:
    | 'Reconnaissance'
    | 'Initial Access'
    | 'Execution'
    | 'Lateral Movement'
    | 'Exfiltration';
  techniqueId: string;
  technique: string;
  attackerNarrative: string;
  defenderFix: string;
  source?: Finding['source'];
}

export interface AttackChain {
  id: string;
  summary: string;
  eta_minutes: number;
  data_at_risk: string;
  steps: MitreStep[];
  provenance: 'ai' | 'deterministic';
}

function pickEntry(scan: ScanResult): Finding | null {
  return (
    scan.findings.find((f) => f.severity === 'CRITICAL') ??
    scan.findings.find((f) => f.severity === 'HIGH') ??
    scan.findings[0] ??
    null
  );
}

export function buildAttackChainLocal(scan: ScanResult): AttackChain {
  const entry = pickEntry(scan);
  const shodan = scan.findings.find((f) => f.source === 'Shodan');
  const shodanData = (shodan?.real_data as { ip?: string; ports?: number[] }) ?? {};
  const dns = scan.findings.find((f) => f.source === 'DNS');
  const tech = ((dns?.real_data as { tech?: string[] })?.tech ?? []).slice(0, 3);
  const crt = scan.findings.find((f) => f.source === 'crt.sh');
  const subs = ((crt?.real_data as { subdomains?: string[] })?.subdomains ?? []).slice(0, 2);
  const firstSub = subs[0] ?? `dev.${scan.domain}`;
  const hibp = scan.findings.find((f) => f.source === 'HaveIBeenPwned');
  const port = shodanData.ports?.[0] ?? 22;
  const stack = tech[0] ?? 'cloud-hosted app';

  const steps: MitreStep[] = [
    {
      id: 's1',
      tactic: 'Reconnaissance',
      techniqueId: 'T1595',
      technique: 'Active Scanning',
      attackerNarrative: `Hits crt.sh + DNS to map ${scan.domain}. Finds ${subs.length || 'multiple'} forgotten subdomains including ${firstSub}. Confirms ${stack}.`,
      defenderFix:
        'Publish a subdomain inventory. Retire forgotten hostnames. Enforce wildcard SAN cert rotation.',
      source: 'crt.sh',
    },
    {
      id: 's2',
      tactic: 'Initial Access',
      techniqueId: 'T1190',
      technique: 'Exploit Public-Facing Application',
      attackerNarrative: entry
        ? `Targets "${entry.title}" on ${firstSub}. ${hibp ? 'Sprays leaked credentials from prior breaches against the login.' : 'Brute-forces the exposed service with a rotating proxy pool.'}`
        : `Focuses on ${firstSub}. Tries default credentials and common CVEs for ${stack}.`,
      defenderFix:
        'Rotate all credentials that overlap with the leaked set. Enforce MFA on every external login. Move admin panels behind SSO/WAF.',
      source: entry?.source,
    },
    {
      id: 's3',
      tactic: 'Execution',
      techniqueId: 'T1059',
      technique: 'Command & Scripting Interpreter',
      attackerNarrative: `Uses port ${port} (${portHint(port)}) on ${shodanData.ip ?? scan.domain} to land a reverse shell. Establishes persistence via a scheduled task.`,
      defenderFix:
        'Shut down public access to admin ports. Require bastion + short-lived SSH certs. Ship EDR telemetry for process trees.',
      source: 'Shodan',
    },
    {
      id: 's4',
      tactic: 'Lateral Movement',
      techniqueId: 'T1021',
      technique: 'Remote Services',
      attackerNarrative: `Pivots from ${firstSub} into internal services. Harvests an AWS/Azure role from instance metadata. Walks to S3/Blob from there.`,
      defenderFix:
        'Block IMDSv1. Tighten IAM trust policies. Segment dev/prod VPCs. Enable PhantomShield decoys in this path to trap the next attempt.',
    },
    {
      id: 's5',
      tactic: 'Exfiltration',
      techniqueId: 'T1041',
      technique: 'Exfiltration Over C2 Channel',
      attackerNarrative: `Bulk-downloads customer records and ${stack} configuration to attacker-controlled infra. Posts sample on a dark-web marketplace within 24h.`,
      defenderFix:
        'Egress-filter sensitive buckets. Set DLP rules on PII downloads. Turn on continuous MirrorTrap monitoring so new exposures surface in hours, not quarters.',
    },
  ];

  const eta = Math.round(
    scan.ars_score >= 80
      ? 7 + Math.random() * 6
      : scan.ars_score >= 60
      ? 18 + Math.random() * 12
      : scan.ars_score >= 40
      ? 55 + Math.random() * 40
      : 180 + Math.random() * 90,
  );

  const summary =
    entry
      ? `Attacker chains ${entry.source} exposure \u2192 internal pivot \u2192 data exfil. ETA \u2248 ${eta}m.`
      : `Attacker stitches OSINT into a ${eta}m breach path against ${scan.domain}.`;

  return {
    id: `ac_${Date.now().toString(36)}`,
    summary,
    eta_minutes: eta,
    data_at_risk: hibp ? 'customer credentials, PII' : 'employee email, internal infra credentials',
    steps,
    provenance: 'deterministic',
  };
}

function portHint(p: number): string {
  const m: Record<number, string> = {
    22: 'SSH',
    80: 'HTTP',
    443: 'HTTPS',
    3306: 'MySQL',
    5432: 'PostgreSQL',
    6379: 'Redis',
    27017: 'MongoDB',
    3389: 'RDP',
    8080: 'HTTP-alt',
    9200: 'Elasticsearch',
  };
  return m[p] ?? 'custom';
}

/* ----------------------- Claude wrapper (optional) ---------------------- */

interface AnthropicContentBlock {
  type: string;
  text?: string;
}
interface AnthropicResp {
  content?: AnthropicContentBlock[];
}

export async function buildAttackChainWithClaude(
  scan: ScanResult,
): Promise<AttackChain | null> {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!key) return null;
  const sys = `You are a red-team operator. Given OSINT findings for ${scan.domain}, emit a JSON attack chain with keys summary (string), eta_minutes (number), data_at_risk (string), steps (array of 5 objects: tactic one of Reconnaissance, Initial Access, Execution, Lateral Movement, Exfiltration; techniqueId (MITRE T####); technique; attackerNarrative; defenderFix). JSON ONLY, no prose.`;
  const findingsText = scan.findings
    .slice(0, 18)
    .map((f) => `- [${f.severity}] ${f.source}: ${f.title}`)
    .join('\n');
  const payload = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1600,
    system: sys,
    messages: [{ role: 'user', content: findingsText }],
  };
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AnthropicResp;
    const text = data.content?.map((c) => c.text ?? '').join('').trim() ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as {
      summary: string;
      eta_minutes: number;
      data_at_risk: string;
      steps: Omit<MitreStep, 'id'>[];
    };
    return {
      id: `ac_${Date.now().toString(36)}`,
      summary: parsed.summary,
      eta_minutes: parsed.eta_minutes,
      data_at_risk: parsed.data_at_risk,
      steps: parsed.steps.map((s, i) => ({ ...s, id: `s${i + 1}` })),
      provenance: 'ai',
    };
  } catch {
    return null;
  }
}

export async function buildAttackChain(scan: ScanResult): Promise<AttackChain> {
  const ai = await buildAttackChainWithClaude(scan);
  return ai ?? buildAttackChainLocal(scan);
}

/* ----------------------- Breach Simulator ------------------------------- */

export interface BreachStep {
  at_seconds: number;
  label: string;
  detail: string;
  tone: 'info' | 'warn' | 'danger' | 'crit';
  bytes?: number;
  files?: number;
}

export interface BreachSim {
  total_seconds: number;
  bytes_exfil: number;
  files_exfil: number;
  records_exposed: number;
  ransom_btc: number;
  ransom_inr: number;
  steps: BreachStep[];
  ransom_note: string;
}

export function buildBreachSim(scan: ScanResult, chain: AttackChain): BreachSim {
  const records = Math.round(40000 + scan.ars_score * 12000 + Math.random() * 50000);
  const bytes = records * 1800;
  const files = Math.round(1200 + scan.ars_score * 180);
  const btc = +(0.4 + (scan.ars_score / 100) * 3.2).toFixed(2);
  const inr = Math.round(btc * 5800000); // rough ₹ per BTC
  const total = Math.round(140 + scan.ars_score * 2.5);

  const steps: BreachStep[] = [
    {
      at_seconds: 3,
      label: 'Recon complete',
      detail: `crt.sh + DNS returned ${scan.findings.length} findings for ${scan.domain}`,
      tone: 'info',
    },
    {
      at_seconds: 18,
      label: 'Credential spray triggered',
      detail: chain.steps[1]?.attackerNarrative ?? 'Leaked creds sprayed against admin login',
      tone: 'warn',
    },
    {
      at_seconds: 42,
      label: 'Valid session obtained',
      detail: 'admin@corp → 2FA bypass via SIM-swapped OTP',
      tone: 'danger',
    },
    {
      at_seconds: 71,
      label: 'Lateral pivot',
      detail: chain.steps[3]?.attackerNarrative ?? 'Walked from jump host into AWS via IMDS',
      tone: 'danger',
    },
    {
      at_seconds: Math.round(total * 0.75),
      label: 'Exfiltration in progress',
      detail: `${files.toLocaleString('en-IN')} files · ${(bytes / 1e9).toFixed(1)} GB being streamed out over TLS`,
      tone: 'crit',
      bytes,
      files,
    },
    {
      at_seconds: total - 4,
      label: 'Ransom note staged',
      detail: `Encryption tool "LockBrick" pushed to ${chain.steps[2]?.technique ?? 'compromised host'}`,
      tone: 'crit',
    },
    {
      at_seconds: total,
      label: 'Breach complete',
      detail: `${records.toLocaleString('en-IN')} records exposed. Ransom demand: ${btc} BTC (~₹${(inr / 1e7).toFixed(2)} Cr).`,
      tone: 'crit',
      bytes,
      files,
    },
  ];

  const ransom_note = `>>> ${scan.domain.toUpperCase()} — YOUR DATA IS OURS <<<

We own your AWS prod account, your admin panel at ${chain.steps[0]?.attackerNarrative.match(/([a-z0-9.-]+\.[a-z]{2,})/i)?.[0] ?? scan.domain}, and ${records.toLocaleString('en-IN')} customer records.

Pay ${btc} BTC in 72h or every file drops on a public mirror.
Proof: /proof/${scan.domain.replace(/\./g, '_')}_sample.csv

You had ${chain.eta_minutes} minutes to notice. You did not.
— the group that buys your exposure on the dark web`;

  return {
    total_seconds: total,
    bytes_exfil: bytes,
    files_exfil: files,
    records_exposed: records,
    ransom_btc: btc,
    ransom_inr: inr,
    steps,
    ransom_note,
  };
}

/* ----------------------- Dark Web Mirror -------------------------------- */

export interface DarkWebListing {
  title: string;
  seller: string;
  seller_rep: number;
  vouches: number;
  price_btc: number;
  price_usd: number;
  last_seen_hours: number;
  bullets: string[];
  sample_line: string;
}

export function buildDarkWebListing(scan: ScanResult): DarkWebListing {
  const ports = ((scan.findings.find((f) => f.source === 'Shodan')?.real_data as {
    ports?: number[];
  })?.ports ?? []).slice(0, 3);
  const subs = ((scan.findings.find((f) => f.source === 'crt.sh')?.real_data as {
    subdomains?: string[];
  })?.subdomains ?? []).slice(0, 2);
  const hasCreds = scan.findings.some((f) => f.source === 'HaveIBeenPwned');
  const hasGh = scan.findings.some((f) => f.source === 'GitHub');

  const bullets = [
    hasCreds ? `3+ valid admin credentials (${scan.domain})` : `Sysadmin email format verified`,
    ports.length ? `Ports open: ${ports.join(', ')}` : `Misconfigured CSP + missing HSTS`,
    subs.length ? `Forgotten hosts: ${subs.join(', ')}` : `Stale CI/CD webhook on GitHub`,
    hasGh ? `Repo ref leak in public commit history` : `Cloud bucket misreferenced in JS bundle`,
    `ETT (time-to-exploit): ${scan.estimated_time_to_exploit_hours}h`,
  ];

  const basePrice = 180 + scan.ars_score * 11 + Math.round(Math.random() * 120);
  const btc = +(basePrice / 5800).toFixed(3);

  return {
    title: `Full access pack — ${scan.domain}`,
    seller: 'r0tk1t_bazaar',
    seller_rep: 4.78,
    vouches: 312 + Math.floor(Math.random() * 80),
    price_btc: btc,
    price_usd: basePrice,
    last_seen_hours: Math.max(1, Math.floor(Math.random() * 36)),
    bullets,
    sample_line: `admin@${scan.domain} : P@ssw0rd!23 · role=superuser · last_login=2024-11-07`,
  };
}

/* ----------------------- Dossier HTML ----------------------------------- */

export function generateDossierHtml(params: {
  scan: ScanResult;
  hack: HackabilityBreakdown;
  chain: AttackChain;
  listing: DarkWebListing;
}): string {
  const { scan, hack, chain, listing } = params;
  const date = new Date().toLocaleString();
  const sev = (s: Severity) => `severity-${s.toLowerCase()}`;

  const findingsRows = scan.findings
    .slice(0, 20)
    .map(
      (f) => `
      <tr>
        <td><span class="sev ${sev(f.severity)}">${f.severity}</span></td>
        <td>${f.source}</td>
        <td>
          <div class="title">${escapeHtml(f.title)}</div>
          <div class="muted">${escapeHtml(f.description)}</div>
        </td>
      </tr>`,
    )
    .join('');

  const chainRows = chain.steps
    .map(
      (s, i) => `
      <tr>
        <td><strong>${i + 1}. ${escapeHtml(s.tactic)}</strong><div class="muted">${escapeHtml(s.techniqueId)} — ${escapeHtml(s.technique)}</div></td>
        <td>${escapeHtml(s.attackerNarrative)}</td>
        <td class="fix">${escapeHtml(s.defenderFix)}</td>
      </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<title>MirrorTrap Attacker Dossier — ${escapeHtml(scan.domain)}</title>
<style>
  :root { color-scheme: dark; }
  body { background: #0a0a0a; color: #e2e8f0; font-family: -apple-system, Inter, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; }
  .wrap { max-width: 860px; margin: 0 auto; }
  h1 { color: #f87171; font-size: 26px; margin: 0; letter-spacing: -0.5px; }
  h2 { color: #7F77DD; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin: 32px 0 12px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 16px; }
  .card { background: #111; border: 1px solid #2a2a2a; border-radius: 12px; padding: 16px; }
  .big { font-size: 36px; font-weight: 800; color: #fff; }
  .muted { color: #94a3b8; font-size: 12px; margin-top: 3px; }
  .title { font-weight: 600; color: #fff; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #1f1f1f; font-size: 13px; vertical-align: top; }
  th { text-transform: uppercase; font-size: 10px; letter-spacing: 1.5px; color: #64748b; }
  .fix { color: #86efac; }
  .sev { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .severity-critical { background: rgba(248,113,113,0.15); color: #f87171; }
  .severity-high { background: rgba(239,159,39,0.15); color: #fbbf24; }
  .severity-medium { background: rgba(250,204,21,0.15); color: #fde047; }
  .severity-low { background: rgba(29,158,117,0.15); color: #4ade80; }
  .ransom { background: #1a0404; border: 1px solid #7f1d1d; color: #fca5a5; padding: 16px; border-radius: 12px; white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px; line-height: 1.5; }
  .mk { border-left: 3px solid #7F77DD; padding-left: 12px; color: #cbd5e1; }
  .footer { color: #64748b; font-size: 11px; border-top: 1px solid #1f1f1f; margin-top: 40px; padding-top: 16px; }
  .btn { display: inline-block; padding: 10px 18px; background: #7F77DD; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px; }
  @media print { .btn { display: none; } }
</style>
</head><body><div class="wrap">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <h1>MirrorTrap Attacker Dossier</h1>
      <div class="muted">Target: ${escapeHtml(scan.domain)} · Generated ${escapeHtml(date)} · Confidence ${scan.confidence}%</div>
    </div>
    <a href="#" class="btn" onclick="window.print();return false;">Save as PDF</a>
  </div>

  <h2>Hackability Score</h2>
  <div class="grid">
    <div class="card"><div class="big" style="color:${hack.total >= 65 ? '#f87171' : hack.total >= 45 ? '#fbbf24' : '#4ade80'}">${hack.total}<span style="font-size:16px;color:#64748b">/100 · ${hack.grade}</span></div><div class="muted">${escapeHtml(hack.verdict)}</div></div>
    <div class="card">
      <div class="title">Category breakdown</div>
      <div class="muted" style="margin-top:8px">Footprint ${hack.footprint} · Credentials ${hack.credentials} · Surface ${hack.surface}</div>
      <div class="muted">Patch lag ${hack.patchLag} · Social eng ${hack.socialEng}</div>
    </div>
    <div class="card">
      <div class="title">Time to exploit</div>
      <div class="big" style="font-size:28px;color:#fbbf24">${scan.estimated_time_to_exploit_hours}h</div>
      <div class="muted">Primary entry: ${escapeHtml(scan.primary_entry_path)}</div>
    </div>
  </div>

  <h2>AI-Predicted Kill Chain · ETA ${chain.eta_minutes} min</h2>
  <div class="mk">${escapeHtml(chain.summary)}</div>
  <table>
    <tr><th>Stage</th><th>Attacker playbook</th><th>Defender fix</th></tr>
    ${chainRows}
  </table>

  <h2>Dark Web Listing (simulated)</h2>
  <div class="card">
    <div class="title">${escapeHtml(listing.title)}</div>
    <div class="muted">seller ${escapeHtml(listing.seller)} · rep ${listing.seller_rep}/5 · ${listing.vouches} vouches · ${listing.price_btc} BTC (~$${listing.price_usd})</div>
    <ul>${listing.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
  </div>

  <h2>Breach Scenario — Ransom Note (generated)</h2>
  <div class="ransom">${escapeHtml(buildBreachSim(scan, chain).ransom_note)}</div>

  <h2>Findings (${scan.findings.length})</h2>
  <table>
    <tr><th>Severity</th><th>Source</th><th>Finding</th></tr>
    ${findingsRows}
  </table>

  <div class="footer">
    MirrorTrap — See yourself through a hacker\u2019s eyes. This dossier is produced from public OSINT and is intended for authorized security assessments only.
  </div>
</div></body></html>`;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
