import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1012",
        paper: "#F6F6F8",
        graphite: "#1A1B1F",
        mist: "#E4E4E9",
        signal: {
          DEFAULT: "#C9A227",
          soft: "#E4C766",
        },
        focus: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          soft: "rgb(var(--accent) / 0.6)",
        },
        border: {
          light: "#E4E4E9",
          dark: "#2A2B30",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -8px rgb(0 0 0 / 0.10)",
        "soft-lg": "0 4px 8px rgb(0 0 0 / 0.04), 0 24px 48px -12px rgb(0 0 0 / 0.20)",
        glass: "0 8px 32px rgb(0 0 0 / 0.16)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "dialog-in": {
          "0%": { opacity: "0", transform: "scale(0.96) translateY(4px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "dialog-in": "dialog-in 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in": "fade-in 0.18s ease-out",
        "slide-up": "slide-up 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
