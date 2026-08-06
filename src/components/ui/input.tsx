import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border-2 border-black bg-white dark:bg-zinc-950 dark:border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 transition-colors file:border-0 file:bg-transparent file:text-xs file:font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 hover:border-zinc-800 dark:hover:border-zinc-500 font-mono",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
