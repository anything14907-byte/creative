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
        // LIGHT MODE DESIGN SYSTEM: Warm Soft Eggshell & Oxford Blue
        paper: {
          bg: '#F5F1E8',                   // Base background (soft eggshell / warm beige, never pure white)
          card: '#FBF9F4',                 // Cards, panels, modals, navbar
          cardElevated: '#EDE8DC',         // Hover or selected card
          input: '#E7E3D9',                // Inputs, tags, empty states
          border: 'rgba(9, 34, 64, 0.12)', // Thin border
          borderHover: 'rgba(9, 34, 64, 0.24)',
          ink: '#092240',                  // Headings & titles: Oxford Blue (never pure black)
          body: '#333333',                 // Body text: Jet (>= 4.5:1 contrast)
          muted: '#5B6573',                // Secondary text: captions, dates, hints
          accent: '#3F7D5F',               // Main accent (muted green)
          accentHover: '#356B51',          // Accent hover
          link: '#3B6A94',                 // Links & secondary highlights
          btnBg: '#3F7D5F',                // Buttons background
          btnText: '#F8F6F0',              // Buttons text
          btnHover: '#356B51',             // Buttons hover
        },
        // DARK MODE DESIGN SYSTEM: Deep Navy & Soft Blue
        night: {
          bg: '#0F172A',                   // Base background (deep navy, never pure black)
          card: '#1E293B',                 // Cards, panels, modals, navbar (hierarchy from lightness)
          cardElevated: '#263449',         // Hover or selected card
          input: '#172033',                // Inputs background
          border: 'rgba(255, 255, 255, 0.10)', // Borders and dividers
          borderHover: 'rgba(255, 255, 255, 0.20)',
          text: '#F1F5F9',                 // Primary text: off-white (never pure white)
          body: '#F1F5F9',                 // Body text
          muted: '#94A3B8',                // Secondary text
          accent: '#60A5FA',               // Main accent: soft blue (no neon)
          accentHover: '#93C5FD',
          link: '#60A5FA',                 // Links
          btnBg: '#60A5FA',                // Button background
          btnText: '#0F172A',              // Button dark text for high contrast (8.5:1)
          btnHover: '#93C5FD',             // Slightly brighter hover
          emerald: '#4ADE80',              // Status green (done/strong)
          amber: '#FBBF24',                // Status amber (okay)
          red: '#F87171',                  // Status coral (weak)
          cyan: '#60A5FA',                 // Replaced neon cyan with soft blue
        },
        // Status Palettes (Overriding defaults so all components align with exact tokens)
        emerald: {
          50: 'rgba(63, 125, 95, 0.08)',
          100: 'rgba(63, 125, 95, 0.15)',
          400: 'var(--status-done)',
          500: 'var(--accent-main)',
          600: 'var(--btn-bg)',
          700: 'var(--btn-hover)',
          800: '#2A5540',
        },
        amber: {
          50: 'rgba(184, 137, 47, 0.08)',
          100: 'rgba(184, 137, 47, 0.15)',
          400: 'var(--status-okay)',
          500: 'var(--status-okay)',
          600: 'var(--status-okay)',
          700: '#946B1E',
        },
        rose: {
          50: 'rgba(178, 90, 78, 0.08)',
          100: 'rgba(178, 90, 78, 0.15)',
          400: 'var(--status-weak)',
          500: 'var(--status-weak)',
          600: 'var(--status-weak)',
          700: '#8F3D32',
        },
        red: {
          50: 'rgba(178, 90, 78, 0.08)',
          100: 'rgba(178, 90, 78, 0.15)',
          400: 'var(--status-weak)',
          500: 'var(--status-weak)',
          600: 'var(--status-weak)',
          700: '#8F3D32',
        },
        cyan: {
          50: 'rgba(59, 106, 148, 0.08)',
          100: 'rgba(59, 106, 148, 0.15)',
          400: 'var(--accent-link)',
          500: 'var(--accent-link)',
          600: 'var(--accent-link)',
          700: '#2A4E6E',
        }
      },
      boxShadow: {
        'paper-card': '0 2px 8px rgba(9, 34, 64, 0.04)',
        'night-card': '0 4px 16px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
