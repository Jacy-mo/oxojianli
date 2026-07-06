import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1d1f1d",
        paper: "#faf9f6",
        line: "#e6e4df",
        accent: "#0f9f9a"
      },
      boxShadow: {
        soft: "0 16px 45px rgba(31, 31, 28, 0.08)"
      }
    }
  },
  plugins: []
}

export default config
