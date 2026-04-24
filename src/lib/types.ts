export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ScanSource =
  | 'HaveIBeenPwned'
  | 'Shodan'
  | 'crt.sh'
  | 'GitHub'
  | 'DNS'
  | 'DarkWeb'
  | 'SSL'
  | 'LinkedIn';

export interface Finding {
  id: string;
  severity: Severity;
  source: ScanSource;
  title: string;
  description: string;
  meaning: string;
  fix?: string;
}

export interface ScanResult {
  id: string;
  domain: string;
  ars_score: number;
  findings: Finding[];
  timestamp: string;
  estimated_time_to_exploit_hours: number;
  primary_entry_path: string;
  confidence: number;
}

export type DecoyType =
  | 'honey-admin'
  | 'fake-aws-key'
  | 'decoy-login'
  | 'honey-token';

export interface Decoy {
  id: DecoyType;
  name: string;
  active: boolean;
  meta: Record<string, string>;
  logs: DecoyLog[];
}

export interface DecoyLog {
  id: string;
  timestamp: string;
  ip: string;
  location: string;
  user_agent: string;
  action: string;
}

export type ThreatKind =
  | 'CREDENTIAL STUFFING'
  | 'PORT SCAN'
  | 'SQL INJECTION'
  | 'BRUTE FORCE'
  | 'OSINT SCRAPE'
  | 'API ABUSE'
  | 'SUBDOMAIN ENUM'
  | 'DIRECTORY BRUTE';

export type ThreatStatus = 'NEUTRALIZED' | 'BLOCKED' | 'DECEIVED' | 'TRACKED' | 'POISONED';

export interface ThreatEvent {
  id: string;
  timestamp: string;
  kind: ThreatKind;
  ip: string;
  country_flag: string;
  action: string;
  status: ThreatStatus;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export type AlertSeverity = 'CRITICAL' | 'HIGH';

export interface Alert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  ip: string;
  country_flag: string;
  country: string;
  network_tag: string;
  user_agent: string;
  asset_used: string;
  asset_value: string;
  behavior: {
    requests: string;
    pattern: string;
    fingerprint: string;
  };
  classification: {
    label: 'Automated Recon Bot' | 'Human Attacker';
    confidence: number;
  };
  attack_path: Array<{ step: number; label: string; triggered?: boolean; predicted?: boolean }>;
  status: 'open' | 'flagged' | 'dismissed';
}

/* ━━━ Module 2: AI Attack Path Engine ━━━ */

export type MitrePhase =
  | 'Reconnaissance'
  | 'Initial Access'
  | 'Execution'
  | 'Persistence'
  | 'Privilege Escalation'
  | 'Defense Evasion'
  | 'Credential Access'
  | 'Discovery'
  | 'Lateral Movement'
  | 'Collection'
  | 'Exfiltration'
  | 'Impact';

export interface AttackStep {
  id: string;
  step: number;
  title: string;
  description: string;
  mitrePhase: MitrePhase;
  mitreTechnique: string;
  risk: Severity;
  fix: string;
  timeMinutes: number;
}

export interface KillChain {
  id: string;
  domain: string;
  steps: AttackStep[];
  totalTimeMinutes: number;
  dataAtRisk: string;
  likelihood: number;
}

/* ━━━ Module 3: Breach Simulator ━━━ */

export interface BreachEvent {
  id: string;
  timestamp: number;
  action: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
  filesAccessed?: string[];
  dataSize?: string;
}

export interface BreachSimulation {
  domain: string;
  events: BreachEvent[];
  totalDurationSeconds: number;
  recordsExfiltrated: number;
  ransomNote: string;
}

/* ━━━ Module 4: Dark Web Mirror ━━━ */

export interface DarkWebListing {
  id: string;
  title: string;
  seller: string;
  price: string;
  currency: string;
  lastUpdated: string;
  credentials: number;
  accessType: string;
  details: string[];
  rating: number;
  reviews: number;
}

/* ━━━ Module 5: Exposure Score ━━━ */

export interface ExposureBreakdown {
  digitalFootprint: number;
  credentialLeaks: number;
  attackSurface: number;
  patchLag: number;
  socialEngineering: number;
}

export interface ExposureScore {
  hackabilityScore: number;
  breakdown: ExposureBreakdown;
  riskLevel: 'EXTREME' | 'HIGH' | 'MODERATE' | 'LOW';
  summary: string;
}
