import { KeyRound, Lock, Server, Shield } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardTitle } from "../components/ui/card";

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Badge>Settings</Badge>
        <h1 className="mt-4 text-4xl font-black text-white">Workspace configuration</h1>
        <p className="mt-2 text-zinc-400">
          Configure providers, auth, billing, and data security for production deployment.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <KeyRound className="text-sky-300" />
          <CardTitle>AI providers</CardTitle>
          <CardDescription>
            OpenAI, Gemini, and Claude keys are stored only on the backend. The browser never receives them.
          </CardDescription>
          <select className="mt-5 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none">
            <option>OpenAI primary, Gemini fallback, Claude strategy fallback</option>
            <option>Gemini primary</option>
            <option>Claude primary</option>
          </select>
        </Card>

        <Card>
          <Shield className="text-sky-300" />
          <CardTitle>Security posture</CardTitle>
          <CardDescription>
            Rate limiting, validation, CSP-ready extension pages, Supabase RLS, Clerk auth, and Stripe webhooks.
          </CardDescription>
          <Button className="mt-5" variant="secondary">
            Run security checklist
          </Button>
        </Card>

        <Card>
          <Server className="text-sky-300" />
          <CardTitle>Backend URL</CardTitle>
          <CardDescription>Set VITE_API_URL for the dashboard and VITE_API_URL for the extension.</CardDescription>
          <input
            defaultValue="http://localhost:8787"
            className="mt-5 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
          />
        </Card>

        <Card>
          <Lock className="text-sky-300" />
          <CardTitle>Data retention</CardTitle>
          <CardDescription>
            Saved projects live in Supabase. Local demo mode stores projects in memory only.
          </CardDescription>
          <Button className="mt-5" variant="danger">
            Delete demo workspace
          </Button>
        </Card>
      </div>
    </div>
  );
}
