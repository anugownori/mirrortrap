import type { Alert, Decoy, Finding, ScanResult, Severity } from './types';
import { pick, randInt } from './utils';

const FINDING_TEMPLATES: Array<Omit<Finding, 'id'>> = [
  {
    severity: 'CRITICAL',
    source: 'HaveIBeenPwned',
    title: 'Employee email found in 2023 breach database',
    description:
      '3 employee emails (including finance@{domain}) appear in the LinkedIn-Slackware 2023 leak with plaintext password hashes.',
    meaning:
      'Attackers can use these credentials for password-spray and credential-stuffing against your SSO, VPN, and webmail before any active recon hits your logs.',
  },
  {
    severity: 'CRITICAL',
    source: 'GitHub',
    title: 'GitHub commit contains hardcoded credential pattern',
    description:
      'Public commit `a7f2c91` on gist.github.com references an AWS-style key pattern near mentions of `{domain}`.',
    meaning:
      'Leaked secrets are the #1 initial-access vector. This lets an attacker skip reconnaissance entirely and authenticate directly against your cloud plane.',
  },
  {
    severity: 'HIGH',
    source: 'crt.sh',
    title: 'Subdomain dev.{domain} found with no authentication',
    description:
      'Certificate transparency logs reveal `dev.{domain}` and `staging.{domain}` — staging returns HTTP 200 without an auth wall.',
    meaning:
      'Non-prod environments usually have weaker controls, older code, and verbose errors — an ideal foothold for lateral movement into prod.',
  },
  {
    severity: 'HIGH',
    source: 'Shodan',
    title: 'Shodan shows port 3306 (MySQL) open on IP',
    description:
      'Shodan banner on `203.0.113.42` exposes MySQL 5.7.38 with a world-reachable listener.',
    meaning:
      'An open database port broadcasts your stack version, inviting CVE-targeted exploits and brute-force against `root` / common accounts.',
  },
  {
    severity: 'HIGH',
    source: 'GitHub',
    title: 'Internal Slack webhook URL leaked in public repo',
    description:
      'A public search turned up a Slack `hooks.slack.com/services/...` URL authored by an email on `{domain}`.',
    meaning:
      'Webhooks can be used to impersonate internal bots and phish staff from inside their own Slack — a devastating social-engineering primitive.',
  },
  {
    severity: 'MEDIUM',
    source: 'GitHub',
    title: '12 employee profiles expose org structure on LinkedIn',
    description:
      '12 LinkedIn profiles mentioning `{domain}` expose the reporting chain from CTO → SRE team lead → on-call engineers.',
    meaning:
      'This feeds spear-phishing. Knowing who reports to whom lets attackers forge targeted "urgent" requests from the C-suite.',
  },
  {
    severity: 'MEDIUM',
    source: 'DNS',
    title: 'Job posting reveals "AWS EC2 + RDS MySQL" tech stack',
    description:
      'A LinkedIn job post for a `{domain}` SRE role names AWS EC2, RDS MySQL, Terraform, and legacy PHP 7.4 services.',
    meaning:
      'Attackers weaponize stack disclosures to pre-select exploit kits before sending a single packet, reducing detection surface.',
  },
  {
    severity: 'LOW',
    source: 'DNS',
    title: 'SSL certificate expiring in 45 days',
    description:
      '`www.{domain}` certificate issued by Let\'s Encrypt expires in 45 days and has no auto-renew record.',
    meaning:
      'Expired certs cause user-facing browser warnings that train users to bypass security — a pretext adversaries later exploit.',
  },
];

export function generateFindings(domain: string): Finding[] {
  const shuffled = [...FINDING_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 7).map((t, i) => ({
    ...t,
    id: `f_${i}_${Math.random().toString(36).slice(2, 8)}`,
    description: t.description.replaceAll('{domain}', domain),
  }));
}

export function computeArsScore(findings: Finding[]): number {
  const weights: Record<Severity, number> = { CRITICAL: 28, HIGH: 14, MEDIUM: 6, LOW: 2 };
  const raw = findings.reduce((acc, f) => acc + weights[f.severity], 0);
  return Math.min(99, Math.max(12, raw + randInt(-3, 5)));
}

export function generateScanResult(domain: string): ScanResult {
  const findings = generateFindings(domain);
  const score = computeArsScore(findings);
  const entryPath = findings.find((f) => f.severity === 'CRITICAL')?.title ?? findings[0]?.title ?? 'OSINT enumeration';
  return {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    domain,
    ars_score: score,
    findings,
    timestamp: new Date().toISOString(),
    estimated_time_to_exploit_hours: +(Math.max(0.4, 7 - score / 20) + Math.random() * 1.5).toFixed(1),
    primary_entry_path: entryPath,
    confidence: 70 + randInt(10, 25),
  };
}

