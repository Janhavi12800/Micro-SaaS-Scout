import { Sparkles } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-400 shadow-glow">
        <Sparkles size={18} />
      </div>
      <div>
        <div className="text-sm font-bold text-white">Micro-SaaS Scout</div>
        <div className="text-[11px] text-zinc-500">AI opportunity scanner</div>
      </div>
    </div>
  );
}
