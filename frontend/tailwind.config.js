/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00eaff',
        'neon-purple': '#7a00ff',
        'dark-bg': '#0a0a0a',
        'dark-card': '#1a1a1a',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 10px #00eaff, 0 0 20px #00eaff',
        'neon-purple': '0 0 10px #7a00ff, 0 0 20px #7a00ff',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
