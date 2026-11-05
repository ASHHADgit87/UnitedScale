"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 cyber-grid relative">

      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 cyber-ambient-glow z-0" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

