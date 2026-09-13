import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          coral: "#FF5A3C",
          "coral-hover": "#E54527",
          "coral-light": "#FFF3F0",
          navy: "#0A1128",
          deep: "#050814",
          surface: "#101935",
          border: "#1E2B4D",
          gold: "#F59E0B",
          teal: "#0D9488",
          emerald: "#10B981"
        },
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(1deg)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        }
      },
      boxShadow: {
        "glow-coral": "0 0 25px rgba(255, 90, 60, 0.4)",
        "glow-gold": "0 0 25px rgba(245, 158, 11, 0.35)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};
export default config;
