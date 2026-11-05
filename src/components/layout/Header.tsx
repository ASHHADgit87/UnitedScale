"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Warehouse as WarehouseIcon,
  Activity,
  Terminal,
  Clock,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { createClient } from "@/lib/supabase/client";

export function Header() {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-PK", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Karachi",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || null);
          const role = user.user_metadata?.role || "ADMIN";
          setUserRole(role);
        }
      } catch (err) {
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-300">
          <WarehouseIcon className="w-4 h-4 text-red-500" />
          <span className="text-zinc-400">ZONE:</span>
          <span className="text-zinc-100 font-bold">MASHRIQ CENTRE HQ</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400 border-l border-zinc-850 pl-4">
          <Terminal className="w-3.5 h-3.5 text-red-400" />
          <span>
            FIFO-COGS: <strong className="text-red-400">ACTIVE</strong>
          </span>
        </div>
      </div>


      <div className="flex items-center gap-4">

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-zinc-900/60 border border-zinc-850 text-xs font-mono text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-red-500" />
          <span>PKT:</span>
          <span className="text-red-400 font-bold tracking-wider">
            {time || "13:00:00"}
          </span>
        </div>

        <ThemeToggle />

        <Badge
          variant="cyber"
          className="hidden lg:flex items-center gap-1.5 py-1"
        >
          <Activity className="w-3 h-3 text-red-400" />
          <span>SINDH W&M VERIFIED</span>
        </Badge>


        <div className="flex items-center gap-3 pl-3 border-l border-zinc-850">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-red-700 to-zinc-900 border border-red-600/40 flex items-center justify-center text-xs font-mono font-bold text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]">
            {userEmail ? userEmail.slice(0, 2).toUpperCase() : "US"}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-medium text-zinc-200 leading-tight">
              {userEmail ? userEmail.split("@")[0] : "Admin Officer"}
            </span>
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider">
              {userRole}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="p-1.5 ml-2 rounded hover:bg-red-950/60 text-zinc-400 hover:text-red-400 border border-transparent hover:border-red-800/40 transition-colors"
            title="Sign Out / Disconnect Terminal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
