/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bbva: {
          navy:  '#003087',
          dark:  '#00205B',
          blue:  '#1857BF',
          sky:   '#009BDE',
          light: '#C3D1EE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
