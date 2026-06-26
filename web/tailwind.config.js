/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Consensus-status palette (consistent across the UI).
        consensus: {
          mainstream: '#475569',     // slate
          minority: '#d97706',       // amber
          fringe: '#ea580c',         // orange
          historical: '#7c3aed',     // muted purple
          speculative: '#94a3b8',    // light gray
        },
      },
    },
  },
  plugins: [],
}
