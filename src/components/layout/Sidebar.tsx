"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Award,
  BarChart3,
  Layers,
  LayoutDashboard,
  PackagePlus,
  ShoppingCart,
  Truck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { getInitials } from "@/lib/format";
import {
  ROLE_LABELS,
  canAccessPath,
  type SessionUser,
} from "@/lib/permissions";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  soon?: boolean;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Inventory",
    items: [
      { title: "Stock Batches", href: "/inventory/layers", icon: Layers },
      {
        title: "Stock Movements",
        href: "/inventory/movements",
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Sales", href: "/sales", icon: ShoppingCart },
      { title: "Purchasing", href: "/purchasing", icon: PackagePlus },
      { title: "Transfers", href: "/transfers", icon: Truck },
      { title: "Calibration", href: "/calibration", icon: Award },
    ],
  },
  {
    label: "Insights",
    items: [{ title: "Reports", href: "/reports", icon: BarChart3 }],
  },
  {
    label: "Administration",
    items: [{ title: "Team Access", href: "/admin/users", icon: Users }],
  },
];

interface SidebarProps {
  user: SessionUser;
  pendingCount: number;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ user, pendingCount, open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccessPath(user.role, item.href)),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/70 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-none flex-col border-r border-white/10 bg-zinc-950/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
          <BrandLogo className="h-12 w-auto object-contain" />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <span className="px-3 pb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-600">
                {group.label}
              </span>

              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const badge =
                  item.href === "/admin/users" && pendingCount > 0
                    ? pendingCount
                    : null;

                if (item.soon) {
                  return (
                    <div
                      key={item.href}
                      className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-600"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {item.title}
                      </span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-zinc-500">
                        Soon
                      </span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all",
                      active
                        ? "bg-gradient-to-r from-red-600/25 via-red-600/5 to-transparent font-medium text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {active && (
                      <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
                    )}
                    <span className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          active ? "text-red-400" : "text-zinc-500",
                        )}
                      />
                      {item.title}
                    </span>
                    {badge !== null && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-snow shadow-[0_0_10px_rgba(220,38,38,0.7)]">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-900 text-xs font-semibold text-snow shadow-[0_0_14px_rgba(220,38,38,0.4)]">
              {getInitials(user.name)}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-white">
                {user.name}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-red-400">
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
