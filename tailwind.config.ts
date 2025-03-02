import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {},
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
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
