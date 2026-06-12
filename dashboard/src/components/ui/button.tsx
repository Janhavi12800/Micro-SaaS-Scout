import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-violet-500 to-sky-400 text-white shadow-glow hover:from-violet-400 hover:to-sky-300",
  secondary:
    "border border-white/10 bg-white/10 text-zinc-100 hover:bg-white/15",
  ghost: "text-zinc-300 hover:bg-white/10 hover:text-white",
  danger: "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25",
};

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
