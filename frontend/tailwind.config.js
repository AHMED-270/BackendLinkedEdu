/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#14274E', // Updated to match "Link" logo exact dark blue
          teal: '#40A1D8', // Updated to match "Edu" logo exact light blue
          blue: '#2D9CDB',
          light: '#F8FAFC',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.65)',
          dark: 'rgba(31, 41, 55, 0.65)',
          border: 'rgba(255, 255, 255, 0.2)',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(20, 39, 78, 0.05)',
        'glass-sm': '0 4px 16px 0 rgba(20, 39, 78, 0.04)',
        'glass-premium': '0 12px 48px 0 rgba(20, 39, 78, 0.06)',
        'glass-inset': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.6)',
        'premium': '0 10px 40px -10px rgba(64, 161, 216, 0.15)',
        'glow': '0 0 20px rgba(64, 161, 216, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '12px',
        'glass-md': '16px',
        'glass-lg': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'scale-up': 'scaleUp 0.2s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(45, 156, 219, 0.4)' },
          '50%': { opacity: '.7', boxShadow: '0 0 10px rgba(45, 156, 219, 0.2)' },
        },
      },
    },
  },
  plugins: [],
}
