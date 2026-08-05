/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#fe2c55',
        secondary: '#ff6b81',
      }
    },
  },
  plugins: [],
}
