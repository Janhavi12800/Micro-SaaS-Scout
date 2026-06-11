import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./*.html"],
  theme: {
    extend: {
      colors: {
        scout: {
          purple: "#8b5cf6",
          blue: "#38bdf8",
          ink: "#050507",
        },
      },
      boxShadow: {
        glow: "0 0 34px rgba(124,58,237,0.32)",
      },
    },
  },
  plugins: [],
};

export default config;
