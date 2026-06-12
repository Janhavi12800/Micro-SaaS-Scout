import { demoReport } from "@micro-saas-scout/shared";
import { Brain, Globe, Sparkles } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardTitle } from "../components/ui/card";

export function IdeasPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <Badge>Saved Ideas</Badge>
        <h1 className="mt-4 text-4xl font-black text-white">Startup concepts worth revisiting</h1>
        <p className="mt-2 text-zinc-400">
          Save reports, bookmark ideas, and convert the best ones into build plans.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {demoReport.saasIdeas.map((idea) => (
          <Card key={idea.name} className="relative overflow-hidden">
            <div className="absolute right-4 top-4 rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
              Difficulty {idea.difficulty}/100
            </div>
            <Sparkles className="text-sky-300" />
            <CardTitle>{idea.name}</CardTitle>
            <CardDescription>{idea.tagline}</CardDescription>
            <div className="mt-5 space-y-3 text-sm">
              <p>
                <span className="text-zinc-500">Buyer:</span>{" "}
                <span className="text-white">{idea.targetCustomer}</span>
              </p>
              <p>
                <span className="text-zinc-500">Pain:</span>{" "}
                <span className="text-zinc-300">{idea.pain}</span>
              </p>
              <p>
                <span className="text-zinc-500">Solution:</span>{" "}
                <span className="text-zinc-300">{idea.solution}</span>
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {idea.monetization.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button>
                <Brain size={16} /> Generate roadmap
              </Button>
              <Button variant="secondary">
                <Globe size={16} /> Domain check
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
