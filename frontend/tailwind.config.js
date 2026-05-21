/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        emphasis: ['"Newsreader"', "Georgia", "serif"],
      },
      colors: {
        bg: "#FAFAF7",
        panel: "#F2F1EC",
        panelDeep: "#E8E6DD",
        ink: {
          DEFAULT: "#101113",
          soft: "#3A3D42",
          muted: "#7A7D82",
        },
        accent: {
          DEFAULT: "#FF5B22",
          deep: "#C9421A",
        },
        signal: "#1F8A5B",
        warn: "#C7A030",
        danger: "#B83A2E",
        hair: "#D4D2C8",
        hairStrong: "#A8A69A",
      },
      fontSize: {
        ui: ["13px", { lineHeight: "1.45" }],
        kicker: ["10px", { lineHeight: "1.4", letterSpacing: "0.22em" }],
      },
      borderRadius: {
        instrument: "4px",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out",
        shimmer: "shimmer 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
