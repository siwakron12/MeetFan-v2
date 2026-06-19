import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-prompt)", "system-ui", "sans-serif"],
        thai: ["var(--font-prompt)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0f172a",
        paper: "#f8fafc",
        accent: "#0ea5e9"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(14, 165, 233, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;