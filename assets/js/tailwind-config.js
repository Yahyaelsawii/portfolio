// Shared Tailwind CDN config (light-mode only)
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: "#1fd5f9",
        "background-light": "#f5f8f8",
        "surface-light": "#ffffff"
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px"
      }
    }
  }
};
