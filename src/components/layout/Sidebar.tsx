"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  ArrowLeftRight,
  ShoppingCart,
  PackagePlus,
  Award,
  BarChart3,
  Lock,
  Boxes,
  Radio,
  Cpu,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/BrandLogo";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isLocked?: boolean;
  subItems?: { title: string; href: string; icon: React.ElementType }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    href: "/inventory/layers",
    icon: Boxes,
    subItems: [
      {
        title: "FIFO Layers",
        href: "/inventory/layers",
        icon: Layers,
      },
      {
        title: "Stock Movements",
        href: "/inventory/movements",
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    title: "Sales (Deduction)",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    title: "Purchasing (Inflow)",
    href: "/purchasing",
    icon: PackagePlus,
  },
  {
    title: "Warehouse Transfer",
    href: "/transfers",
    icon: ArrowLeftRight,
  },
  {
    title: "Calibration",
    href: "/calibration",
    icon: Award,
    isLocked: true,
    badge: "PHASE 3",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isRouteActive = (href: string, subItems?: { href: string }[]) => {
    if (pathname === href) return true;
    if (subItems?.some((sub) => pathname.startsWith(sub.href))) return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <aside className="w-72 shrink-0 border-r border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md flex flex-col h-screen select-none relative z-30">
     
      <div className="p-5 border-b border-zinc-800/80 flex items-center gap-3">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-full bg-red-600/30 blur-sm group-hover:bg-red-600/50 transition-all duration-300" />
          <BrandLogo className="relative w-20 h-20 object-contain rounded-full border border-red-600/50 bg-zinc-900" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-base text-zinc-100 uppercase">
              United Scale
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-red-950 text-red-400 border border-red-800/80 rounded">
              v1.0
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 truncate">
            Mashriq Centre, Karachi
          </span>
        </div>
      </div>

     
      <div className="px-4 py-2.5 mx-3 mt-3 bg-zinc-900/60 border border-zinc-850 rounded-md flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="text-zinc-400 text-[10px] tracking-wider uppercase">
            RS-232 BUS: <span className="text-emerald-400">READY</span>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
          <Cpu className="w-3 h-3 text-red-500" />
          <span>FIFO ACID</span>
        </div>
      </div>

      
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
          Core Operations
        </div>

        {navItems.map((item) => {
          const active = isRouteActive(item.href, item.subItems);
          const Icon = item.icon;

          if (item.isLocked) {
            return (
              <div
                key={item.title}
                className={cn(
                  "group relative flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-all text-zinc-400 cursor-not-allowed bg-zinc-900/30 border border-zinc-850/60"
                )}
                title="Phase 3: Sindh Calibration Certificate Engine (Locked)"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-zinc-400" />
                  <span className="font-mono text-xs">{item.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                    {item.badge}
                  </span>
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>
            );
          }

          return (
            <div key={item.title} className="space-y-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group",
                  active
                    ? "border-l-4 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] bg-red-950/20 text-red-200"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-l-4 border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      active ? "text-red-500" : "text-zinc-400 group-hover:text-zinc-300"
                    )}
                  />
                  <span>{item.title}</span>
                </div>

                {item.subItems && (
                  <ChevronRight
                    className={cn(
                      "w-3.5 h-3.5 text-zinc-400 transition-transform",
                      active && "rotate-90 text-red-400"
                    )}
                  />
                )}
              </Link>

              
              {item.subItems && active && (
                <div className="pl-7 pr-1 space-y-1 py-1 border-l border-zinc-800/80 ml-4">
                  {item.subItems.map((sub) => {
                    const subActive = pathname === sub.href;
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.title}
                        href={sub.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-1.5 rounded text-xs font-mono transition-colors",
                          subActive
                            ? "text-red-400 bg-red-950/40 border border-red-800/40 shadow-[0_0_8px_rgba(220,38,38,0.2)]"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                        )}
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        <span>{sub.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/90 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase text-zinc-400">
            Active Hub
          </span>
          <span className="flex items-center gap-1 text-[10px] font-mono text-red-400">
            <Radio className="w-3 h-3 text-red-500 animate-pulse" />
            ONLINE
          </span>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2.5 space-y-1">
          <div className="font-semibold text-zinc-200 text-xs flex items-center justify-between">
            <span>Mashriq Centre HQ</span>
            <span className="text-[9px] font-mono bg-red-950/80 text-red-400 px-1 py-0.2 rounded border border-red-800/50">
              HQ
            </span>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">
            Linked Godown: Gulshan Godown
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Govt Sindh Compliant</span>
          </div>
          <span>PKR / FIFO</span>
        </div>
      </div>
    </aside>
  );
}

