(() => {
  const STORAGE_KEY = "theme"; // "dark" | "light"
  const root = document.documentElement;

  function setTheme(mode) {
    const isDark = mode === "dark";
    root.classList.toggle("dark", isDark);
    localStorage.setItem(STORAGE_KEY, mode);

    // Update icon if it exists
    const icon = document.getElementById("themeIcon");
    if (icon) icon.textContent = isDark ? "light_mode" : "dark_mode";
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;

    // First visit: follow system preference
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  }

  // Apply theme ASAP
  setTheme(getPreferredTheme());

  // Wire up button
  window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const current = root.classList.contains("dark") ? "dark" : "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  });
})();
