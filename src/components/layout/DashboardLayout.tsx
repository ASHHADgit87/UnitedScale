"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SessionGuard } from "@/components/auth/SessionGuard";
import type { SessionUser } from "@/lib/permissions";

interface DashboardLayoutProps {
  user: SessionUser;
  pendingCount: number;
  children: ReactNode;
}

export function DashboardLayout({
  user,
  pendingCount,
  children,
}: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="cyber-grid relative flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="cyber-ambient-glow pointer-events-none absolute inset-x-0 top-0 h-96" />

      <Sidebar
        user={user}
        pendingCount={pendingCount}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="relative z-10 flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <Header user={user} onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <SessionGuard role={user.role} />
    </div>
  );
}

export default DashboardLayout;
