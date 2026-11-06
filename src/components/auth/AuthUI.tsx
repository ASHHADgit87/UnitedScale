"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface AuthCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-transparent shadow-[0_0_60px_rgba(220,38,38,0.18)] backdrop-blur-xl"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
      <div className="absolute left-3 top-3 h-3 w-3 border-l border-t border-red-500/60" />
      <div className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-red-500/60" />

      <div className="relative flex flex-col gap-6 p-7 sm:p-9">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-red-400">
            {eyebrow}
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
        </div>
        {children}
      </div>

      {footer && (
        <div className="relative border-t border-white/10 bg-black/30 px-7 py-4 sm:px-9">
          {footer}
        </div>
      )}
    </motion.div>
  );
}

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ReactNode;
  trailing?: ReactNode;
}

export function AuthField({
  label,
  icon,
  trailing,
  id,
  ...inputProps
}: AuthFieldProps) {
  const fieldId = id ?? inputProps.name ?? label;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={fieldId}
        className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400"
      >
        {label}
      </label>
      <div className="group relative flex items-center">
        <span className="pointer-events-none absolute left-3.5 flex items-center text-zinc-500 transition-colors group-focus-within:text-red-400">
          {icon}
        </span>
        <input
          id={fieldId}
          {...inputProps}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/70 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
        />
        {trailing && (
          <span className="absolute right-2 flex items-center">{trailing}</span>
        )}
      </div>
    </div>
  );
}

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  tone?: "primary" | "quiet";
}

export function AuthButton({
  loading = false,
  loadingText = "Please wait...",
  tone = "primary",
  children,
  disabled,
  className = "",
  ...rest
}: AuthButtonProps) {
  const base =
    "relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";
  const styles =
    tone === "primary"
      ? "bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-white shadow-[0_0_24px_rgba(220,38,38,0.45)] hover:shadow-[0_0_34px_rgba(239,68,68,0.6)]"
      : "border border-white/15 bg-white/[0.04] text-zinc-200 hover:border-white/30 hover:bg-white/[0.08]";

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`${base} ${styles} ${className}`}
    >
      {loading ? loadingText : children}
    </button>
  );
}

interface AuthAlertProps {
  tone: "error" | "success" | "info";
  children: ReactNode;
}

export function AuthAlert({ tone, children }: AuthAlertProps) {
  const styles = {
    error: "border-red-500/40 bg-red-500/10 text-red-200",
    success: "border-white/20 bg-white/[0.06] text-white",
    info: "border-white/10 bg-white/[0.03] text-zinc-300",
  }[tone];
  const Icon =
    tone === "error" ? AlertCircle : tone === "success" ? CheckCircle2 : Info;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-xs leading-relaxed ${styles}`}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-none text-red-400" />
      <div>{children}</div>
    </div>
  );
}
