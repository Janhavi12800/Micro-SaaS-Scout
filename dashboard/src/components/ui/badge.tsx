import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Badge({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-100",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
