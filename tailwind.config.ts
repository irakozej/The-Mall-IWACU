import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#1B4332",
          deep: "#0F2A1F",
          soft: "#2D5A45",
          mist: "#3D6B55",
        },
        gold: {
          DEFAULT: "#D4A017",
          soft: "#E8B945",
          deep: "#A07D10",
          pale: "#F0DCA0",
        },
        cream: {
          DEFAULT: "#FAF9F6",
          warm: "#F4F1EA",
          deep: "#EDE8DC",
        },
        ink: {
          DEFAULT: "#2D2D2D",
          soft: "#4A4A4A",
          mute: "#7A7A7A",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.25em",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,42,31,0.04), 0 8px 24px rgba(15,42,31,0.06)",
        lift: "0 10px 40px -10px rgba(15,42,31,0.25)",
        gold: "0 0 0 1px rgba(212,160,23,0.4), 0 8px 28px -10px rgba(212,160,23,0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(.95)", opacity: "0.8" },
          "80%, 100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(.2,.7,.2,1) both",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(.2,.7,.2,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
