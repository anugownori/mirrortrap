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
          DEFAULT: '#0a0a0a',
          surface: '#111111',
          terminal: '#050505',
          card: '#0f0f0f',
        },
        brand: {
          red: '#ff0040',
          cyan: '#00f0ff',
          purple: '#7F77DD',
          amber: '#EF9F27',
          danger: '#ff0040',
          success: '#00ff6a',
          green: '#00ff6a',
        },
        border: {
          DEFAULT: 'rgba(255,0,64,0.2)',
          strong: 'rgba(255,0,64,0.4)',
          cyan: 'rgba(0,240,255,0.25)',
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
        glow: '0 0 0 1px rgba(255,0,64,0.3), 0 10px 40px -10px rgba(255,0,64,0.4)',
        'glow-cyan': '0 0 0 1px rgba(0,240,255,0.3), 0 10px 40px -10px rgba(0,240,255,0.4)',
        'glow-amber': '0 0 0 1px rgba(239,159,39,0.4), 0 10px 40px -10px rgba(239,159,39,0.5)',
        'glow-success': '0 0 0 1px rgba(0,255,106,0.4), 0 10px 30px -10px rgba(0,255,106,0.4)',
        'glow-danger': '0 0 0 1px rgba(255,0,64,0.5), 0 10px 30px -10px rgba(255,0,64,0.5)',
        'glow-red': '0 0 20px rgba(255,0,64,0.6), 0 0 60px rgba(255,0,64,0.3)',
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
          '0%': { boxShadow: '0 0 0 0 rgba(255,0,64,0.8)' },
          '100%': { boxShadow: '0 0 0 20px rgba(255,0,64,0)' },
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
          '0%': { boxShadow: '0 0 0 0 rgba(255,0,64,0.6)' },
          '70%': { boxShadow: '0 0 0 12px rgba(255,0,64,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,0,64,0)' },
        },
        'danger-flash': {
          '0%, 100%': { backgroundColor: 'rgba(255,0,64,0.08)' },
          '50%': { backgroundColor: 'rgba(255,0,64,0.28)' },
        },
        'scan-line': {
          '0%': { top: '-2px' },
          '100%': { top: '100%' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'typing': {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        'border-pulse': {
          '0%, 100%': { borderColor: 'rgba(255,0,64,0.2)' },
          '50%': { borderColor: 'rgba(255,0,64,0.6)' },
        },
        'matrix-fall': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
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
        'scan-line': 'scan-line 2s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'border-pulse': 'border-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
};
