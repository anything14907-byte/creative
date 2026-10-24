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
        // Holographic Aurora Command Center Palette
        hud: {
          bg: '#0A0F24',
          bgLight: '#EEF4FF',
          card: 'rgba(17, 25, 54, 0.75)',
          cardLight: 'rgba(255, 255, 255, 0.90)',
          cardElevated: '#131C3D',
          border: 'rgba(255, 255, 255, 0.10)',
          borderLight: '#E2E8F0',
          cyan: '#00F0FF',
          cyanGlow: 'rgba(0, 240, 255, 0.4)',
          gold: '#FFB800',
          goldGlow: 'rgba(255, 184, 0, 0.4)',
          coral: '#FF3366',
          coralGlow: 'rgba(255, 51, 102, 0.4)',
          emerald: '#00F5A0',
          emeraldGlow: 'rgba(0, 245, 160, 0.4)',
          blue: '#38BDF8',
          text: '#F3F6FA',
          textMuted: '#94A3B8',
          textDark: '#0A0F24',
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 25px -4px rgba(0, 240, 255, 0.4)',
        'neon-emerald': '0 0 25px -4px rgba(0, 245, 160, 0.4)',
        'neon-gold': '0 0 25px -4px rgba(255, 184, 0, 0.4)',
        'neon-coral': '0 0 25px -4px rgba(255, 51, 102, 0.4)',
        'hud-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'hud-glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        'aurora-pulse': 'auroraGlow 12s ease-in-out infinite alternate',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
      },
      keyframes: {
        auroraGlow: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '100%': { transform: 'scale(1.15) rotate(15deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
