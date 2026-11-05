import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-red-600 text-white shadow hover:bg-red-700",
        secondary:
          "border-zinc-750 bg-zinc-850 text-zinc-300 hover:bg-zinc-800",
        destructive:
          "border-transparent bg-red-950 text-red-300 border border-red-800/60 shadow-[0_0_8px_rgba(220,38,38,0.2)]",
        outline: "text-zinc-300 border-zinc-700",
        cyber:
          "border-red-600/50 bg-red-950/40 text-red-300 shadow-[0_0_8px_rgba(220,38,38,0.3)]",
        cyberGreen:
          "border-emerald-600/50 bg-emerald-950/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
        cyberAmber:
          "border-amber-600/50 bg-amber-950/40 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

