import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest transition-colors",
  {
    variants: {
      variant: {
        default: "border-red-500 bg-red-600 text-snow",
        destructive: "border-red-500 bg-red-600 text-snow",
        secondary: "border-white/10 bg-white/[0.05] text-zinc-400",
        outline: "border-white/20 text-zinc-300",
        cyber: "border-red-500/40 bg-red-500/10 text-red-300",
        success: "border-white/25 bg-white/[0.08] text-white",
        warning: "border-red-500/50 bg-transparent text-red-300",
        cyberGreen: "border-white/25 bg-white/[0.08] text-white",
        cyberAmber: "border-red-500/50 bg-transparent text-red-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
