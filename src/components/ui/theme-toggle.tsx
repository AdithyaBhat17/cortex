"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md p-2 text-muted-foreground transition-colors duration-150 hover:text-foreground hover:bg-surface-hover"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? (
        <SunIcon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <MoonIcon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
