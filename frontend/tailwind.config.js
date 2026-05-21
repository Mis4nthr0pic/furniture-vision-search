/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      colors: {
        brand: {
          50: "#f7f5f2",
          100: "#ebe6de",
          200: "#d6cbb9",
          500: "#8b6914",
          600: "#735610",
          700: "#5c4410",
          800: "#4a3812",
          900: "#3d2f12",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f7f5f2",
          border: "#e8e2d9",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(61, 47, 18, 0.06), 0 8px 24px rgba(61, 47, 18, 0.06)",
        lift: "0 12px 40px rgba(61, 47, 18, 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
    },
  },
  plugins: [],
};
