import type { Config } from "tailwindcss";
import daisyui from "daisyui";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

// TailwindCSS Configuration
const config: Config = {
  darkMode: ["class"], // Enable dark mode via class
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./src/**/*.{html,js,ts,jsx,tsx,mdx}", // Adding additional file extensions
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-out': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-out': 'slide-out 0.3s ease-out',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'neo': '5px 5px 10px #d1d1d1, -5px -5px 10px #ffffff',
      },
      backdropBlur: {
        'glass': 'blur(10px)',
      },
    },
  },
  plugins: [tailwindcssAnimate, daisyui, typography],
  daisyui: {
    themes: [
      // Light Theme
      {
        light: {
          primary: "#B4004E", // Matches the pinkish-red in the UI
          "primary-content": "#FFFFFF", // White text for primary elements
          secondary: "#231F20", // Dark gray for secondary sections
          "secondary-content": "#FFFFFF",
          accent: "#D5AA68", // Golden shade for accents
          "accent-content": "#1A1A1A", 
          neutral: "#4A4A4A", // Neutral background (dark gray)
          "neutral-content": "#FFFFFF", 
          "base-100": "#FFFFFF", // Page background (white)
          "base-200": "#F3F3F3", // Slightly off-white for subtle sections
          "base-300": "#EAEAEA",
          "base-content": "#1F1F1F", // Almost black text
          info: "#88C0D0", // Light blue for info elements
          "info-content": "#003344",
          success: "#A3BE8C", // Light green for success
          "success-content": "#002A00",
          warning: "#EBCB8B", // Light yellow for warnings
          "warning-content": "#3A3A00",
          error: "#BF616A", // Soft red for errors
          "error-content": "#3D0000",
        },
      },
      // Dark Theme
      {
        dark: {
          primary: "#FFD700", // Bright yellow for highlights (matches the logo)
          "primary-content": "#1E1E1E", // Dark text for yellow buttons
          secondary: "#9146FF", // Vibrant purple for links or secondary buttons
          "secondary-content": "#FFFFFF", // White text for purple elements
          accent: "#FF6B6B", // Coral red for active or hover states
          "accent-content": "#1E1E1E", // Dark text on accent backgrounds
          neutral: "#242424", // Deep gray for navbar and containers
          "neutral-content": "#EAEAEA", // Light text for readability
          "base-100": "#121212", // Dark black for the main background
          "base-content": "#F8F9FA", // Off-white text for readability
          info: "#4FC3F7", // Bright blue for informational highlights
          success: "#4CAF50", // Green for positive actions
          warning: "#FFA726", // Orange for warnings
          error: "#E57373", // Red for errors
        },
      },
    ],
    darkTheme: "dark", // Enable dark mode theme
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
};

export default config;