const IPS = [
  '185.220.101.47',
  '104.244.74.19',
  '45.153.160.138',
  '162.247.74.206',
  '91.219.237.244',
  '193.189.100.203',
];
const FLAGS: Array<[string, string, string]> = [
  ['🇷🇴', 'Romania', 'Tor Exit Node'],
  ['🇷🇺', 'Russia', 'Hosting Provider'],
  ['🇨🇳', 'China', 'Aliyun IDC'],
  ['🇳🇱', 'Netherlands', 'Datacenter'],
  ['🇧🇷', 'Brazil', 'Residential ISP'],
];
const UA = [
  'python-requests/2.31',
  'curl/8.1.2',
  'Mozilla/5.0 (compatible; ZmEu)',
  'Go-http-client/1.1',
  'Nmap Scripting Engine',
];

export function generateAlert(partial?: Partial<Alert>): Alert {
  const [flag, country, net] = pick(FLAGS);
  const sev: Alert['severity'] = Math.random() > 0.4 ? 'CRITICAL' : 'HIGH';
  const asset = pick([
    { name: 'Fake AWS Key', value: 'AKIA7F3X8N2M9K4L5B6Q' },
    { name: 'Honey Token URL', value: 'https://docs-internal.monitor.io/q2-roadmap' },
    { name: 'Honey Admin Portal', value: 'https://admin-backup.monitor.io/login' },
    { name: 'Decoy Login Portal', value: 'https://dev-old.trap.io/signin' },
  ]);
  const isBot = Math.random() > 0.3;
  return {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    severity: sev,
    ip: pick(IPS),
    country_flag: flag,
    country,
    network_tag: net,
    user_agent: pick(UA),
    asset_used: asset.name,
    asset_value: asset.value,
    behavior: {
      requests: `${randInt(6, 22)} requests in ${randInt(2, 5)} seconds`,
      pattern: isBot ? 'Sequential endpoint probing' : 'Low-and-slow credential testing',
      fingerprint: isBot ? 'No browser fingerprint' : 'Spoofed browser headers — inconsistent TLS',
    },
    classification: {
      label: isBot ? 'Automated Recon Bot' : 'Human Attacker',
      confidence: randInt(82, 96),
    },
    attack_path: [
      { step: 1, label: 'GitHub OSINT scan → Found credential pattern' },
      { step: 2, label: 'Credential extraction attempt' },
      { step: 3, label: 'AWS key validation attempt', triggered: true },
      { step: 4, label: 'S3 bucket enumeration', predicted: true },
      { step: 5, label: 'Data exfiltration attempt', predicted: true },
    ],
    status: 'open',
    ...partial,
  };
}

export const SEED_DECOYS: Decoy[] = [
  {
    id: 'honey-admin',
    name: 'Honey Admin Portal',
    active: false,
    meta: {
      url: 'https://admin-backup.{domain}.monitor.io',
      tracking: 'IP + Timestamp + User-Agent',
    },
    logs: [
      {
        id: 'l1',
        timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        ip: '185.220.101.47',
        location: '🇷🇴 Romania',
        user_agent: 'python-requests/2.31',
        action: 'GET /login',
      },
    ],
  },
  {
    id: 'fake-aws-key',
    name: 'Fake AWS Key',
    active: false,
    meta: { key: 'AKIA7F3X8N2M9K4L5B6Q', validation_endpoint: 'monitoring' },
    logs: [
      {
        id: 'l2',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        ip: '104.244.74.19',
        location: '🇳🇱 Netherlands',
        user_agent: 'aws-cli/2.15.0',
        action: 'sts:GetCallerIdentity',
      },
    ],
  },
  {
    id: 'decoy-login',
    name: 'Decoy Login Portal',
    active: false,
    meta: {
      url: 'https://dev-old.{domain}.trap.io',
      captures: 'username attempts, password patterns',
    },
    logs: [],
  },
  {
    id: 'honey-token',
    name: 'Honey Token URLs',
    active: false,
    meta: {
      urls: '3 unique tracking URLs generated',
      deployed_to: '2 paste sites, 1 GitHub gist',
    },
    logs: [],
  },
];

export const DEMO_DOMAIN = 'targetcompany.com';

