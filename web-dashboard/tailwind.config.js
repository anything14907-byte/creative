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
        cyber: {
          bg: '#06090E',
          card: 'rgba(15, 23, 34, 0.85)',
          cardElevated: '#111927',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(0, 229, 153, 0.4)',
          text: '#F3F6FA',
          muted: '#8B9BB4',
          emerald: '#00E599',
          emeraldHover: '#00C782',
          cyan: '#38BDF8',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
        day: {
          bg: '#F3F6FA',
          card: '#FFFFFF',
          cardElevated: '#F8FAFC',
          border: '#E2E8F0',
          borderHover: '#059669',
          text: '#090D16',
          muted: '#475569',
          emerald: '#059669',
          emeraldHover: '#047857',
          cyan: '#0284C7',
          amber: '#D97706',
          rose: '#E11D48',
        }
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -4px rgba(0, 229, 153, 0.35)',
        'glow-cyan': '0 0 25px -4px rgba(56, 189, 248, 0.35)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.6)',
        'card-light': '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
