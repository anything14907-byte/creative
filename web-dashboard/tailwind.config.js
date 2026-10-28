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
        // LIGHT MODE DESIGN SYSTEM: Warm Alabaster (#F3F0E8) & Deep Charcoal Ink (#0F172A)
        paper: {
          bg: '#F3F0E8',                   // Warm Alabaster/Paper page background
          card: '#FFFFFF',                 // Crisp white cards
          cardElevated: '#F8F7F2',         // Subtle elevated surface
          input: '#FFFFFF',                // Inputs, tags
          border: '#CBD5E1',               // Clear slate borders (1px solid #CBD5E1)
          borderHover: '#94A3B8',
          ink: '#0F172A',                  // Deep Charcoal Ink text for titles, numbers, countdowns
          body: '#1E293B',                 // Body text (high contrast)
          muted: '#475569',                // Secondary text: captions, dates, hints
          accent: '#059669',               // Emerald
          accentHover: '#047857',          // Accent hover
          link: '#0284C7',                 // Links
          btnBg: '#059669',                // Buttons background
          btnText: '#FFFFFF',              // Buttons text
          btnHover: '#047857',             // Buttons hover
        },
        // DARK MODE DESIGN SYSTEM: Deep Midnight Slate (#0B131E) & Elevated (#131F2E)
        night: {
          bg: '#0B131E',                   // Deep Midnight Slate
          card: '#131F2E',                 // Dark elevated cards
          cardElevated: '#1C2D42',         // Hover or selected card
          input: '#0E1825',                // Inputs background
          border: '#23354D',               // Subtle slate border (1px solid #23354D)
          borderHover: '#374E6F',
          text: '#F8FAFC',                 // Crisp white typography
          body: '#CBD5E1',                 // Silver typography
          muted: '#94A3B8',                // Secondary text
          accent: '#10B981',               // Main accent
          accentHover: '#34D399',
          link: '#38BDF8',                 // Links
          btnBg: '#10B981',                // Button background
          btnText: '#0B131E',              // Button dark text
          btnHover: '#34D399',             // Hover
          emerald: '#34D399',              // Status green (done/strong)
          amber: '#FBBF24',                // Status amber (okay)
          red: '#F87171',                  // Status coral (weak)
          cyan: '#38BDF8',                 // Soft blue
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
  corePlugins: {
    container: false,
  },
  plugins: [],
}
