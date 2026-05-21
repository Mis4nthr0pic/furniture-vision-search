/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', "Georgia", "serif"],
        serif: ['"EB Garamond"', "Georgia", "serif"],
        sans: ['"Geist Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        hand: ["Caveat", "cursive"],
      },
      colors: {
        ink: {
          DEFAULT: "#1B1012",
          rise: "#241619",
        },
        burgundy: "#2E1A1D",
        terracotta: {
          DEFAULT: "#C46A4A",
          hover: "#9E3E2B",
        },
        ochre: "#D89B3D",
        sand: "#C9A57A",
        teal: "#5A7B7A",
        plum: "#7A3A48",
        cream: {
          DEFAULT: "#F0E4D0",
          muted: "rgba(240, 228, 208, 0.72)",
        },
        butter: "#E8D5A8",
        paprika: "#9E3E2B",
      },
      boxShadow: {
        polaroid: "8px 10px 0 0 rgba(0,0,0,0.3)",
        cta: "5px 6px 0 0 #D89B3D",
        lift: "6px 6px 0 0 #C46A4A",
      },
      borderRadius: {
        arch: "140px 140px 4px 4px",
        pill: "999px",
      },
      animation: {
        "fade-in": "fadeIn 0.45s ease-out",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
        "spin-slow": "spin 1.2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.85" },
        },
      },
      letterSpacing: {
        kicker: "0.22em",
      },
    },
  },
  plugins: [],
};
