import type {
  AttackStep,
  BreachEvent,
  BreachSimulation,
  DarkWebListing,
  ExposureBreakdown,
  ExposureScore,
  KillChain,
} from './types';
import { randInt } from './utils';

export function generateKillChain(domain: string): KillChain {
  const steps: AttackStep[] = [
    {
      id: 'as1',
      step: 1,
      title: `Exposed Jenkins at ci.${domain}`,
      description: `Attacker discovers Jenkins CI server via subdomain enumeration on crt.sh. Server is running Jenkins 2.319 with anonymous read access enabled.`,
      mitrePhase: 'Reconnaissance',
      mitreTechnique: 'T1593 - Search Open Websites/Domains',
      risk: 'MEDIUM',
      fix: 'Restrict Jenkins access behind VPN/SSO. Disable anonymous access in Configure Global Security.',
      timeMinutes: 2,
    },
    {
      id: 'as2',
      step: 2,
      title: 'Default credentials on Jenkins admin',
      description: `Login page accepts admin/admin. Full administrative access to CI/CD pipeline achieved in under 30 seconds.`,
      mitrePhase: 'Initial Access',
      mitreTechnique: 'T1078 - Valid Accounts',
      risk: 'CRITICAL',
      fix: 'Enforce strong passwords. Enable LDAP/SSO integration. Add MFA for all admin accounts.',
      timeMinutes: 1,
    },
    {
      id: 'as3',
      step: 3,
      title: 'Pipeline contains AWS credentials',
      description: `Jenkins build pipeline for "deploy-prod" job exposes AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in plaintext environment variables.`,
      mitrePhase: 'Credential Access',
      mitreTechnique: 'T1552 - Unsecured Credentials',
      risk: 'CRITICAL',
      fix: 'Use Jenkins Credentials Plugin with Secret Text. Rotate all exposed keys immediately. Use IAM roles for EC2.',
      timeMinutes: 1,
    },
    {
      id: 'as4',
      step: 4,
      title: 'IAM key has S3 full access',
      description: `Stolen AWS key has s3:* permissions. Attacker enumerates all buckets: ${domain}-prod-data, ${domain}-backups, ${domain}-logs.`,
      mitrePhase: 'Discovery',
      mitreTechnique: 'T1580 - Cloud Infrastructure Discovery',
      risk: 'HIGH',
      fix: 'Apply principle of least privilege. Scope IAM policies to specific buckets and actions. Enable CloudTrail alerts.',
      timeMinutes: 1,
    },
    {
      id: 'as5',
      step: 5,
      title: 'Lateral movement via RDS credentials',
      description: `S3 backup bucket contains database dump with RDS connection string and master password. Attacker connects to prod MySQL directly.`,
      mitrePhase: 'Lateral Movement',
      mitreTechnique: 'T1021 - Remote Services',
      risk: 'CRITICAL',
      fix: 'Encrypt database backups. Restrict RDS security groups to private subnets only. Rotate DB credentials.',
      timeMinutes: 2,
    },
    {
      id: 'as6',
      step: 6,
      title: '2.4M user records exfiltrated',
      description: `SELECT * FROM users — 2,437,891 records including email, hashed_password (MD5), phone, address. Data compressed and uploaded to attacker C2 in 11 minutes.`,
      mitrePhase: 'Exfiltration',
      mitreTechnique: 'T1567 - Exfiltration Over Web Service',
      risk: 'CRITICAL',
      fix: 'Enable RDS audit logging. Use bcrypt/argon2 for passwords. Implement DLP monitoring. Set up VPC flow log alerts.',
      timeMinutes: 11,
    },
  ];

  const totalTime = steps.reduce((sum, s) => sum + s.timeMinutes, 0);

  return {
    id: `kc_${Date.now()}`,
    domain,
    steps,
    totalTimeMinutes: totalTime,
    dataAtRisk: '2.4M user records (PII, credentials, payment data)',
    likelihood: randInt(78, 95),
  };
}

