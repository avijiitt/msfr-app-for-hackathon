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
        // Official Musafir Color Palette Specification
        musafir: {
          primary: '#0F766E',       // buttons, links, highlights
          primaryDark: '#115E59',   // hover, active states
          accent: '#F59E0B',        // important actions, icons, highlights
          bg: '#F8FAF9',            // app background, sections
          card: '#FFFFFF',          // cards, containers, modals
          textMain: '#1F2937',      // headings, primary text
          textSecondary: '#64748B', // descriptions, labels, placeholders
          success: '#16A34A',       // success, available
          warning: '#EA8A00',       // caution, alerts
          error: '#DC2626',         // emergency, danger / SOS
          lightGrey: '#E5E7EB',     // dividers, borders
          grey: '#94A3B8',          // icons, disabled
          darkGrey: '#475569',      // inactive text
        },
        primary: {
          DEFAULT: '#0F766E',
          dark: '#115E59',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0F766E', // Primary Teal
          700: '#115E59', // Primary Dark
          800: '#134E4A',
          900: '#042F2E',
          950: '#021F1E',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dark: '#EA8A00',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Accent
          600: '#EA8A00', // Warning
          700: '#D97706',
          800: '#B45309',
          900: '#78350F',
        },
        brand: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0F766E', // Primary Teal
          700: '#115E59', // Primary Dark
          800: '#134E4A',
          900: '#042F2E',
        },
        // Blue mapped to Primary Teal so existing action buttons, links, active states adopt the palette
        blue: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0F766E', // Primary Teal (#0F766E)
          700: '#115E59', // Primary Dark hover (#115E59)
          800: '#134E4A',
          900: '#042F2E',
          950: '#021F1E',
        },
        transit: {
          bus: '#0F766E',    // Teal (from palette)
          metro: '#115E59',  // Primary Dark
          train: '#F59E0B',  // Accent Amber
          auto: '#EA8A00',   // Warning
          walk: '#94A3B8',   // Slate Grey
          pink: '#EC4899',   // Women Safe Pink
          danger: '#DC2626', // Alert Red / SOS
        },
        surface: {
          light: '#FFFFFF',
          lightSubtle: '#F8FAF9',
          dark: '#0A1514',       // Deep Dark Slate-Teal
          darkSubtle: '#0F1F1E', // Dark surface
          darkCard: '#132827',   // Dark card
          darkElevated: '#1A3635', // Dark elevated
          darkBorder: '#234442', // Dark border
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
