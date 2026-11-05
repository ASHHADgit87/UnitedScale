"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      suppressHydrationWarning
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-700/50 bg-zinc-900/50 text-xs font-medium text-zinc-300 hover:border-red-600 hover:text-zinc-100 transition-all duration-200"
      title="Change Theme"
    >
      {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
      <span className="hidden sm:inline">Change Theme</span>
    </button>
  );
}

