import { cn } from "../../lib/utils";

export function ProgressRing({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <svg width="104" height="104" viewBox="0 0 104 104" className="-rotate-90">
        <circle
          cx="52"
          cy="52"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="52"
          cy="52"
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0" x2="1">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-zinc-400">{label}</div>
      </div>
    </div>
  );
}
