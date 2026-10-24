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
        // Eye-Comfort Light Mode ("Warm Paper & Deep Ink")
        paper: {
          bg: '#F2EFE9',         // Warm Alabaster/Paper (NEVER pure blinding white)
          card: '#FFFFFF',       // Crisp Ivory White
          cardElevated: '#FAF8F5',
          border: '#CBD5E1',     // Solid visible border
          borderHover: '#94A3B8',
          ink: '#0F172A',        // Deep Charcoal Ink for headings
          body: '#1E293B',       // Dark Slate body text
          muted: '#475569',      // Muted Slate secondary labels
        },
        // Sleek Futuristic Night Mode ("Deep Ocean & Emerald Gold")
        night: {
          bg: '#0B131E',         // Deep Midnight Teal-Slate
          card: '#131F2E',       // Elevated Slate Surface
          cardElevated: '#18273A',
          border: '#23354D',     // Crisp dark border
          borderHover: '#3B82F6',
          text: '#F8FAFC',       // Crisp Off-White
          muted: '#CBD5E1',      // Soft Silver
          emerald: '#10B981',    // Cyber Emerald
          cyan: '#06B6D4',       // Ocean Cyan
          amber: '#F59E0B',      // Solar Amber
          red: '#EF4444',        // Urgent Crimson
        }
      },
      boxShadow: {
        'paper-card': '0 4px 12px rgba(15, 23, 42, 0.06)',
        'night-card': '0 8px 24px rgba(0, 0, 0, 0.35)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'glow-red': '0 0 20px -3px rgba(239, 68, 68, 0.4)',
      }
    },
  },
  plugins: [],
}
