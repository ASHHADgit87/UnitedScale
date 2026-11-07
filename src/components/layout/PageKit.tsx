import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <section className="relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-transparent p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
      <div className="relative flex flex-col gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-red-400">
          {eyebrow}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">{description}</p>
      </div>
      {actions && (
        <div className="relative flex flex-wrap gap-3">{actions}</div>
      )}
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  accent?: boolean;
}

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  accent = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative flex min-w-[220px] flex-1 flex-col gap-3 overflow-hidden rounded-2xl border p-5 backdrop-blur-xl",
        accent
          ? "border-red-500/40 bg-gradient-to-br from-red-600/20 via-red-600/5 to-transparent shadow-[0_0_40px_rgba(220,38,38,0.2)]"
          : "border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent",
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-400">
          {label}
        </span>
        <Icon className="h-4 w-4 text-red-400" />
      </div>
      <span className="text-2xl font-semibold tabular-nums text-white">
        {value}
      </span>
      <span className="text-xs text-zinc-500">{note}</span>
    </div>
  );
}

interface PanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Panel({
  title,
  subtitle,
  action,
  className,
  children,
}: PanelProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
        <Icon className="h-5 w-5 text-red-400" />
      </span>
      <span className="text-sm font-semibold text-white">{title}</span>
      <span className="max-w-sm text-xs text-zinc-500">{description}</span>
      {action}
    </div>
  );
}

interface NoticeProps {
  tone: "error" | "success" | "info";
  children: ReactNode;
}

export function Notice({ tone, children }: NoticeProps) {
  const styles = {
    error: "border-red-500/40 bg-red-500/10 text-red-200",
    success: "border-white/20 bg-white/[0.06] text-white",
    info: "border-white/10 bg-white/[0.03] text-zinc-300",
  }[tone];
  const Icon =
    tone === "error" ? AlertCircle : tone === "success" ? CheckCircle2 : Info;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-xs leading-relaxed",
        styles,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-none text-red-400" />
      <div>{children}</div>
    </div>
  );
}

interface FilterLinkProps {
  href: string;
  active: boolean;
  children: ReactNode;
}

export function FilterLink({ href, active, children }: FilterLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-red-500/60 bg-red-500/10 text-red-300"
          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}

interface PaginationProps {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}

export function Pagination({ page, pageCount, hrefFor }: PaginationProps) {
  if (pageCount <= 1) return null;

  const base =
    "flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-zinc-300 transition-colors";

  return (
    <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-xs text-zinc-500">
      <span>
        Page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1)}
            className={cn(base, "hover:border-white/30 hover:text-white")}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Link>
        ) : (
          <span className={cn(base, "opacity-40")}>
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </span>
        )}
        {page < pageCount ? (
          <Link
            href={hrefFor(page + 1)}
            className={cn(base, "hover:border-white/30 hover:text-white")}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className={cn(base, "opacity-40")}>
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
