import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { demoReport } from "@micro-saas-scout/shared";
import { Download, FileJson, FileText, Sparkles, type LucideIcon } from "lucide-react";
import { formatCurrency } from "../lib/utils";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardTitle } from "../components/ui/card";

const scoreData = Object.entries(demoReport.scores).map(([name, score]) => ({
  name,
  value: score.value,
}));

const exportFormats: Array<[string, LucideIcon]> = [
  ["PDF", Download],
  ["Markdown", FileText],
  ["JSON", FileJson],
  ["Notion", Sparkles],
];

export function ReportsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge>Reports</Badge>
          <h1 className="mt-4 text-4xl font-black text-white">AI opportunity reports</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Export investor-grade teardown reports as PDF, Markdown, JSON, or Notion-style docs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <FileText size={16} /> Markdown
          </Button>
          <Button>
            <Download size={16} /> PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardTitle>{demoReport.title}</CardTitle>
          <CardDescription>{demoReport.executiveSummary}</CardDescription>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#09090b",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 16,
                  }}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[12, 12, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardTitle>Revenue scenario</CardTitle>
          <div className="mt-5 grid gap-3">
            {[
              ["Low", demoReport.revenue.lowMonthly],
              ["Realistic", demoReport.revenue.realisticMonthly],
              ["High", demoReport.revenue.highMonthly],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-zinc-400">{label}</div>
                <div className="mt-1 text-2xl font-bold text-white">{formatCurrency(Number(value))}/mo</div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <CardTitle>Export formats</CardTitle>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {exportFormats.map(([label, Icon]) => (
                <button
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Icon size={18} className="mb-3 text-sky-300" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {demoReport.competitorGaps.map((gap) => (
          <Card key={gap.competitor}>
            <CardTitle>{gap.competitor}</CardTitle>
            <CardDescription>{gap.betterAt}</CardDescription>
            <p className="mt-4 text-sm text-violet-100">{gap.gapToExploit}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
