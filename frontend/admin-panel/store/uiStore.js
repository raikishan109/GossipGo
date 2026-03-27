import { create } from "zustand";

const STORAGE_KEY = "theme";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

function resolveTheme(theme) {
  if (typeof window === "undefined") {
    return theme === "dark" ? "dark" : "light";
  }

  if (theme === "system") {
    return window.matchMedia(SYSTEM_THEME_QUERY).matches ? "dark" : "light";
  }

  return theme === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTheme = resolveTheme(theme);
  const root = document.documentElement;
  root.setAttribute("data-theme", resolvedTheme);
  root.style.colorScheme = resolvedTheme;
  root.style.backgroundColor = resolvedTheme === "dark" ? "rgb(18 20 27)" : "rgb(246 244 237)";
}

function getStoredTheme() {
  if (typeof window === "undefined") {
    return "system";
  }

  return localStorage.getItem(STORAGE_KEY) || "system";
}

export const useUiStore = create((set) => ({
  theme: getStoredTheme(),
  initializeTheme: () => {
    const theme = getStoredTheme();
    applyTheme(theme);
    set({ theme });
  },
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, theme);
    }

    applyTheme(theme);
    set({ theme });
  },
}));
