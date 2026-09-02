/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6c63ff',
          50:  '#f0effe',
          100: '#e4e1fd',
          200: '#cdc7fb',
          300: '#aba0f8',
          400: '#8672f2',
          500: '#6c63ff',
          600: '#5b4de8',
          700: '#4d3dd4',
          800: '#3f33ac',
          900: '#352e88',
        },
        surface: {
          DEFAULT: '#0f172a',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#1e293b',
          800: '#111827',
          900: '#0f172a',
          950: '#070c18',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'spin-slow': 'spin 1s linear infinite',
        'pulse-ring': 'pulseRing 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.9', transform: 'scale(1.03)' },
        },
      },
      boxShadow: {
        'glow':      '0 0 24px rgba(108,99,255,0.35)',
        'glow-sm':   '0 0 12px rgba(108,99,255,0.25)',
        'card':      '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
        'card-dark': '0 4px 24px -4px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
