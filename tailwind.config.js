/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './public/app.js'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        display: ['Archivo', '"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  corePlugins: { preflight: true },
  plugins: [],
};
