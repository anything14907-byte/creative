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
        // DAY THEME: "Sunlit Architectural Stone & Tactile Ceramic Studio"
        paper: {
          bg: '#E6E1D6',                   // Warm Architectural Sandstone canvas
          card: '#FFFEFC',                 // Ceramic-Ivory top block
          cardElevated: '#F7F3EA',         // Elevated ceramic surface
          well: '#EAE4D7',                 // Recessed Warm-Stone Well
          input: '#EAE4D7',                // Engraved bezel input
          border: '#CFC8B8',               // Architectural stone border (1px solid #CFC8B8)
          borderHover: '#B8B09F',
          borderWell: '#D5CEBF',
          ink: '#141413',                  // Deep Espresso Obsidian (razor-sharp text)
          body: '#141413',                 // High-contrast primary text
          secondary: '#4A4740',            // Warm Charcoal Slate
          muted: '#6E6A61',                // Muted Deep Stone
          accent: '#059669',               // Chronometer Jade
          accentHover: '#047857',
          link: '#0284C7',                 // Links
          btnBg: '#059669',                // Primary button
          btnText: '#FFFFFF',
          btnHover: '#047857',
          champagne: '#C9972E',            // Champagne Gold highlight
          jade: '#059669',
        },
        // NIGHT THEME: "Smoked Titanium & Champagne Chronometer"
        night: {
          bg: '#080A0E',                   // Deep Carbon Onyx
          card: '#151A22',                 // Brushed Titanium block
          cardElevated: '#1C222B',         // Elevated titanium surface
          well: '#06080B',                 // Recessed instrument well
          input: '#06080B',                // Sunken instrument input
          border: 'rgba(255, 255, 255, 0.09)', // Subtle specular border
          borderHover: 'rgba(255, 255, 255, 0.18)',
          borderWell: 'rgba(255, 255, 255, 0.05)',
          text: '#F5F7FA',                 // Crisp Titanium White typography
          body: '#CBD5E1',                 // Brushed Silver typography
          secondary: '#9BA3B0',            // Brushed Silver secondary
          muted: '#9BA3B0',                // Secondary captions/hints
          accent: '#10B981',               // Chronometer Jade
          accentHover: '#34D399',
          link: '#38BDF8',                 // Soft blue link
          btnBg: '#10B981',
          btnText: '#080A0E',
          btnHover: '#34D399',
          emerald: '#10B981',              // Status Jade
          amber: '#E5C158',                // Champagne Gold
          red: '#F87171',                  // Status Coral / Crimson
          cyan: '#38BDF8',
          champagne: '#E5C158',            // Warm Champagne Gold
          jade: '#10B981',                 // Chronometer Jade
        },
        // Status Palettes (Aligned with hardware tokens - ZERO purple)
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
          50: 'rgba(229, 193, 88, 0.08)',
          100: 'rgba(229, 193, 88, 0.15)',
          400: '#FBBF24',
          500: '#E5C158',
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
        'paper-card': 'inset 0 2px 0 0 #FFFFFF, 0 10px 24px -6px rgba(28, 25, 23, 0.12), 0 2px 6px -1px rgba(28, 25, 23, 0.07)',
        'paper-card-hover': 'inset 0 2px 0 0 #FFFFFF, 0 16px 32px -8px rgba(28, 25, 23, 0.18), 0 4px 10px -2px rgba(28, 25, 23, 0.10)',
        'paper-well': 'inset 0 2px 5px rgba(28, 25, 23, 0.09), 0 1px 0 #FFFFFF',
        'night-card': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.16), inset 0 0 20px rgba(255, 255, 255, 0.02), 0 14px 32px -8px rgba(0, 0, 0, 0.75)',
        'night-card-hover': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.28), inset 0 0 24px rgba(229, 193, 88, 0.04), 0 20px 40px -10px rgba(0, 0, 0, 0.85)',
        'night-well': 'inset 0 3px 7px rgba(0, 0, 0, 0.85), 0 1px 0 rgba(255, 255, 255, 0.06)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.35)',
        'glow-champagne': '0 0 20px rgba(229, 193, 88, 0.35)',
        'glow-crimson': '0 0 20px rgba(248, 113, 113, 0.45)',
        'hardware-btn': 'inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 3px 0 rgba(0, 0, 0, 0.22), 0 5px 10px rgba(0, 0, 0, 0.12)',
        'hardware-btn-night': 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 3px 0 rgba(0, 0, 0, 0.45), 0 6px 14px rgba(0, 0, 0, 0.35)',
      }
    },
  },
  corePlugins: {
    container: false,
  },
  plugins: [],
}
