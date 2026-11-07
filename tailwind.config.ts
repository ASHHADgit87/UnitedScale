import type { Config } from "tailwindcss";

const channel = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        industrial: {
          950: "#09090b",
          900: "#121215",
          850: "#18181d",
          800: "#22222a",
          700: "#2f303a",
        },
        crimson: {
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        white: channel("c-white"),
        snow: "#ffffff",
        zinc: {
          50: channel("zinc-50"),
          100: channel("zinc-100"),
          200: channel("zinc-200"),
          300: channel("zinc-300"),
          400: channel("zinc-400"),
          500: channel("zinc-500"),
          600: channel("zinc-600"),
          700: channel("zinc-700"),
          800: channel("zinc-800"),
          900: channel("zinc-900"),
          950: channel("zinc-950"),
        },
        red: {
          200: channel("red-200"),
          300: channel("red-300"),
          400: channel("red-400"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "glow-red":
          "0 0 15px rgba(220, 38, 38, 0.4), 0 0 30px rgba(185, 28, 28, 0.2)",
        "glow-red-sm": "0 0 8px rgba(220, 38, 38, 0.5)",
        "glow-red-lg":
          "0 0 25px rgba(220, 38, 38, 0.6), 0 0 50px rgba(153, 27, 27, 0.3)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
