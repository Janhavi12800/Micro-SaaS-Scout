import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }}>
      <Card className="relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/20 blur-2xl" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-3 text-3xl font-bold text-white">{value}</p>
            <p className="mt-2 text-sm text-zinc-500">{detail}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sky-200">
            <Icon size={20} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
