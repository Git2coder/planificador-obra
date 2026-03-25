/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  
  theme: {
    extend: {
      colors: {
        highlight: "#f59e0b"
      }
    }
  }
}

