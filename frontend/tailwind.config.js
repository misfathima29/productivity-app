/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bright accents
        'electric-red': '#FF4757',
        'vibrant-yellow': '#FFD32A', 
        'bright-blue': '#1B9CFC',
        'emerald-green': '#20BF6B',
        // Dark backgrounds
        'dark-primary': '#0F172A',
        'dark-secondary': '#1E293B',
        'dark-card': '#334155',
        'charcoal': '#1E272E',
        'dark-slategray': '#2C3A47',
        // Glass effects
        'glass-white': 'rgba(255, 255, 255, 0.15)',
        'glass-dark': 'rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      }
    },
  },
  plugins: [],
}