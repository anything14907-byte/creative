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
        // DAY THEME: "Solar Orbit Day" (Clean, high contrast, daylight atmosphere)
        paper: {
          bg: '#F4F8FF',                   // Bright stratosphere sky
          card: 'rgba(255, 255, 255, 0.90)', // Frosted white spacecraft ceramic
          cardElevated: 'rgba(240, 246, 255, 0.95)',
          well: '#EDF3FA',                 // Sunken control bay
          input: '#EDF3FA',                // Precision engraved bezel input
          border: '#CBD5E1',               // Crisp sky-slate border
          borderHover: '#94A3B8',
          borderWell: '#CBD5E1',
          ink: '#0F172A',                  // Deep Navy Ink (ultra-sharp contrast >= 10:1)
          body: '#0F172A',                 // Crisp primary body text
          secondary: '#334155',            // Slate secondary
          muted: '#64748B',                // Muted slate
          accent: '#0284C7',               // Orbital Sky Blue
          accentHover: '#0369A1',
          link: '#0284C7',                 // Links
          btnBg: '#059669',                // Primary button emerald
          btnText: '#FFFFFF',
          btnHover: '#047857',
          champagne: '#D97706',            // Solar Gold highlight
          jade: '#059669',
        },
        // NIGHT THEME: "Deep Cosmos Night" (Deep space nebula & spacecraft hull)
        night: {
          bg: '#070B19',                   // Deep space void
          card: 'rgba(13, 20, 38, 0.82)',  // Translucent dark spacecraft hull
          cardElevated: 'rgba(18, 28, 54, 0.88)',
          well: 'rgba(6, 10, 20, 0.88)',   // Sunken instrument bay
          input: 'rgba(6, 10, 20, 0.88)',
          border: 'rgba(56, 189, 248, 0.22)', // Glowing cyan orbital ring
          borderHover: 'rgba(56, 189, 248, 0.45)',
          borderWell: 'rgba(56, 189, 248, 0.15)',
          text: '#F8FAFC',                 // Star white typography
          body: '#CBD5E1',                 // Cosmic silver typography
          secondary: '#94A3B8',            // Stardust silver
          muted: '#94A3B8',                // Secondary captions/hints
          accent: '#38BDF8',               // Cosmic cyan
          accentHover: '#7DD3FC',
          link: '#38BDF8',
          btnBg: '#10B981',
          btnText: '#070B19',
          btnHover: '#34D399',
          emerald: '#10B981',              // Terra Jade
          amber: '#F59E0B',                // Solar Gold
          red: '#F87171',                  // Mars Crimson
          cyan: '#38BDF8',                 // Nebula Cyan
          champagne: '#F59E0B',
          jade: '#10B981',
        },
        // Status Palettes (ZERO purple)
        emerald: {
          50: 'rgba(16, 185, 129, 0.08)',
          100: 'rgba(16, 185, 129, 0.15)',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
        },
        amber: {
          50: 'rgba(245, 158, 11, 0.08)',
          100: 'rgba(245, 158, 11, 0.15)',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        rose: {
          50: 'rgba(248, 113, 113, 0.08)',
          100: 'rgba(248, 113, 113, 0.15)',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        red: {
          50: 'rgba(248, 113, 113, 0.08)',
          100: 'rgba(248, 113, 113, 0.15)',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        cyan: {
          50: 'rgba(56, 189, 248, 0.08)',
          100: 'rgba(56, 189, 248, 0.15)',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        }
      },
      boxShadow: {
        'paper-card': 'inset 0 1px 0 #FFFFFF, 0 10px 26px -6px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'paper-card-hover': 'inset 0 1px 0 #FFFFFF, 0 16px 34px -8px rgba(15, 23, 42, 0.14), 0 4px 10px -2px rgba(15, 23, 42, 0.06)',
        'paper-well': 'inset 0 2px 5px rgba(15, 23, 42, 0.06), 0 1px 0 #FFFFFF',
        'night-card': 'inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 14px 34px -8px rgba(0, 0, 0, 0.75), 0 0 16px rgba(56, 189, 248, 0.08)',
        'night-card-hover': 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 20px 42px -10px rgba(0, 0, 0, 0.85), 0 0 24px rgba(56, 189, 248, 0.16)',
        'night-well': 'inset 0 3px 8px rgba(0, 0, 0, 0.90), 0 1px 0 rgba(56, 189, 248, 0.10)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.40)',
        'glow-cyan': '0 0 22px rgba(56, 189, 248, 0.45)',
        'glow-solar': '0 0 22px rgba(245, 158, 11, 0.45)',
        'glow-crimson': '0 0 22px rgba(248, 113, 113, 0.50)',
        'hardware-btn': 'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 3px 0 rgba(0, 0, 0, 0.20), 0 5px 12px rgba(0, 0, 0, 0.10)',
        'hardware-btn-night': 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 3px 0 rgba(0, 0, 0, 0.45), 0 6px 14px rgba(0, 0, 0, 0.35)',
      }
    },
  },
  corePlugins: {
    container: false,
  },
  plugins: [],
}
