/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './public/app.js'],
  darkMode: 'class',
  theme: { extend: { fontFamily: { sans: ['"Google Sans"', 'Roboto', 'system-ui', 'sans-serif'] } } },
  corePlugins: { preflight: true },
  plugins: [],
};
