import { Sparkles } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-400 shadow-glow">
        <div className="absolute inset-1 rounded-xl bg-black/20" />
        <Sparkles className="relative h-5 w-5 text-white" />
      </div>
      {!compact && (
        <div>
          <div className="text-base font-bold tracking-tight text-white">Micro-SaaS Scout</div>
          <div className="text-xs text-zinc-500">Discover SaaS opportunities using AI</div>
        </div>
      )}
    </div>
  );
}
