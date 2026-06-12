import type { AnalysisReport, PageSnapshot } from "./schemas.js";

export const demoSnapshot: PageSnapshot = {
  url: "https://example-saas.com",
  title: "Example SaaS - Customer feedback platform",
  description: "Collect customer feedback and ship better products.",
  meta: {
    "og:title": "Example SaaS",
    description: "Collect customer feedback and ship better products.",
  },
  headings: ["Customer feedback that drives growth", "Pricing", "Loved by teams"],
  ctas: ["Start free trial", "Book a demo", "See pricing"],
  pricingSignals: ["Free", "$29/mo", "$99/mo"],
  forms: ["Email capture", "Demo request"],
  reviews: ["Simple to use", "Missing integrations"],
  links: ["Pricing", "Integrations", "Docs"],
  visibleText:
    "A customer feedback platform for product teams. Collect NPS, feature requests, and reviews. Integrations with Slack and Jira. Pricing starts at $29 per month.",
  capturedAt: new Date().toISOString(),
};

export const demoReport: AnalysisReport = {
  id: "demo-report",
  url: demoSnapshot.url,
  title: demoSnapshot.title,
  generatedAt: new Date().toISOString(),
  executiveSummary:
    "This site sells a broad feedback platform, but its positioning leaves room for vertical-specific, AI-native feedback intelligence products with clearer ROI.",
  positioning:
    "Horizontal customer feedback platform for product and success teams.",
  businessModel:
    "Subscription SaaS with free trial, team plans, and demo-led enterprise expansion.",
  weaknesses: [
    "CTA copy is generic and does not quantify buyer ROI.",
    "Integrations are presented as features instead of workflow outcomes.",
    "No evidence of AI summarization, churn prediction, or revenue attribution.",
    "Pricing tiers are simple but do not map to team maturity or usage intensity.",
  ],
  missingFeatures: [
    "AI feedback clustering by account value",
    "Revenue impact scoring for feature requests",
    "Chrome extension for capturing feedback from any app",
    "Competitor review monitoring",
    "Public roadmap auto-generation",
  ],
  opportunities: [
    "Build an AI feedback copilot for B2B SaaS customer success teams.",
    "Create a Chrome extension that turns support tickets into roadmap evidence.",
    "Launch a lightweight API for feedback sentiment and revenue scoring.",
  ],
  saasIdeas: [
    {
      name: "SignalRoadmap AI",
      tagline: "Turn customer noise into revenue-ranked roadmap decisions.",
      targetCustomer: "B2B SaaS product teams with 5-50 customer-facing staff",
      pain: "Feature requests arrive across Slack, Intercom, Gong, email, and calls with no revenue-weighted priority.",
      solution:
        "AI ingests feedback, deduplicates themes, attaches ARR, and recommends roadmap bets.",
      monetization: ["$99/mo starter", "$399/mo growth", "Enterprise SSO add-on"],
      whyNow:
        "AI summarization is mature enough to convert messy qualitative data into operator-ready prioritization.",
      difficulty: 62,
    },
    {
      name: "ReviewGap Scout",
      tagline: "Find what competitors' customers hate before you build.",
      targetCustomer: "Indie hackers and early-stage SaaS founders",
      pain: "Founders struggle to spot validated pain in competitor reviews.",
      solution:
        "Monitor review sites, cluster complaints, and generate MVP specs from recurring gaps.",
      monetization: ["$19/mo solo", "$79/mo pro", "One-off PDF reports"],
      whyNow:
        "Public review data plus LLM classification enables affordable market research.",
      difficulty: 48,
    },
  ],
  competitorGaps: [
    {
      competitor: "Canny",
      betterAt: "Public voting boards and roadmap communication",
      gapToExploit: "AI revenue scoring and private executive summaries",
      counterPositioning: "The AI roadmap analyst for teams drowning in feedback",
    },
    {
      competitor: "Productboard",
      betterAt: "Enterprise product management workflows",
      gapToExploit: "Lightweight setup for startups that need answers today",
      counterPositioning: "80% of roadmap intelligence without enterprise bloat",
    },
  ],
  revenue: {
    lowMonthly: 3000,
    realisticMonthly: 18000,
    highMonthly: 75000,
    pricingStrategy: [
      "Usage-based feedback volume tiers",
      "Team seats for product, success, and founders",
      "Premium integrations for Salesforce, HubSpot, and Gong",
    ],
    assumptions: [
      "Niche B2B SaaS buyer with clear workflow pain",
      "Average customer pays $149-$399 per month",
      "Growth depends on integrations and founder-led content",
    ],
  },
  buildPlan: {
    mvpFeatures: [
      "Chrome extension feedback clipper",
      "AI clustering dashboard",
      "ARR/manual value tagging",
      "Roadmap recommendation report",
      "Slack digest",
    ],
    frontendStack: ["React", "TypeScript", "TailwindCSS", "shadcn/ui"],
    backendArchitecture: [
      "Node.js Express API",
      "Supabase Postgres and Row Level Security",
      "Queue-ready AI analysis service",
      "Stripe subscription webhooks",
    ],
    databaseSchema: [
      "projects(id, user_id, name, url, created_at)",
      "feedback_items(id, project_id, source, text, account_value, created_at)",
      "themes(id, project_id, title, summary, revenue_score)",
      "reports(id, project_id, json, created_at)",
    ],
    aiStack: ["OpenAI GPT-4.1/4o", "Embeddings for clustering", "Gemini fallback", "Claude strategy fallback"],
    suggestedApis: ["Slack", "Intercom", "HubSpot", "Stripe", "Clearbit"],
    roadmap: [
      {
        phase: "MVP",
        goal: "Validate that teams pay for revenue-ranked feedback summaries.",
        features: ["Clipper", "Manual import", "AI summary", "Markdown export"],
        validationMetric: "10 teams run weekly roadmap reviews from the report",
      },
      {
        phase: "Growth",
        goal: "Become part of customer-facing workflows.",
        features: ["Slack bot", "CRM sync", "Public roadmap generator"],
        validationMetric: "40% weekly active team usage",
      },
      {
        phase: "Scale",
        goal: "Expand into product intelligence platform.",
        features: ["Predictive churn signals", "Competitor review monitor", "API"],
        validationMetric: "$50k MRR with net revenue retention above 110%",
      },
    ],
  },
  growthIdeas: [
    "Publish weekly teardown reports of popular SaaS categories.",
    "Offer a free competitor review gap scanner as a lead magnet.",
    "Create shareable roadmap scorecards with embedded watermark.",
    "Partner with product coaches and customer success communities.",
  ],
  scores: {
    competition: {
      label: "Competitive but wedgeable",
      value: 68,
      explanation: "Large incumbents exist, but AI-native revenue prioritization is still under-served.",
    },
    difficulty: {
      label: "Moderate build",
      value: 57,
      explanation: "The MVP is straightforward; integrations and data quality create complexity.",
    },
    scalability: {
      label: "High",
      value: 82,
      explanation: "The workflow can expand from summaries into source-of-truth product intelligence.",
    },
    viralPotential: {
      label: "Medium",
      value: 61,
      explanation: "Shareable scorecards and public roadmap outputs can drive organic loops.",
    },
    marketDemand: {
      label: "Strong",
      value: 77,
      explanation: "Every growing SaaS team receives scattered feedback and needs prioritization.",
    },
  },
  exportBlocks: {
    markdown: "# SignalRoadmap AI\n\nA revenue-ranked customer feedback copilot for B2B SaaS teams.",
    notion:
      "## Opportunity\nBuild an AI roadmap analyst that scores feedback by customer value and urgency.",
  },
};
