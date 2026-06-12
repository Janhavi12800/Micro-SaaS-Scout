import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        scout: {
          purple: "#8b5cf6",
          blue: "#38bdf8",
          glow: "#7c3aed",
          ink: "#050507",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(124,58,237,0.35)",
        "blue-glow": "0 0 32px rgba(56,189,248,0.28)",
      },
      backgroundImage: {
        "radial-premium":
          "radial-gradient(circle at top left, rgba(124,58,237,0.35), transparent 34%), radial-gradient(circle at top right, rgba(14,165,233,0.26), transparent 30%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
