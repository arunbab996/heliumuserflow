/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        helium: {
          dark:   '#004449',   // Helium primary dark teal
          mid:    '#0D9488',   // Helium accent teal
          light:  '#E6F4F4',   // Helium light teal
          cream:  '#F5F5F0',   // Helium background
          ink:    '#0f1f1f',   // Near-black for headings
        },
      },
      fontFamily: {
        sans:    ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'diamond-pattern': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M24 0L48 24L24 48L0 24Z' fill='none' stroke='%23dedad4' stroke-width='0.9'/%3E%3Ccircle cx='24' cy='0' r='1.5' fill='%23d4cfc8'/%3E%3Ccircle cx='48' cy='24' r='1.5' fill='%23d4cfc8'/%3E%3Ccircle cx='24' cy='48' r='1.5' fill='%23d4cfc8'/%3E%3Ccircle cx='0' cy='24' r='1.5' fill='%23d4cfc8'/%3E%3C/svg%3E")`,
      },
    },
  },
  plugins: [],
}
