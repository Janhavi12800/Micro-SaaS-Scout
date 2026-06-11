import "dotenv/config";

function optional(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

export const config = {
  nodeEnv: optional("NODE_ENV", "development"),
  port: Number(optional("PORT", "8787")),
  dashboardOrigin: optional("DASHBOARD_ORIGIN", "http://localhost:5173"),
  extensionOrigin: optional("EXTENSION_ORIGIN", "chrome-extension://"),
  openaiApiKey: optional("OPENAI_API_KEY"),
  geminiApiKey: optional("GEMINI_API_KEY"),
  anthropicApiKey: optional("ANTHROPIC_API_KEY"),
  supabaseUrl: optional("SUPABASE_URL"),
  supabaseServiceRoleKey: optional("SUPABASE_SERVICE_ROLE_KEY"),
  stripeSecretKey: optional("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: optional("STRIPE_WEBHOOK_SECRET"),
  clerkPublishableKey: optional("CLERK_PUBLISHABLE_KEY"),
  clerkSecretKey: optional("CLERK_SECRET_KEY"),
  freeAnalysisLimit: Number(optional("FREE_ANALYSIS_LIMIT", "5")),
  rateLimitWindowMs: Number(optional("RATE_LIMIT_WINDOW_MS", "60000")),
  rateLimitMax: Number(optional("RATE_LIMIT_MAX", "60")),
};

export const hasSupabase = Boolean(
  config.supabaseUrl && config.supabaseServiceRoleKey,
);