export const DEMO_SCAN: ScanResult = {
  id: 'demo_scan',
  domain: DEMO_DOMAIN,
  ars_score: 84,
  timestamp: new Date().toISOString(),
  estimated_time_to_exploit_hours: 2.4,
  primary_entry_path: 'Leaked AWS credential → S3 enumeration',
  confidence: 92,
  findings: [
    {
      id: 'df1',
      severity: 'CRITICAL',
      source: 'GitHub',
      title: 'Leaked AWS key pattern in public gist',
      description: 'Public gist by a @targetcompany.com employee contains a string matching AWS access-key format.',
      meaning: 'Direct authentication bypass. Attackers can mint session tokens without touching your front door.',
    },
    {
      id: 'df2',
      severity: 'CRITICAL',
      source: 'HaveIBeenPwned',
      title: '7 employee emails in 2024 SaaS breach',
      description: '7 corporate emails found in the ServiceDesk+ March 2024 breach with reused passwords.',
      meaning: 'Reused passwords mean SSO, VPN, and corporate email are all one guess away.',
    },
    {
      id: 'df3',
      severity: 'HIGH',
      source: 'crt.sh',
      title: 'Unauthenticated staging.targetcompany.com',
      description: 'staging.targetcompany.com returns HTTP 200 and exposes /admin without auth.',
      meaning: 'Staging is the attacker\'s shortcut to prod — shared secrets, outdated code, loose logging.',
    },
    {
      id: 'df4',
      severity: 'HIGH',
      source: 'Shodan',
      title: 'MySQL 5.7 exposed on 203.0.113.42:3306',
      description: 'Shodan banner reveals an unauthenticated MySQL 5.7.38 listener on a corporate IP.',
      meaning: 'Known CVEs for this version enable authentication bypass in under an hour.',
    },
    {
      id: 'df5',
      severity: 'HIGH',
      source: 'GitHub',
      title: 'Slack webhook in public commit',
      description: 'A Slack hooks.slack.com URL was committed to a public repo touching targetcompany.com tooling.',
      meaning: 'Attackers can send fake "urgent" messages into your internal channels from a trusted bot.',
    },
    {
      id: 'df6',
      severity: 'MEDIUM',
      source: 'GitHub',
      title: 'LinkedIn exposes SRE reporting chain',
      description: '12 LinkedIn profiles map the CTO → SRE → on-call engineer hierarchy in full.',
      meaning: 'Feeds spear-phishing with credible "from the CTO" pretext.',
    },
    {
      id: 'df7',
      severity: 'MEDIUM',
      source: 'DNS',
      title: 'Job posting leaks AWS + PHP 7.4 stack',
      description: 'Open SRE role names AWS EC2, RDS MySQL, Terraform, and legacy PHP 7.4.',
      meaning: 'Attackers pre-select exploits for your exact stack before touching your network.',
    },
  ],
};

export const DEMO_ALERTS: Alert[] = [
  generateAlert({
    severity: 'CRITICAL',
    ip: '185.220.101.47',
    country_flag: '🇷🇴',
    country: 'Romania',
    network_tag: 'Tor Exit Node',
    user_agent: 'python-requests/2.31',
    asset_used: 'Fake AWS Key',
    asset_value: 'AKIA7F3X8N2M9K4L5B6Q',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  }),
  generateAlert({
    severity: 'HIGH',
    ip: '45.153.160.138',
    country_flag: '🇷🇺',
    country: 'Russia',
    network_tag: 'Hosting Provider',
    user_agent: 'Go-http-client/1.1',
    asset_used: 'Honey Token URL',
    asset_value: 'https://docs-internal.monitor.io/q2-roadmap',
    timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
  }),
  generateAlert({
    severity: 'CRITICAL',
    ip: '104.244.74.19',
    country_flag: '🇳🇱',
    country: 'Netherlands',
    network_tag: 'Datacenter',
    user_agent: 'aws-cli/2.15.0',
    asset_used: 'Honey Admin Portal',
    asset_value: 'https://admin-backup.monitor.io/login',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  }),
];

export function generateScanHistory(): ScanResult[] {
  const now = Date.now();
  const scores = [62, 58, 71, 76, 68, 74, 84];
  const domains = ['targetcompany.com', 'targetcompany.com', 'targetcompany.com', 'targetcompany.com', 'targetcompany.com', 'targetcompany.com', 'targetcompany.com'];
  return scores.map((s, i) => {
    const result = generateScanResult(domains[i]);
    return {
      ...result,
      ars_score: s,
      timestamp: new Date(now - (scores.length - i) * 1000 * 60 * 60 * 24 * 3).toISOString(),
      id: `hist_${i}`,
    };
  });
}
