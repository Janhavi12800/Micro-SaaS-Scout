import { Check, Crown, Sparkles } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardTitle } from "../components/ui/card";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Validate whether Micro-SaaS Scout fits your founder workflow.",
    features: ["5 analyses/month", "Demo AI data", "Basic reports", "Save 3 ideas"],
    cta: "Start scouting",
  },
  {
    name: "Pro",
    price: "$29",
    description: "Unlimited scans, exports, deep gaps, and roadmap generation.",
    features: [
      "Unlimited scans",
      "PDF/Markdown/JSON/Notion exports",
      "Deep competitor analysis",
      "AI roadmap generation",
      "Screenshot intelligence",
      "Priority provider routing",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    name: "Studio",
    price: "$99",
    description: "For agencies and startup studios generating client-ready reports.",
    features: ["Team seats", "White-label reports", "Client workspaces", "API access", "Stripe invoices"],
    cta: "Contact sales",
  },
];

export function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="text-center">
        <Badge>Pricing</Badge>
        <h1 className="mt-4 text-5xl font-black text-white">Scout more markets. Build better bets.</h1>
        <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
          Free for lightweight exploration. Pro unlocks the complete AI founder dashboard.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlighted ? "aurora-border bg-violet-500/10" : undefined}
          >
            <div className="flex items-center justify-between">
              <CardTitle>{plan.name}</CardTitle>
              {plan.highlighted ? <Crown className="text-amber-300" /> : <Sparkles className="text-sky-300" />}
            </div>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-6">
              <span className="text-5xl font-black text-white">{plan.price}</span>
              <span className="text-zinc-500"> / month</span>
            </div>
            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check size={16} className="text-sky-300" />
                  {feature}
                </div>
              ))}
            </div>
            <Button className="mt-8 w-full" variant={plan.highlighted ? "primary" : "secondary"}>
              {plan.cta}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
