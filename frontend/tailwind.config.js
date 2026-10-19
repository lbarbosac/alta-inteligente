// Arquivo: tailwind.config.js
// Tokens do design (ver specs/design.md). Base preto e branco; cor só nas zonas de dor.
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        ink:    '#0A0A0A',
        canvas: '#F5F5F5',
        line: {
          DEFAULT: '#E5E5E5',
          strong:  '#8A8A8A',
        },
      },
    },
  },
  plugins: [],
};
