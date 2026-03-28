"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { useUiStore } from "@/user/store/uiStore";

export function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useUiStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={clsx(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-surface",
        compact && "h-9 w-9 justify-self-start sm:h-10 sm:w-10"
      )}>
        <Sun size={16} />
      </div>
    );
  }

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
  ];

  return (
    <div className={clsx(
      "inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--border))] bg-surface/50 p-1 backdrop-blur-md transition-all hover:border-brand/30 hover:bg-surface/80",
      compact ? "w-fit justify-self-start gap-1 p-0.5" : "p-1"
    )}>
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={`Switch to ${label} theme`}
          className={clsx(
            "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 sm:h-9 sm:w-9",
            theme === value
              ? "bg-brand text-white shadow-lg shadow-brand/20 scale-105"
              : "text-muted hover:bg-surface/80 hover:text-text",
            compact && "h-7 w-7 sm:h-8 sm:w-8"
          )}
        >
          <Icon size={compact ? 14 : 16} strokeWidth={2.5} />
        </button>
      ))}
    </div>
  );
}
