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
        bg: {
          DEFAULT: '#0D0B1A',
          surface: '#1A1730',
          terminal: '#0A0814',
        },
        brand: {
          purple: '#7F77DD',
          amber: '#EF9F27',
          danger: '#F09595',
          success: '#1D9E75',
        },
        border: {
          DEFAULT: 'rgba(127,119,221,0.25)',
          strong: 'rgba(127,119,221,0.45)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '12px',
        lg: '10px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(127,119,221,0.35), 0 10px 40px -10px rgba(127,119,221,0.55)',
        'glow-amber': '0 0 0 1px rgba(239,159,39,0.4), 0 10px 40px -10px rgba(239,159,39,0.5)',
        'glow-success': '0 0 0 1px rgba(29,158,117,0.4), 0 10px 30px -10px rgba(29,158,117,0.5)',
        'glow-danger': '0 0 0 1px rgba(240,149,149,0.5), 0 10px 30px -10px rgba(240,149,149,0.5)',
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
        'red-flash': {
          '0%': { boxShadow: '0 0 0 0 rgba(240,149,149,0.8)' },
          '100%': { boxShadow: '0 0 0 20px rgba(240,149,149,0)' },
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
          '0%': { boxShadow: '0 0 0 0 rgba(240,149,149,0.6)' },
          '70%': { boxShadow: '0 0 0 12px rgba(240,149,149,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(240,149,149,0)' },
        },
        'danger-flash': {
          '0%, 100%': { backgroundColor: 'rgba(240,149,149,0.08)' },
          '50%': { backgroundColor: 'rgba(240,149,149,0.28)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
        'slide-in-top': 'slide-in-top 0.45s ease-out both',
        'slide-up': 'slide-up 0.45s ease-out both',
        'red-flash': 'red-flash 0.9s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
        'caret-blink': 'caret-blink 1s steps(1) infinite',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        'danger-flash': 'danger-flash 1s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
};
