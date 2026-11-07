"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

const FALLBACK_MS = 450;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const handleToggle = () => {
    const next = isDark ? "light" : "dark";
    const root = document.documentElement;
    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => unknown;
    };
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      setTheme(next);
      return;
    }

    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(() => {
        root.classList.toggle("dark", next === "dark");
        root.style.colorScheme = next;
        setTheme(next);
      });
      return;
    }

    root.classList.add("theme-switching");
    setTheme(next);
    window.setTimeout(
      () => root.classList.remove("theme-switching"),
      FALLBACK_MS,
    );
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      suppressHydrationWarning
      onClick={handleToggle}
      className="relative flex h-9 w-[68px] flex-none items-center rounded-full border border-white/15 bg-white/[0.05] p-1 outline-none transition-colors hover:border-red-500/60 focus-visible:ring-2 focus-visible:ring-red-500/60"
    >
      <Sun className="absolute left-2.5 h-4 w-4 text-zinc-500" />
      <Moon className="absolute right-2.5 h-4 w-4 text-zinc-500" />
      <span className="relative z-10 flex h-7 w-7 translate-x-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 text-snow shadow-[0_0_14px_rgba(220,38,38,0.55)] transition-transform duration-300 ease-out dark:translate-x-[30px]">
        <Sun className="h-4 w-4 dark:hidden" />
        <Moon className="hidden h-4 w-4 dark:block" />
      </span>
    </button>
  );
}
