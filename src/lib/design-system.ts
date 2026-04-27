// Design System Tokens — Single source of truth
// Import and use these in components for consistency

export const COLORS = {
  // Backgrounds
  bgPrimary: '#080B14',
  bgSurface: '#0D1117',
  bgCard: '#0F1724',
  bgTerminal: '#05080F',

  // Brand accents
  purple: '#6366F1',
  cyan: '#06B6D4',
  emerald: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  rose: '#F43F5E',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#475569',

  // Borders
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderActive: 'rgba(99,102,241,0.4)',
} as const;

export const TYPOGRAPHY = {
  fontSans: "Inter, ui-sans-serif, system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
  size: {
    xs: '11px',
    sm: '13px',
    base: '15px',
    lg: '17px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
} as const;

export const GLASS = {
  base: {
    background: 'rgba(15, 23, 36, 0.7)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
  },
} as const;

export const GLOW = {
  purple: '0 0 40px rgba(99,102,241,0.15)',
  cyan: '0 0 40px rgba(6,182,212,0.15)',
  red: '0 0 40px rgba(239,68,68,0.2)',
} as const;

export const ANIMATION = {
  fast: '150ms ease-out',
  normal: '250ms ease-in-out',
  slow: '400ms cubic-bezier(0.4,0,0.2,1)',
} as const;

// Severity color mapping
export const SEVERITY_COLORS = {
  CRITICAL: { bg: 'rgba(239,68,68,0.15)', text: '#F87171', border: 'rgba(239,68,68,0.3)', glow: GLOW.red },
  HIGH: { bg: 'rgba(244,63,94,0.15)', text: '#FB7185', border: 'rgba(244,63,94,0.25)', glow: '' },
  MEDIUM: { bg: 'rgba(245,158,11,0.15)', text: '#FBBf24', border: 'rgba(245,158,11,0.25)', glow: '' },
  LOW: { bg: 'rgba(16,185,129,0.15)', text: '#34D399', border: 'rgba(16,185,129,0.25)', glow: '' },
  INFO: { bg: 'rgba(99,102,241,0.15)', text: '#818CF8', border: 'rgba(99,102,241,0.25)', glow: '' },
} as const;

// ARS score color thresholds
export function arsScoreColor(score: number): string {
  if (score <= 39) return COLORS.emerald;
  if (score <= 69) return COLORS.amber;
  if (score <= 84) return COLORS.rose;
  return COLORS.red;
}

export function arsRiskLabel(score: number): string {
  if (score <= 20) return 'MINIMAL';
  if (score <= 39) return 'LOW';
  if (score <= 59) return 'MODERATE';
  if (score <= 79) return 'HIGH';
  return 'CRITICAL';
}
