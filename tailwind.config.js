/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   '#0070F3',
        secondary: '#00B4A6',
        accent:    '#F5A623',
        danger:    '#F25C54',
        dark:      '#0A0A0A',
      },
      fontFamily: {
        sans:    ['DM Sans', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
