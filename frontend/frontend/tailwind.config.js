/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6F4E37', // your brand color
        secondary: '#F5F5F5',
        accent: '#E0A96D',
      },
      boxShadow: {
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}
