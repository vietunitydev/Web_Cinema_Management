/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E50914',
          dark: '#B81D24',
          light: '#F40612',
        },
        secondary: {
          DEFAULT: '#221F1F',
          dark: '#000000',
          light: '#2A2A2A',
        },
        accent: {
          DEFAULT: '#F5F5F1',
          dark: '#E5E5E5',
          light: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}