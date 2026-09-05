/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'corn-font': ['"Manifold CF"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        corn: ['"Manifold CF"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        alpine: {
          sky: '#4FA3D1',
          sage: '#8FAF82',
          ivory: '#F7F4EA',
          stone: '#D8D4C8',
          charcoal: '#3E4541',
          teal: '#347F8C',
          'teal-dark': '#2A6772',
        },
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        indigo: {
          900: '#1e1b4b',
          950: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};
