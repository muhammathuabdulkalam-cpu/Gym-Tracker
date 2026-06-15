/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Zinc 950
        surface: '#18181b', // Zinc 900
        surfaceHover: '#27272a', // Zinc 800
        primary: '#3b82f6', // Blue 500
        secondary: '#10b981', // Emerald 500
        accent: '#8b5cf6', // Violet 500
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
