import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-dark': '#0a0e1a',
        'cyber-darker': '#050810',
        'cyber-blue': '#00d9ff',
        'cyber-green': '#00ff88',
        'cyber-red': '#ff0055',
        'cyber-purple': '#a855f7',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
