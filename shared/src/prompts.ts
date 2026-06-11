import type { AnalysisRequest, ChatMessage, PageSnapshot } from "./schemas.js";

const reportJsonContract = `Return only valid JSON matching this TypeScript shape:
{
  "id": "string",
  "url": "https://...",
  "title": "string",
  "generatedAt": "ISO date",
  "executiveSummary": "string",
  "positioning": "string",
  "businessModel": "string",
  "weaknesses": ["string"],
  "missingFeatures": ["string"],
  "opportunities": ["string"],
  "saasIdeas": [{
    "name": "string",
    "tagline": "string",
    "targetCustomer": "string",
    "pain": "string",
    "solution": "string",
    "monetization": ["string"],
    "whyNow": "string",
    "difficulty": 0
  }],
  "competitorGaps": [{
    "competitor": "string",
    "betterAt": "string",
    "gapToExploit": "string",
    "counterPositioning": "string"
  }],
  "revenue": {
    "lowMonthly": 0,
    "realisticMonthly": 0,
    "highMonthly": 0,
    "pricingStrategy": ["string"],
    "assumptions": ["string"]
  },
  "buildPlan": {
    "mvpFeatures": ["string"],
    "frontendStack": ["string"],
    "backendArchitecture": ["string"],
    "databaseSchema": ["string"],
    "aiStack": ["string"],
    "suggestedApis": ["string"],
    "roadmap": [{
      "phase": "string",
      "goal": "string",
      "features": ["string"],
      "validationMetric": "string"
    }]
  },
  "growthIdeas": ["string"],
  "scores": {
    "competition": { "label": "string", "value": 0, "explanation": "string" },
    "difficulty": { "label": "string", "value": 0, "explanation": "string" },
    "scalability": { "label": "string", "value": 0, "explanation": "string" },
    "viralPotential": { "label": "string", "value": 0, "explanation": "string" },
    "marketDemand": { "label": "string", "value": 0, "explanation": "string" }
  },
  "exportBlocks": {
    "markdown": "string",
    "notion": "string"
  }
}`;

const modeDirectives: Record<AnalysisRequest["mode"], string> = {
  standard:
    "Balance strategic analysis with practical execution. Identify overlooked but realistic micro-SaaS opportunities.",
  roast:
    "Use a sharp but constructive critique. Expose UX, positioning, pricing, funnel, trust, and retention weaknesses.",
  "hidden-opportunities":
    "Prioritize non-obvious workflow automation, data exhaust, embedded AI, API, and B2B wedge opportunities.",
  "clone-better":
    "Analyze how to build an ethically differentiated, sharper version with better positioning, UX, and monetization.",
  roadmap:
    "Bias toward buildability: MVP scope, architecture, database schema, integrations, and validation milestones.",
};

export function buildAnalysisPrompt(input: AnalysisRequest): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are Micro-SaaS Scout: an elite startup analyst, Chrome extension product strategist, SaaS architect, UX critic, and pragmatic AI engineer. Be direct, specific, and commercially useful. Never invent private metrics; make labeled assumptions when estimating.",
    },
    {
      role: "user",
      content: [
        `Analyze this website snapshot for micro-SaaS opportunities.`,
        `Mode: ${input.mode}. ${modeDirectives[input.mode]}`,
        `Required lens: website problems, missing features, business model, competitor gaps, revenue potential, tech stack, MVP roadmap, monetization, viral/growth loops, and UI/UX screenshot intelligence when screenshot data is present.`,
        `Use startup operator language. Every idea must name a buyer, pain, wedge, and pricing angle.`,
        reportJsonContract,
        `Website snapshot JSON:`,
        JSON.stringify(input.snapshot, null, 2),
      ].join("\n\n"),
    },
  ];
}

export function buildChatPrompt(
  messages: ChatMessage[],
  context?: { snapshot?: PageSnapshot; report?: unknown },
): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are the Micro-SaaS Scout assistant. Answer as a concise startup strategist. Give actionable steps, pricing, product, growth, and implementation details. Reference the analyzed website context when relevant.",
    },
    {
      role: "user",
      content: `Context JSON:\n${JSON.stringify(context ?? {}, null, 2)}`,
    },
    ...messages,
  ];
}
