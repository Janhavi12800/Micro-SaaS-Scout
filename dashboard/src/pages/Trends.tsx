import { Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { demoReport } from "@micro-saas-scout/shared";
import { Badge } from "../components/ui/badge";
import { Card, CardDescription, CardTitle } from "../components/ui/card";

const trendData = [
  { month: "Jan", demand: 42 },
  { month: "Feb", demand: 48 },
  { month: "Mar", demand: 55 },
  { month: "Apr", demand: 61 },
  { month: "May", demand: 72 },
  { month: "Jun", demand: 81 },
];

const radar = Object.entries(demoReport.scores).map(([metric, score]) => ({
  metric,
  score: score.value,
}));

export function TrendsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <Badge>Trend Analysis</Badge>
        <h1 className="mt-4 text-4xl font-black text-white">Market timing and opportunity heat</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Score competition, difficulty, scalability, viral potential, and market demand before you build.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Demand trajectory</CardTitle>
          <CardDescription>Demo signal based on AI trend assumptions and buyer urgency.</CardDescription>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Tooltip
                  contentStyle={{
                    background: "#09090b",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 16,
                  }}
                />
                <Line type="monotone" dataKey="demand" stroke="#38bdf8" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardTitle>Opportunity radar</CardTitle>
          <CardDescription>Balanced view of market and execution risk.</CardDescription>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="metric" stroke="#a1a1aa" fontSize={12} />
                <Radar dataKey="score" fill="#8b5cf6" fillOpacity={0.45} stroke="#38bdf8" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(demoReport.scores).map(([key, score]) => (
          <Card key={key}>
            <div className="text-3xl font-black text-white">{score.value}</div>
            <div className="mt-2 text-sm font-semibold capitalize text-sky-200">{key}</div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">{score.explanation}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
