// Standardized Tailwind CDN config for all pages
// NOTE: Replace YOUR_DOMAIN_HERE with your actual domain (e.g., https://yahya.design)
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1fd5f9",
        "background-light": "#f5f8f8",
        "background-dark": "#0f1f23",
        "surface-light": "#ffffff",
        "surface-dark": "#162a30",
        "text-main": "#0d1a1c",
        "text-muted": "#47909e",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        full: "9999px",
      },
    },
  },
};
