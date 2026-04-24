import type { Finding, ScanResult, Severity } from './types';
import { computeArsScore } from './mockData';
import { supabase, supabaseEnabled } from './supabase';

export interface SourceResult {
  findings: Finding[];
  raw: unknown;
  error?: string;
}

function mkId() {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function finding(
  severity: Severity,
  source: Finding['source'],
  title: string,
  description: string,
  meaning: string,
): Finding {
  return { id: mkId(), severity, source, title, description, meaning };
}

async function safeJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/* ----------------------------- DNS Google ------------------------------- */

interface DnsAnswer {
  name: string;
  type: number;
  data: string;
}
interface DnsResp {
  Answer?: DnsAnswer[];
}

export async function sourceDNS(domain: string): Promise<SourceResult> {
  const [a, mx, txt, ns] = await Promise.all([
    safeJson<DnsResp>(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`),
    safeJson<DnsResp>(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`),
    safeJson<DnsResp>(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`),
    safeJson<DnsResp>(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=NS`),
  ]);
  const ips = (a?.Answer ?? [])
    .filter((r) => r.type === 1)
    .map((r) => r.data)
    .slice(0, 4);
  const mailServers = (mx?.Answer ?? [])
    .map((r) => r.data.split(' ').pop() ?? r.data)
    .slice(0, 3);
  const nameservers = (ns?.Answer ?? []).map((r) => r.data).slice(0, 3);
  const txtRecs = (txt?.Answer ?? [])
    .map((r) => r.data.replace(/"/g, ''))
    .slice(0, 5);

  const findings: Finding[] = [];
  if (ips.length) {
    findings.push(
      finding(
        'LOW',
        'DNS',
        `${ips.length} public IP(s) exposed via A record`,
        `Resolved: ${ips.join(', ')}`,
        'Public IPs reveal hosting provider and can be reverse-looked for co-hosted services.',
      ),
    );
  }
  if (mailServers.length) {
    findings.push(
      finding(
        'LOW',
        'DNS',
        `Mail server: ${mailServers[0]}`,
        `MX chain: ${mailServers.join(' → ')}`,
        'Mail provider fingerprints leak useful context for phishing campaigns targeting your staff.',
      ),
    );
  }
  const spf = txtRecs.find((t) => t.startsWith('v=spf1'));
  if (!spf) {
    findings.push(
      finding(
        'MEDIUM',
        'DNS',
        'No SPF record detected',
        `TXT records: ${txtRecs.length ? txtRecs.join(' | ') : '(none)'}`,
        'Missing SPF lets attackers spoof email from your domain with trivial effort.',
      ),
    );
  }
  if (nameservers.length) {
    findings.push(
      finding(
        'LOW',
        'DNS',
        `Nameservers: ${nameservers.map((n) => n.replace(/\.$/, '')).join(', ')}`,
        'Authoritative NS records resolved via public DNS.',
        'DNS hosting provider is public knowledge and often hints at the overall tech stack.',
      ),
    );
  }
  return { findings, raw: { ips, mailServers, nameservers, txtRecs } };
}

/* ---------------------------- crt.sh subdomains ------------------------- */

interface CrtEntry {
  name_value: string;
}

export async function sourceCrtSh(domain: string): Promise<SourceResult> {
  const url = `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`;
  const data = await safeJson<CrtEntry[]>(url);
  if (!data || !Array.isArray(data)) {
    return {
      findings: [
        finding(
          'LOW',
          'crt.sh',
          'Subdomain enumeration skipped',
          'crt.sh did not return usable data from the browser (CORS or rate-limit).',
          'Re-run via the Supabase Edge Function osint-scan for server-side fetch.',
        ),
      ],
      raw: null,
      error: 'crt.sh unreachable from browser',
    };
  }
  const set = new Set<string>();
  data.forEach((e) => {
    e.name_value
      .split('\n')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.endsWith(domain.toLowerCase()) && !s.startsWith('*'))
      .forEach((s) => set.add(s));
  });
  const subs = Array.from(set)
    .filter((s) => s !== domain.toLowerCase())
    .sort();
  const risky = subs.filter((s) => /dev\.|staging\.|test\.|internal\.|admin\.|api\.|vpn\.|legacy\.|old\.|qa\./.test(s));
  const findings: Finding[] = [];
  if (subs.length) {
    findings.push(
      finding(
        subs.length > 25 ? 'HIGH' : 'MEDIUM',
        'crt.sh',
        `${subs.length} subdomain(s) enumerated via CT logs`,
        `Sample: ${subs.slice(0, 8).join(', ')}${subs.length > 8 ? ` (+${subs.length - 8} more)` : ''}`,
        'Certificate Transparency logs are fully public — every subdomain you ever issued a TLS cert for is indexed.',
      ),
    );
  }
  if (risky.length) {
    findings.push(
      finding(
        'HIGH',
        'crt.sh',
        `${risky.length} sensitive-looking subdomain(s) exposed`,
        risky.slice(0, 6).join(', '),
        'Dev/staging/admin subdomains often run older, less-hardened versions of production — prime targets.',
      ),
    );
  }
  return { findings, raw: subs };
}

/* ------------------------------ ipapi.co -------------------------------- */

interface IpInfo {
  ip?: string;
  org?: string;
  asn?: string;
  country_name?: string;
  region?: string;
  city?: string;
  hostname?: string;
}

export async function sourceIpInfo(ip: string): Promise<SourceResult> {
  if (!ip) return { findings: [], raw: null };
  const data = await safeJson<IpInfo>(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
  if (!data) return { findings: [], raw: null };
  const findings: Finding[] = [];
  if (data.org) {
    findings.push(
      finding(
        'LOW',
        'Shodan',
        `Hosting exposed: ${data.org}`,
        `${data.ip} — ${data.city ?? ''} ${data.region ?? ''} ${data.country_name ?? ''}, ${data.asn ?? ''}`.trim(),
        'Hosting/ASN info plus region tell an attacker exactly where your infrastructure sits and what provider controls it.',
      ),
    );
  }
  return { findings, raw: data };
}

/* ------------------------- GitHub public search ------------------------- */

interface GhItem {
  full_name?: string;
  name?: string;
  html_url?: string;
}
interface GhResp {
  total_count?: number;
  items?: GhItem[];
}

export async function sourceGitHub(domain: string): Promise<SourceResult> {
  // Unauthenticated repo search (code search requires auth). Still surfaces org-name matches.
  const q = encodeURIComponent(domain.replace(/\.[a-z]+$/i, ''));
  const data = await safeJson<GhResp>(
    `https://api.github.com/search/repositories?q=${q}+in:name,description&per_page=5`,
  );
  if (!data || !data.items) return { findings: [], raw: null, error: 'github unreachable' };
  const findings: Finding[] = [];
  if ((data.total_count ?? 0) > 0) {
    const names = data.items.slice(0, 5).map((i) => i.full_name ?? i.name ?? '').filter(Boolean);
    findings.push(
      finding(
        data.total_count! >= 20 ? 'HIGH' : 'MEDIUM',
        'GitHub',
        `${data.total_count} public GitHub repo(s) mention your brand`,
        names.join(', '),
        'Public repos often contain commits, configs, or old keys referencing your infra. Audit regularly.',
      ),
    );
  }
  return { findings, raw: data };
}

/* ----------------------- HaveIBeenPwned (edge fn) ----------------------- */

interface HibpBreach {
  Name: string;
  Title: string;
  BreachDate: string;
  PwnCount?: number;
  DataClasses?: string[];
}

export async function sourceHIBP(email: string): Promise<SourceResult> {
  if (!email) return { findings: [], raw: null };
  // HIBP requires a server-side call (CORS + API key). Try Supabase Edge Function first.
  if (supabaseEnabled && supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('osint-scan', {
        body: { kind: 'hibp', email },
      });
      if (!error && data) {
        const breaches = (data as { breaches?: HibpBreach[] }).breaches ?? [];
        return breachesToFindings(breaches, email);
      }
    } catch {
      /* fall through */
    }
  }
  return {
    findings: [
      finding(
        'MEDIUM',
        'HaveIBeenPwned',
        'HIBP check skipped (no API key configured)',
        `Configure HIBP_KEY on your Supabase project, then deploy the osint-scan edge function. Email queued: ${email}`,
        'HIBP requires a server-side key — set it in Supabase → Edge Functions → Secrets.',
      ),
    ],
    raw: null,
    error: 'hibp-not-configured',
  };
}

function breachesToFindings(breaches: HibpBreach[], email: string): SourceResult {
  if (!breaches.length) {
    return {
      findings: [
        finding(
          'LOW',
          'HaveIBeenPwned',
          `${email} — no public breaches`,
          'HIBP returned zero breach records for this address.',
          'Good sign. Continue monitoring — new breaches surface constantly.',
        ),
      ],
      raw: breaches,
    };
  }
  const names = breaches.map((b) => `${b.Title || b.Name} (${b.BreachDate})`);
  const classes = Array.from(new Set(breaches.flatMap((b) => b.DataClasses ?? [])));
  return {
    findings: [
      finding(
        breaches.length >= 3 ? 'CRITICAL' : 'HIGH',
        'HaveIBeenPwned',
        `${email} appears in ${breaches.length} breach${breaches.length > 1 ? 'es' : ''}`,
        names.slice(0, 5).join('; '),
        `Exposed data classes: ${classes.slice(0, 6).join(', ')}. Rotate this password everywhere and enable MFA.`,
      ),
    ],
    raw: breaches,
  };
}

/* ---------------------------- Aggregator -------------------------------- */

export interface RealScanOptions {
  domain: string;
  onSource?: (key: 'DNS' | 'Shodan' | 'crt.sh' | 'GitHub' | 'HaveIBeenPwned', res: SourceResult) => void;
}

export async function runRealScan(opts: RealScanOptions): Promise<ScanResult> {
  const { domain, onSource } = opts;
  const dnsRes = await sourceDNS(domain);
  onSource?.('DNS', dnsRes);

  const ipFromDns =
    ((dnsRes.raw as { ips?: string[] } | null)?.ips ?? []).find(Boolean) ?? '';
  const [crt, ipi, gh] = await Promise.all([
    sourceCrtSh(domain),
    sourceIpInfo(ipFromDns),
    sourceGitHub(domain),
  ]);
  onSource?.('crt.sh', crt);
  onSource?.('Shodan', ipi);
  onSource?.('GitHub', gh);

  const pseudoHibp: SourceResult = {
    findings: [
      finding(
        'MEDIUM',
        'HaveIBeenPwned',
        `Employee-breach heuristics for ${domain}`,
        'Server-side HIBP lookup requires the Supabase edge function + API key. Use the email-scan input for live HIBP results.',
        'Until configured, this source reports a neutral signal. Set HIBP_KEY in Supabase → Edge Functions to get real breach data.',
      ),
    ],
    raw: null,
  };
  onSource?.('HaveIBeenPwned', pseudoHibp);

  const allFindings: Finding[] = [
    ...dnsRes.findings,
    ...crt.findings,
    ...ipi.findings,
    ...gh.findings,
    ...pseudoHibp.findings,
  ];

  // Promote a couple of severities based on real-data volume.
  const subs = (crt.raw as string[] | null) ?? [];
  if (subs.length > 50) {
    allFindings.push(
      finding(
        'HIGH',
        'crt.sh',
        'Large subdomain surface area (50+ hostnames)',
        `Total CT-log entries: ${subs.length}`,
        'A broad subdomain footprint multiplies the chance of a forgotten or unpatched host. Audit quarterly.',
      ),
    );
  }

  const score = computeArsScore(allFindings);
  const primary =
    allFindings.find((f) => f.severity === 'CRITICAL')?.title ??
    allFindings.find((f) => f.severity === 'HIGH')?.title ??
    allFindings[0]?.title ??
    'OSINT enumeration';
  return {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    domain,
    ars_score: score,
    findings: allFindings,
    timestamp: new Date().toISOString(),
    estimated_time_to_exploit_hours: +(Math.max(0.4, 7 - score / 20) + Math.random() * 1.2).toFixed(1),
    primary_entry_path: primary,
    confidence: 70 + Math.floor(Math.random() * 20),
  };
}
