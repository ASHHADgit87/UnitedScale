"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function BrandLogo({ className = "h-20 w-auto object-contain" }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-20 w-24 bg-zinc-800/50 rounded animate-pulse" />;
  }

  return (
    <img
      src={resolvedTheme === "light" ? "/logo-light.png" : "/logo-dark.png"}
      alt="United Scale"
      className={className}
    />
  );
}

