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
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB', // Primary Musafir Blue
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        transit: {
          bus: '#10B981',    // Emerald Green
          metro: '#2563EB',  // Electric Blue
          train: '#8B5CF6',  // Purple
          auto: '#F59E0B',   // Amber
          walk: '#64748B',   // Slate
          pink: '#EC4899',   // Women Safe Pink
          danger: '#EF4444', // Alert Red
        },
        surface: {
          light: '#FFFFFF',
          lightSubtle: '#F8FAFC',
          dark: '#0F172A',
          darkSubtle: '#1E293B',
          darkCard: '#131D31',
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
