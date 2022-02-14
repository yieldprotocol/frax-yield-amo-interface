const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    fontFamily: { sans: ['Inter', 'sans-serif'], serif: ['Inter', 'sans-serif'] },
    colors: {
      gray: colors.zinc,
      green: colors.emerald,
      primary: colors.teal,
      secondary: colors.teal,
    },
  },
  plugins: [],
};
