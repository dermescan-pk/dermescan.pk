export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "dermescan_theme";

export function loadSavedTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

export function applyThemeToDocument(theme: ThemeMode): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute(
      "content",
      theme === "dark" ? "#140E10" : "#F7F0F1"
    );
  }
}

export function saveTheme(theme: ThemeMode): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  }
  applyThemeToDocument(theme);
}
