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
  ],
}
