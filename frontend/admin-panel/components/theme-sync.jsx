"use client";

import { useEffect } from "react";

import { useUiStore } from "@/admin/store/uiStore";

export function ThemeSync() {
  const { initializeTheme } = useUiStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return null;
}
