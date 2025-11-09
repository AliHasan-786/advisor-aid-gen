import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef3fb",
          100: "#d4e0f3",
          200: "#a8c0e5",
          300: "#7ba0d7",
          400: "#4f81c9",
          500: "#2c66b3",
          600: "#1e4f8e",
          700: "#163c6b",
          800: "#0f2948",
          900: "#071428"
        },
        success: "#1AAE6F",
        warning: "#FDB022",
        danger: "#F04438"
      },
      boxShadow: {
        card: "0 14px 40px -18px rgba(22, 60, 107, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
