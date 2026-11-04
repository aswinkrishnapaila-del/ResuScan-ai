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
        // Primary brand — indigo (flat, no gradient needed)
        primary: {
          DEFAULT: '#6366f1',
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Surface / background tokens
        surface: {
          DEFAULT: '#0f172a',
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#1e293b',
          800: '#111827',
          900: '#0f172a',
          950: '#050a12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.35s ease-out forwards',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'spin-slow':  'spin 1s linear infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
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
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
      },
      boxShadow: {
        'card':     '0 1px 4px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-md':  '0 4px 16px 0 rgba(0,0,0,0.08), 0 2px 6px -2px rgba(0,0,0,0.06)',
        'card-lg':  '0 8px 32px 0 rgba(0,0,0,0.10), 0 4px 12px -4px rgba(0,0,0,0.08)',
        'card-dark':'0 4px 24px -4px rgba(0,0,0,0.5)',
        // Kept for backwards compat but simplified
        'glow':     '0 0 0 3px rgba(99,102,241,0.25)',
        'glow-sm':  '0 0 0 2px rgba(99,102,241,0.20)',
      },
    },
  },
  plugins: [],
}

