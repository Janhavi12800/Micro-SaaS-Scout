export function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="mt-1 text-[11px] capitalize text-zinc-500">{label}</div>
      <div className="mt-2 h-1.5 rounded-full bg-white/10">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-sky-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
