"use client";

import { useEffect } from "react";

import { useUiStore } from "@/user/store/uiStore";

export function ThemeSync() {
  const { theme, initializeTheme } = useUiStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => initializeTheme();

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, initializeTheme]);

  return null;
}
