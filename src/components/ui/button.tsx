import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-red-500/60 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-snow shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] active:scale-[0.98]",
        cyber:
          "bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-snow shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] active:scale-[0.98]",
        destructive:
          "border border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20",
        outline:
          "border border-white/15 bg-white/[0.04] text-zinc-200 hover:border-white/30 hover:bg-white/[0.08]",
        secondary: "bg-white/[0.08] text-white hover:bg-white/[0.12]",
        ghost: "text-zinc-400 hover:bg-white/5 hover:text-white",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      suppressHydrationWarning
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
