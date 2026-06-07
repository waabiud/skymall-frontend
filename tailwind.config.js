module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   '#E91E8C',
        'primary-dark': '#C4177A',
        'primary-light': '#F06AB5',
        secondary: '#FF6B35',
        accent:    '#FFC107',
        danger:    '#F44336',
        dark:      '#0A0A0A',
        'sky-gray': '#F5F5F5',
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
