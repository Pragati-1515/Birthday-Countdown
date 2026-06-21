/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        themeBg: '#FFF5F7',
        themePink: '#F8C8DC',
        themeLavender: '#DCC6FF',
        themeRose: '#FF9EB5',
        themeText: '#4A3A4A',
        themeCard: '#FFFFFF',
      },
      fontFamily: {
        handwritten: ['"Caveat"', '"Playpen Sans"', 'cursive'],
        sans: ['"Outfit"', '"Inter"', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 15s ease-in-out infinite',
        'petal-fall': 'fall 16s linear infinite',
        'heart-fall': 'heartFall 14s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)', opacity: '0.2' },
          '50%': { transform: 'translateY(-100px) rotate(10deg)', opacity: '0.4' },
        },
        fall: {
          '0%': { transform: 'translateY(-10vh) translateX(0) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(110vh) translateX(100px) rotate(360deg)', opacity: '0' },
        },
        heartFall: {
          '0%': { transform: 'translateY(-10vh) translateX(0) rotate(0deg) scale(0.8)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(110vh) translateX(-60px) rotate(-180deg) scale(1.1)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
