import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "furniture.theme";

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

/** Reads stored theme (default dark) and applies it before React renders. */
export function bootstrapTheme(): Theme {
  const stored = readStoredTheme();
  const theme: Theme = stored ?? "dark";
  applyThemeClass(theme);
  return theme;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? "dark");

  useEffect(() => {
    applyThemeClass(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return {
    theme,
    toggle: () => setTheme((current) => (current === "light" ? "dark" : "light")),
    setTheme,
  };
}
