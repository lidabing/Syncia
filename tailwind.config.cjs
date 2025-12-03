const { theme } = require('./theme')
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  prefix: 'cdx-',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: theme,
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
    function ({ addUtilities }) {
      addUtilities({
        '.animate-shimmer': {
          'animation': 'shimmer 2s infinite linear',
        },
      })
    },
    function ({ addBase }) {
      addBase({
        '@keyframes shimmer': {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
      })
    },
  ],
}
