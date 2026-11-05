import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)] hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] active:scale-[0.98]",
        destructive:
          "bg-red-900/80 text-red-200 border border-red-700/50 hover:bg-red-800",
        outline:
          "border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 hover:border-red-600/50 hover:text-red-400 text-zinc-300 backdrop-blur-sm",
        secondary:
          "bg-zinc-900 text-zinc-200 border border-zinc-800 hover:bg-zinc-800/80 hover:text-white",
        ghost:
          "hover:bg-zinc-900/80 hover:text-red-400 text-zinc-400",
        cyber:
          "relative overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white font-semibold uppercase tracking-wider border border-red-500/40 shadow-[0_0_15px_rgba(220,38,38,0.45)] hover:shadow-[0_0_25px_rgba(239,68,68,0.7)] active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        suppressHydrationWarning
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

