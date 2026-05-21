/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        emphasis: ['"Newsreader"', "Georgia", "serif"],
      },
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        panelDeep: "rgb(var(--panel-deep) / <alpha-value>)",
        panelInk: "rgb(var(--panel-ink) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          deep: "rgb(var(--accent-deep) / <alpha-value>)",
        },
        signal: "rgb(var(--signal) / <alpha-value>)",
        warn: "rgb(var(--warn) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        hair: "rgb(var(--hair) / <alpha-value>)",
        hairStrong: "rgb(var(--hair-strong) / <alpha-value>)",
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
