/** @type {import('tailwindcss').Config} */
import animate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Primary backgrounds
        bg: {
          DEFAULT: '#080B14',
          surface: '#0D1117',
          card: '#0F1724',
          terminal: '#05080F',
        },
        // Brand / accent
        brand: {
          purple: '#6366F1',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          rose: '#F43F5E',
          // Legacy aliases
          success: '#10B981',
          danger: '#EF4444',
        },
        // Borders
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          active: 'rgba(99,102,241,0.4)',
          strong: 'rgba(99,102,241,0.45)',
        },
        // Text
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#475569',
        },
        // Indigo (same as brand.purple alias for Tailwind utilities)
        indigo: {
          400: '#818CF8',
          500: '#6366F1',
        },
        // Extended palette for badge variants
        emerald: {
          400: '#34D399',
          500: '#10B981',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.5' }],
        sm: ['13px', { lineHeight: '1.6' }],
        base: ['15px', { lineHeight: '1.6' }],
        lg: ['17px', { lineHeight: '1.5' }],
        xl: ['20px', { lineHeight: '1.4' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
        '4xl': ['36px', { lineHeight: '1.1' }],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        lg: '10px',
      },
      boxShadow: {
        // Legacy
        glow: '0 0 0 1px rgba(99,102,241,0.35), 0 10px 40px -10px rgba(99,102,241,0.55)',
        'glow-amber': '0 0 0 1px rgba(245,158,11,0.4), 0 10px 40px -10px rgba(245,158,11,0.5)',
        'glow-success': '0 0 0 1px rgba(16,185,129,0.4), 0 10px 30px -10px rgba(16,185,129,0.5)',
        'glow-danger': '0 0 0 1px rgba(239,68,68,0.5), 0 10px 30px -10px rgba(239,68,68,0.5)',
        // New spec
        'glow-purple': '0 0 40px rgba(99,102,241,0.15)',
        'glow-cyan': '0 0 40px rgba(6,182,212,0.15)',
        'glow-red': '0 0 40px rgba(239,68,68,0.2)',
        glass: '0 8px 32px rgba(0,0,0,0.4)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
        },
        'slide-in-top': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(20px)' },
        },
        'red-flash': {
          '0%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.8)' },
          '100%': { boxShadow: '0 0 0 20px rgba(239,68,68,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
        'caret-blink': {
          '0%, 70%, 100%': { opacity: '1' },
          '20%, 50%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.6)' },
          '70%': { boxShadow: '0 0 0 12px rgba(239,68,68,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0)' },
        },
        'danger-flash': {
          '0%, 100%': { backgroundColor: 'rgba(239,68,68,0.08)' },
          '50%': { backgroundColor: 'rgba(239,68,68,0.28)' },
        },
        // New spec animations
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'data-flow': {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        'draw-progress': {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--dash-offset)' },
        },
        'ring-pulse-green': {
          '0%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(16,185,129,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0)' },
        },
        'ring-pulse-red': {
          '0%': { boxShadow: '0 0 0 0 rgba(239,68,68,0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(239,68,68,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(239,68,68,0)' },
        },
        'ring-pulse-amber': {
          '0%': { boxShadow: '0 0 0 0 rgba(245,158,11,0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(245,158,11,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(245,158,11,0)' },
        },
        'ring-pulse-blue': {
          '0%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(99,102,241,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
        'slide-in-top': 'slide-in-top 0.45s ease-out both',
        'slide-in-right': 'slide-in-right 0.3s ease-out both',
        'slide-out-right': 'slide-out-right 0.3s ease-in both',
        'slide-up': 'slide-up 0.45s ease-out both',
        'red-flash': 'red-flash 0.9s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
        'caret-blink': 'caret-blink 1s steps(1) infinite',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        'danger-flash': 'danger-flash 1s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'scan-line': 'scan-line 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'draw-progress': 'draw-progress 1.2s ease-out forwards',
        'ring-pulse-green': 'ring-pulse-green 1.5s ease-out infinite',
        'ring-pulse-red': 'ring-pulse-red 1.5s ease-out infinite',
        'ring-pulse-amber': 'ring-pulse-amber 1.5s ease-out infinite',
        'ring-pulse-blue': 'ring-pulse-blue 1.5s ease-out infinite',
      },
    },
  },
  plugins: [animate],
};
