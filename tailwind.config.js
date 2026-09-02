/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED', // Primary Royal Violet
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        transit: {
          bus: '#10B981',    // Emerald Green
          metro: '#6366F1',  // Indigo Metro
          train: '#8B5CF6',  // Violet Purple
          auto: '#F59E0B',   // Warm Amber
          walk: '#94A3B8',   // Slate
          pink: '#EC4899',   // Women Safe Pink
          danger: '#EF4444', // Alert Red
        },
        surface: {
          light: '#FFFFFF',
          lightSubtle: '#F8FAFC',
          dark: '#0B1120',       // Deep Navy/Slate
          darkSubtle: '#0F172A', // Slate 900
          darkCard: '#1E293B',   // Slate 800
          darkElevated: '#334155', // Slate 700
          darkBorder: '#334155', // Slate 700
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'floating': '0 20px 35px -10px rgba(0, 0, 0, 0.15)',
        'pill': '0 4px 12px rgba(37, 99, 235, 0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
