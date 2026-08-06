import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer rounded-md uppercase tracking-wider",
  {
    variants: {
      variant: {
        default:
          "bg-black text-white hover:bg-zinc-800 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] dark:bg-white dark:text-black dark:border-white dark:hover:bg-zinc-200 dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 border-2 border-black dark:border-red-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)]",
        outline:
          "bg-white text-zinc-900 border-2 border-black hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:bg-black dark:text-zinc-100 dark:border-zinc-300 dark:hover:bg-zinc-900 dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]",
        secondary:
          "bg-zinc-200 text-zinc-900 border-2 border-zinc-900 hover:bg-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
        ghost:
          "text-zinc-700 hover:text-black hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900",
        link:
          "text-black dark:text-white underline-offset-4 hover:underline p-0 h-auto normal-case font-semibold",
        glow:
          "bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-300 dark:bg-amber-400 dark:text-black dark:border-black dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-10 px-5 text-sm",
        icon: "h-9 w-9 p-0",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
