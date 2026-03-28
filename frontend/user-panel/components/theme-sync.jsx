"use client";

import { useEffect } from "react";

import { useUiStore } from "@/user/store/uiStore";

export function ThemeSync() {
  const { initializeTheme } = useUiStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return null;
}
