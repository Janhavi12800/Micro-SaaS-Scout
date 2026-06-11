import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  DollarSign,
  Download,
  Globe2,
  Rocket,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { demoReport, demoSnapshot } from "@micro-saas-scout/shared";
import { analyzeWebsite } from "../lib/api";
import { formatCurrency } from "../lib/utils";
import { MetricCard } from "../components/MetricCard";
import { TypingText } from "../components/TypingText";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardTitle } from "../components/ui/card";
import { ProgressRing } from "../components/ui/progress-ring";

export function HomePage() {
  const [url, setUrl] = useState(demoSnapshot.url);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(demoReport);

  async function runAnalysis() {
    setLoading(true);
    try {
      const result = await analyzeWebsite({
        snapshot: { ...demoSnapshot, url, title: url },
        mode: "hidden-opportunities",
        provider: "openai",
      });
      setReport(result.report);
    } catch {
      setReport({ ...demoReport, url, title: url });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="aurora-border overflow-hidden rounded-[2.5rem] bg-black/45 p-8 backdrop-blur-2xl md:p-12"
        >
          <Badge>
            <Sparkles size={14} className="mr-2" />
            AI startup opportunity scanner
          </Badge>
          <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl">
            Discover SaaS opportunities on any website using AI.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Micro-SaaS Scout turns every website into a startup teardown:
            problems, missing features, competitor gaps, revenue potential,
            tech stack, MVP roadmap, and viral growth ideas.
          </p>
          <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 md:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-2xl bg-black/35 px-4">
              <Globe2 className="text-sky-300" size={18} />
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="h-12 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                placeholder="https://stripe.com"
              />
            </div>
            <Button onClick={runAnalysis} disabled={loading} className="h-12 px-6">
              {loading ? "Scanning..." : "Analyze website"}
              <ArrowRight size={16} />
            </Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["Website AI analysis", "Screenshot intelligence", "Exportable reports"].map(
              (item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-sm font-semibold text-white">{item}</div>
                  <div className="mt-2 text-xs text-zinc-500">Production-ready workflow</div>
                </div>
              ),
            )}
          </div>
        </motion.div>

        <Card className="relative min-h-[560px] overflow-hidden p-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-sky-400/20" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <Badge>Live AI report</Badge>
              <Globe2 className="text-sky-300" />
            </div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm text-zinc-400">
                <Bot size={16} className="text-violet-300" />
                Scout is thinking
              </div>
              <p className="min-h-24 text-lg leading-8 text-white">
                <TypingText text={report.executiveSummary} />
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <ProgressRing
                value={report.scores.marketDemand.value}
                label="Market demand"
                className="rounded-3xl border border-white/10 bg-white/5 p-3"
              />
              <ProgressRing
                value={report.scores.viralPotential.value}
                label="Viral potential"
                className="rounded-3xl border border-white/10 bg-white/5 p-3"
              />
            </div>
            <div className="mt-5 space-y-3">
              {report.saasIdeas.slice(0, 2).map((idea) => (
                <div key={idea.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="font-semibold text-white">{idea.name}</div>
                  <div className="mt-1 text-sm text-zinc-400">{idea.tagline}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard
          icon={Search}
          label="Opportunities"
          value={String(report.opportunities.length)}
          detail="Ranked by buyer pain"
        />
        <MetricCard
          icon={DollarSign}
          label="Realistic MRR"
          value={formatCurrency(report.revenue.realisticMonthly)}
          detail="Assumption-backed"
        />
        <MetricCard icon={Rocket} label="MVP ideas" value="12+" detail="Roadmap-ready" />
        <MetricCard icon={Download} label="Exports" value="4" detail="PDF, MD, JSON, Notion" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            icon: Zap,
            title: "Find Hidden SaaS Opportunities",
            copy: "AI scans product copy, CTAs, forms, reviews, pricing hints, and page structure to reveal underserved workflows.",
          },
          {
            icon: Bot,
            title: "Roast This Startup",
            copy: "A constructive teardown mode for positioning, UX, conversion, pricing, trust, and retention gaps.",
          },
          {
            icon: Sparkles,
            title: "Clone This Business Better",
            copy: "Generate ethical differentiation angles, sharper ICPs, and MVP wedges that incumbents overlook.",
          },
        ].map((feature) => (
          <Card key={feature.title}>
            <feature.icon className="text-sky-300" />
            <CardTitle>{feature.title}</CardTitle>
            <CardDescription>{feature.copy}</CardDescription>
          </Card>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge>Startup pitch</Badge>
            <h2 className="mt-4 text-3xl font-bold text-white">
              From random website to validated SaaS thesis in one click.
            </h2>
            <p className="mt-4 leading-7 text-zinc-400">
              Built for founders, indie hackers, agencies, product consultants,
              and growth teams who want to spot monetizable problems before
              competitors do.
            </p>
            <Button className="mt-6">Join the waitlist</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {["YC-style analysis", "IndieHacker ideas", "SimilarWeb signals"].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="text-xl font-bold text-white">{item}</div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  Packaged into a fast, actionable AI dashboard with exportable reports.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
