/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SoundMirror brand colors
        'sm-bg': {
          DEFAULT: '#020617',
          paper: '#0F172A',
          subtle: '#1E293B',
        },
        'sm-primary': '#38BDF8',
        'sm-accent': '#22D3EE',
        'sm-success': '#4ADE80',
        'sm-warning': '#FBBF24',
        'sm-error': '#FB7185',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'breathe': 'breathe 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(56, 189, 248, 0.5)' },
        },
      },
    },
  },
  plugins: [],
};
