/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2f7", 100: "#d6e0ec", 200: "#aec1d8",
          300: "#7e9bbe", 400: "#4f72a0", 500: "#345a89",
          600: "#26466e", 700: "#1d3858", 800: "#142841", 900: "#0c1c30",
        },
        teal: {
          50: "#e6f6f1", 100: "#bce6da", 200: "#8fd6c1",
          300: "#5cc3a6", 400: "#2faa89", 500: "#15916f",
          600: "#0e7458", 700: "#0a5b46", 800: "#074336", 900: "#042c24",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
