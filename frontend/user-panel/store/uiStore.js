import { create } from "zustand";

const STORAGE_KEY = "theme";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

function normalizeTheme(theme) {
  if (typeof window === "undefined") {
    return theme === "dark" ? "dark" : "light";
  }

  if (theme === "light" || theme === "dark") {
    return theme;
  }

  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? "dark" : "light";
}

function applyTheme(theme) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTheme = normalizeTheme(theme);
  const root = document.documentElement;
  root.setAttribute("data-theme", resolvedTheme);
  root.style.colorScheme = resolvedTheme;
  root.style.backgroundColor = resolvedTheme === "dark" ? "rgb(18 20 27)" : "rgb(246 244 237)";
}

function getStoredTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return normalizeTheme(localStorage.getItem(STORAGE_KEY) || "light");
}

export const useUiStore = create((set) => ({
  theme: getStoredTheme(),
  initializeTheme: () => {
    const theme = getStoredTheme();
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, theme);
    }
    applyTheme(theme);
    set({ theme });
  },
  setTheme: (theme) => {
    const normalizedTheme = normalizeTheme(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, normalizedTheme);
    }

    applyTheme(normalizedTheme);
    set({ theme: normalizedTheme });
  },
}));
