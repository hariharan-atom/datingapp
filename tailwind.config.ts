import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF4D6D",
          hover: "#FF2F59",
          soft: "#FFF0F3",
        },
        secondary: "#7C5CFC",
        accent: "#FFB703",
        surface: "#FAFAFA",
        border: "#ECECEC",
        ink: "#111827",
        muted: "#6B7280",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
        button: "18px",
        input: "18px",
        sheet: "32px",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(17, 24, 39, 0.07)",
        float: "0 18px 48px rgba(17, 24, 39, 0.14)",
        glow: "0 10px 35px rgba(255, 77, 109, 0.35)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s infinite",
        ripple: "ripple 600ms linear",
      },
    },
  },
  plugins: [],
};

export default config;
