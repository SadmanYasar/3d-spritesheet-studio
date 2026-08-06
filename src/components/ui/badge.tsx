import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border-2 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-black dark:focus-visible:ring-white",
  {
    variants: {
      variant: {
        default:
          "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white",
        secondary:
          "bg-zinc-200 text-zinc-900 border-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600",
        destructive:
          "bg-red-600 text-white border-black dark:border-red-400",
        outline:
          "bg-transparent text-zinc-900 border-black dark:text-zinc-100 dark:border-zinc-300",
        emerald:
          "bg-amber-400 text-black border-black font-extrabold",
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
