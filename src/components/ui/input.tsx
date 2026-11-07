import * as React from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/70 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)] disabled:cursor-not-allowed disabled:opacity-50";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      suppressHydrationWarning
      className={cn(control, "h-11", className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    suppressHydrationWarning
    className={cn(
      control,
      "h-11 [&>option]:bg-zinc-900 [&>option]:text-white",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    suppressHydrationWarning
    className={cn(control, "min-h-[88px] resize-y py-2.5", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

interface FieldProps {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, hint, className, children }: FieldProps) {
  return (
    <label
      className={cn("flex min-w-[200px] flex-1 flex-col gap-2", className)}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </span>
      {children}
      {hint && <span className="text-[11px] text-zinc-500">{hint}</span>}
    </label>
  );
}

export { Input, Select, Textarea, Field };
