/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#09090b',   // zinc-950
        secondary: '#52525b', // zinc-500
        accent: '#f4f4f5',    // zinc-100
      }
    },
  },
  plugins: [],
}
