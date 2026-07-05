// Arquivo: tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          950: '#0F172A',
          900: '#1E293B',
        },
        clinical: {
          green: '#10B981',
          amber: '#F59E0B',
          red:   '#DC2626',
        },
      },
      boxShadow: {
        card:  '0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04)',
        float: '0 4px 24px rgba(15,23,42,.08)',
        input: '0 0 0 3px rgba(15,23,42,.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
};