export function generateBreachSimulation(domain: string): BreachSimulation {
  const events: BreachEvent[] = [
    {
      id: 'b1',
      timestamp: 0,
      action: 'RECON',
      detail: `Scanning ${domain} attack surface...`,
      severity: 'info',
    },
    {
      id: 'b2',
      timestamp: 3,
      action: 'SUBDOMAIN FOUND',
      detail: `ci.${domain} — Jenkins CI (port 8080)`,
      severity: 'warning',
    },
    {
      id: 'b3',
      timestamp: 8,
      action: 'CREDENTIAL SPRAY',
      detail: 'Trying default credentials on Jenkins...',
      severity: 'warning',
    },
    {
      id: 'b4',
      timestamp: 12,
      action: 'ACCESS GRANTED',
      detail: 'admin:admin — Full Jenkins admin access achieved',
      severity: 'critical',
      filesAccessed: ['/var/jenkins_home/config.xml', '/var/jenkins_home/credentials.xml'],
    },
    {
      id: 'b5',
      timestamp: 18,
      action: 'CREDENTIAL HARVEST',
      detail: 'Extracting AWS keys from build pipeline env vars...',
      severity: 'critical',
      filesAccessed: ['/jobs/deploy-prod/config.xml'],
    },
    {
      id: 'b6',
      timestamp: 25,
      action: 'CLOUD PIVOT',
      detail: 'AWS API call: sts:GetCallerIdentity — valid session',
      severity: 'critical',
    },
    {
      id: 'b7',
      timestamp: 35,
      action: 'BUCKET ENUM',
      detail: `s3:ListBuckets — Found: ${domain}-prod-data, ${domain}-backups`,
      severity: 'critical',
      filesAccessed: [`s3://${domain}-backups/db-dump-latest.sql.gz`],
      dataSize: '4.2 GB',
    },
    {
      id: 'b8',
      timestamp: 60,
      action: 'DB CONNECTION',
      detail: `mysql -h rds.${domain} -u admin — Connection established`,
      severity: 'critical',
    },
    {
      id: 'b9',
      timestamp: 90,
      action: 'DATA EXFIL',
      detail: 'SELECT * FROM users — Streaming 2.4M records...',
      severity: 'critical',
      dataSize: '1.8 GB',
    },
    {
      id: 'b10',
      timestamp: 180,
      action: 'EXFIL COMPLETE',
      detail: '2,437,891 records exfiltrated to C2 server',
      severity: 'critical',
      dataSize: '1.8 GB',
    },
    {
      id: 'b11',
      timestamp: 220,
      action: 'RANSOMWARE DEPLOY',
      detail: 'Encrypting S3 bucket contents...',
      severity: 'critical',
    },
    {
      id: 'b12',
      timestamp: 257,
      action: 'RANSOM NOTE',
      detail: 'Ransom note placed. Breach complete.',
      severity: 'critical',
    },
  ];

  return {
    domain,
    events,
    totalDurationSeconds: 257,
    recordsExfiltrated: 2437891,
    ransomNote: `YOUR DATA HAS BEEN ENCRYPTED

All files on ${domain}-prod-data and ${domain}-backups have been encrypted with AES-256.

We have exfiltrated 2,437,891 user records including:
- Full names and email addresses
- Password hashes (MD5 — trivially crackable)
- Phone numbers and physical addresses
- Payment card last-4 digits

PAYMENT: 15 BTC to bc1q...7x3f within 72 hours
CONTACT: breach-${domain.replace(/\./g, '-')}@protonmail.com

If payment is not received, data will be published on our leak site
and sold to the highest bidder.

Time remaining: 71:59:59`,
  };
}

export function generateDarkWebListings(domain: string): DarkWebListing[] {
  return [
    {
      id: 'dw1',
      title: `Full admin access to ${domain}`,
      seller: 'darkphoenix_42',
      price: '450',
      currency: 'USD',
      lastUpdated: '2 days ago',
      credentials: 3,
      accessType: 'RDP + SSH + Admin Panel',
      details: [
        '3 valid admin credentials (tested today)',
        'RDP open on port 3389 — no MFA',
        'Jenkins CI with pipeline secrets',
        'AWS root access via leaked IAM key',
      ],
      rating: 4.8,
      reviews: 23,
    },
    {
      id: 'dw2',
      title: `${domain} — 2.4M user database dump`,
      seller: 'data_broker_elite',
      price: '2,500',
      currency: 'USD',
      lastUpdated: '5 days ago',
      credentials: 0,
      accessType: 'Database Dump',
      details: [
        'Full users table: email, password (MD5), phone, address',
        '2,437,891 records — verified fresh',
        'Includes 12,400 .gov and .edu emails',
        'Payment card last-4 for 890K records',
      ],
      rating: 4.9,
      reviews: 47,
    },
    {
      id: 'dw3',
      title: `${domain} employee credentials (bulk)`,
      seller: 'credential_king',
      price: '180',
      currency: 'USD',
      lastUpdated: '1 week ago',
      credentials: 47,
      accessType: 'Email + Password Combos',
      details: [
        '47 employee email/password combos',
        'Sourced from LinkedIn breach + reuse analysis',
        '12 work on VPN, 8 work on email',
        'C-suite: CEO, CTO, CFO credentials included',
      ],
      rating: 4.5,
      reviews: 12,
    },
    {
      id: 'dw4',
      title: `Internal network map — ${domain}`,
      seller: 'netrecon_pro',
      price: '800',
      currency: 'USD',
      lastUpdated: '3 days ago',
      credentials: 0,
      accessType: 'Network Intelligence',
      details: [
        'Full internal IP range mapping',
        'Active Directory structure + admin accounts',
        'AWS account ID + region mapping',
        'List of 23 internal services with versions',
      ],
      rating: 4.7,
      reviews: 8,
    },
  ];
}

export function generateExposureScore(domain: string, findingCount: number): ExposureScore {
  const breakdown: ExposureBreakdown = {
    digitalFootprint: Math.min(100, randInt(55, 90)),
    credentialLeaks: Math.min(100, randInt(40, 95)),
    attackSurface: Math.min(100, randInt(50, 85)),
    patchLag: Math.min(100, randInt(30, 75)),
    socialEngineering: Math.min(100, randInt(45, 80)),
  };

  const weighted =
    breakdown.digitalFootprint * 0.15 +
    breakdown.credentialLeaks * 0.3 +
    breakdown.attackSurface * 0.25 +
    breakdown.patchLag * 0.15 +
    breakdown.socialEngineering * 0.15;

  const hackabilityScore = Math.round(Math.min(99, Math.max(15, weighted + randInt(-5, 5))));

  const riskLevel =
    hackabilityScore >= 80 ? 'EXTREME' :
    hackabilityScore >= 60 ? 'HIGH' :
    hackabilityScore >= 40 ? 'MODERATE' : 'LOW';

  return {
    hackabilityScore,
    breakdown,
    riskLevel,
    summary: `${domain} presents a hackability score of ${hackabilityScore}/100, classified as ${riskLevel} risk. With ${findingCount} identified vulnerabilities across multiple attack vectors, the estimated time-to-breach is under 4 hours. Immediate remediation of credential leaks and exposed services is critical.`,
  };
}
