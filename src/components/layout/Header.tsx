"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/format";
import { ROLE_LABELS, type SessionUser } from "@/lib/permissions";

interface HeaderProps {
  user: SessionUser;
  onMenuClick: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [now, setNow] = useState<Date | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await createClient().auth.signOut();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  const time = now?.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Karachi",
  });
  const date = now?.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Karachi",
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 flex-none items-center justify-between gap-4 border-b border-white/10 bg-zinc-950/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-2 text-xs text-zinc-400 sm:flex">
          <MapPin className="h-3.5 w-3.5 text-red-500" />
          <span>Mashriq Centre, Karachi</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden flex-col items-end md:flex">
          <span className="text-sm font-semibold tabular-nums text-white">
            {time ?? "--:--:--"}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {date ?? ""}
          </span>
        </div>

        <div className="flex items-center gap-3 border-l border-white/10 pl-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-900 text-xs font-semibold text-white shadow-[0_0_14px_rgba(220,38,38,0.4)]">
            {getInitials(user.name)}
          </span>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-medium leading-tight text-white">
              {user.name}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-red-400">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <button
            type="button"
            aria-label="Sign out"
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-lg border border-transparent p-2 text-zinc-400 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
