import type { AnalysisReport, PageSnapshot, Score, StartupIdea } from "./schemas.js";

type Category =
  | "video"
  | "payments"
  | "commerce"
  | "developer"
  | "ai"
  | "education"
  | "content"
  | "productivity"
  | "general";

function clamp(value: number, min = 25, max = 95) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function hashString(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hostnameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "this website";
  }
}

function titleCase(value: string) {
  return value
    .split(/[\s.-]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function detectCategory(snapshot: PageSnapshot): Category {
  const text = `${snapshot.url} ${snapshot.title} ${snapshot.description ?? ""} ${snapshot.headings.join(" ")} ${snapshot.visibleText.slice(0, 4000)}`.toLowerCase();

  if (/youtube|video|watch|channel|subscribe|creator|music|shorts/.test(text)) return "video";
  if (/stripe|payment|checkout|invoice|financial|banking|revenue|transaction/.test(text)) return "payments";
  if (/shop|cart|store|ecommerce|product|checkout|buy now|seller/.test(text)) return "commerce";
  if (/api|developer|docs|github|code|sdk|database|deploy/.test(text)) return "developer";
  if (/\bai\b|artificial intelligence|automation|copilot|agent|llm|prompt/.test(text)) return "ai";
  if (/course|learn|student|school|tutorial|lesson|education/.test(text)) return "education";
  if (/blog|newsletter|article|creator|media|podcast|news/.test(text)) return "content";
  if (/project|task|workflow|team|calendar|crm|productivity/.test(text)) return "productivity";
  return "general";
}

function score(label: string, value: number, explanation: string): Score {
  return { label, value: clamp(value), explanation };
}

function categoryBase(category: Category) {
  switch (category) {
    case "video":
      return { demand: 73, viral: 86, scale: 68, competition: 82, difficulty: 54 };
    case "payments":
      return { demand: 88, viral: 48, scale: 91, competition: 84, difficulty: 72 };
    case "commerce":
      return { demand: 80, viral: 58, scale: 82, competition: 76, difficulty: 58 };
    case "developer":
      return { demand: 76, viral: 45, scale: 86, competition: 70, difficulty: 62 };
    case "ai":
      return { demand: 84, viral: 74, scale: 88, competition: 79, difficulty: 67 };
    case "education":
      return { demand: 70, viral: 64, scale: 72, competition: 61, difficulty: 45 };
    case "content":
      return { demand: 66, viral: 78, scale: 63, competition: 68, difficulty: 42 };
    case "productivity":
      return { demand: 74, viral: 52, scale: 79, competition: 73, difficulty: 56 };
    default:
      return { demand: 62, viral: 55, scale: 66, competition: 58, difficulty: 48 };
  }
}

function ideasForCategory(category: Category, host: string, brand: string): StartupIdea[] {
  const commonSecond: StartupIdea = {
    name: "Opportunity Radar",
    tagline: "Find monetizable gaps from any website in one click.",
    targetCustomer: "Indie hackers, SaaS agencies, and startup researchers",
    pain: "Manual website teardown is slow, inconsistent, and hard to repeat.",
    solution: "A scanner that turns page structure, copy, CTAs, and market signals into startup ideas.",
    monetization: ["3-day trial", "₹50 lifetime unlock", "Agency report packs"],
    whyNow: "Browser extensions plus AI make instant market research lightweight and affordable.",
    difficulty: 48,
  };

  const primaryByCategory: Record<Category, StartupIdea> = {
    video: {
      name: "Creator Signal Scout",
      tagline: "Turn YouTube pages into creator growth and sponsorship insights.",
      targetCustomer: "YouTubers, creator managers, and small brands",
      pain: "Creators and brands manually inspect videos, comments, titles, and channels to find growth angles.",
      solution: `Analyze ${host} pages to suggest thumbnail hooks, sponsorship fits, content gaps, and viral formats.`,
      monetization: ["₹50 lifetime unlock", "Creator pro reports", "Agency packs"],
      whyNow: "Creators need faster content research and AI can summarize public signals instantly.",
      difficulty: 44,
    },
    payments: {
      name: `${brand} Revenue Copilot`,
      tagline: "Find revenue leaks and payment workflow opportunities.",
      targetCustomer: "SaaS founders, finance ops teams, and payment-led startups",
      pain: "Payment, billing, and revenue workflows are complex and full of manual follow-up.",
      solution: `Use ${host} style payment signals to generate checkout, billing, churn, and revenue automation ideas.`,
      monetization: ["₹50 idea scans", "Monthly finance automation reports", "Implementation templates"],
      whyNow: "Every internet business is optimizing payments, billing, and revenue operations.",
      difficulty: 68,
    },
    commerce: {
      name: "Store Gap Finder",
      tagline: "Find conversion gaps and product opportunities from ecommerce pages.",
      targetCustomer: "DTC founders, Shopify agencies, and ecommerce marketers",
      pain: "Stores leak revenue through unclear positioning, missing trust signals, and weak offers.",
      solution: "Scan product/store pages and generate CRO fixes, upsells, bundles, and app ideas.",
      monetization: ["₹50 scans", "CRO report exports", "Agency white-label"],
      whyNow: "Small stores need affordable optimization without hiring expensive consultants.",
      difficulty: 52,
    },
    developer: {
      name: "API Gap Scout",
      tagline: "Turn developer websites into API and tooling opportunities.",
      targetCustomer: "Devtool founders and technical agencies",
      pain: "Developers struggle to identify missing SDKs, docs gaps, and automation opportunities quickly.",
      solution: "Analyze docs/API pages and suggest wrappers, plugins, templates, and integration products.",
      monetization: ["Paid reports", "Template packs", "Developer workflow automations"],
      whyNow: "AI makes developer documentation and integration research much faster.",
      difficulty: 60,
    },
    ai: {
      name: "AI Workflow Cloner",
      tagline: "Find narrower AI automation products from broad AI websites.",
      targetCustomer: "AI founders, automation agencies, and solopreneurs",
      pain: "Broad AI products are crowded; founders need narrower workflow wedges.",
      solution: "Scan AI websites and generate niche automations, ICPs, and MVP specs.",
      monetization: ["₹50 scans", "Prompt packs", "Automation blueprints"],
      whyNow: "AI adoption is high, but buyers want specific workflow ROI.",
      difficulty: 62,
    },
    education: {
      name: "Course Opportunity Scout",
      tagline: "Find learning gaps and education product ideas from any page.",
      targetCustomer: "Educators, course creators, and edtech founders",
      pain: "Learning content is fragmented and users need personalized paths.",
      solution: "Analyze education pages and generate course, quiz, coaching, and study assistant products.",
      monetization: ["Lifetime unlock", "Course report exports", "Creator bundles"],
      whyNow: "AI tutoring and personalized learning are becoming mainstream.",
      difficulty: 42,
    },
    content: {
      name: "Content Monetization Scout",
      tagline: "Find newsletter, media, and creator monetization opportunities.",
      targetCustomer: "Creators, bloggers, newsletter operators, and media teams",
      pain: "Content teams struggle to turn attention into products and repeatable revenue.",
      solution: "Scan content pages and suggest paid communities, lead magnets, sponsorships, and tools.",
      monetization: ["₹50 scans", "Content strategy exports", "Sponsorship lists"],
      whyNow: "Creators are moving from ads to products and owned audiences.",
      difficulty: 40,
    },
    productivity: {
      name: "Workflow Friction Finder",
      tagline: "Find productivity SaaS ideas from team workflow pages.",
      targetCustomer: "Ops teams, founders, and productivity app builders",
      pain: "Teams have repetitive workflows spread across tools and tabs.",
      solution: "Analyze workflow/productivity pages and generate automation, dashboard, and integration ideas.",
      monetization: ["Lifetime scans", "Automation templates", "Team reports"],
      whyNow: "Teams want AI to remove repetitive operational work.",
      difficulty: 54,
    },
    general: {
      name: `${brand} Opportunity Copilot`,
      tagline: "Turn website signals into practical micro-SaaS ideas.",
      targetCustomer: "Founders, marketers, and agencies",
      pain: "It is hard to quickly convert website observations into validated product ideas.",
      solution: "Analyze pages and generate problems, missing features, scores, and MVP roadmaps.",
      monetization: ["₹50 lifetime unlock", "Report exports", "Agency packs"],
      whyNow: "AI can turn unstructured pages into structured startup research.",
      difficulty: 46,
    },
  };

  return [primaryByCategory[category], commonSecond];
}

export function generateFallbackReport(
  snapshot: PageSnapshot,
  options: { id?: string; reason?: string } = {},
): AnalysisReport {
  const host = hostnameFromUrl(snapshot.url);
  const brand = titleCase(host.split(".")[0] || "Scout");
  const category = detectCategory(snapshot);
  const base = categoryBase(category);
  const seed = hashString(`${snapshot.url}|${snapshot.title}|${snapshot.headings.join("|")}`);
  const variance = (offset: number) => ((seed >> offset) % 17) - 8;
  const signalBoost = Math.min(10, snapshot.ctas.length + snapshot.forms.length + snapshot.pricingSignals.length);
  const textBoost = snapshot.visibleText.length > 8000 ? 5 : snapshot.visibleText.length > 2500 ? 3 : 0;
  const topHeading = snapshot.headings[0] ?? snapshot.title;

  const demand = clamp(base.demand + signalBoost + textBoost + variance(1));
  const viral = clamp(base.viral + (snapshot.reviews.length > 0 ? 4 : 0) + variance(3));
  const scale = clamp(base.scale + (snapshot.links.length > 20 ? 4 : 0) + variance(5));
  const competition = clamp(base.competition + signalBoost / 2 + variance(7));
  const difficulty = clamp(base.difficulty + (snapshot.forms.length > 0 ? 4 : 0) + variance(9));
  const revenueBase = category === "payments" ? 7000 : category === "video" ? 1800 : snapshot.pricingSignals.length ? 4200 : 2500;
  const ideas = ideasForCategory(category, host, brand);
  const reasonLine = options.reason ? ` This fallback was used because live AI was unavailable.` : "";

  const markdown = [
    `# ${snapshot.title}`,
    "",
    `URL: ${snapshot.url}`,
    "",
    `Category: ${category}`,
    "",
    "## Summary",
    `${host} shows signals around ${topHeading}. ${reasonLine}`,
    "",
    "## Top Ideas",
    ...ideas.map((idea) => `- ${idea.name}: ${idea.tagline}`),
  ].join("\n");

  return {
    id: options.id ?? `fallback-${seed}-${Date.now()}`,
    url: snapshot.url,
    title: snapshot.title,
    generatedAt: new Date().toISOString(),
    executiveSummary: `${host} looks like a ${category} opportunity surface. The page signals around "${topHeading}" suggest micro-SaaS angles in automation, analytics, conversion, and workflow packaging.${reasonLine}`,
    positioning: `${host} is currently positioned around "${topHeading}" with ${snapshot.ctas.length} detectable CTA signals and ${snapshot.headings.length} heading signals.`,
    businessModel:
      snapshot.pricingSignals.length > 0
        ? `Commercial intent is visible through pricing/payment signals: ${snapshot.pricingSignals.slice(0, 4).join(", ")}.`
        : `No strong pricing signal was detected, so monetization likely depends on lead capture, audience, subscription, or workflow automation.`,
    weaknesses: [
      snapshot.ctas.length
        ? "CTAs exist, but the page can likely communicate sharper outcome-based value."
        : "Clear conversion CTAs were not strongly detected.",
      snapshot.forms.length
        ? "Forms create a chance for AI qualification, enrichment, or follow-up automation."
        : "Structured lead capture appears limited from the visible page.",
      snapshot.headings.length > 8
        ? "The page has many content sections, which can dilute the core buyer promise."
        : "The page may need more proof, workflow examples, or buyer-specific use cases.",
    ],
    missingFeatures: [
      "AI-generated action summary for the visitor",
      "Personalized recommendation or onboarding path",
      "Competitor gap comparison",
      "ROI or value calculator",
      "Exportable/shareable insight report",
    ],
    opportunities: [
      `Build a ${category} intelligence layer for people researching pages like ${host}.`,
      `Create a Chrome extension workflow that turns ${host} page signals into tasks, reports, or recommendations.`,
      `Package the repeated user decisions on ${host} into a paid micro-SaaS assistant.`,
    ],
    saasIdeas: ideas,
    competitorGaps: [
      {
        competitor: "Manual browsing and spreadsheets",
        betterAt: "Flexible human judgment",
        gapToExploit: "Slow, inconsistent, and difficult to repeat across many websites",
        counterPositioning: "Instant website-to-opportunity scanner",
      },
      {
        competitor: "Generic AI chatbots",
        betterAt: "Broad answers",
        gapToExploit: "They do not automatically understand the current website context",
        counterPositioning: "Context-aware browser-native startup analyst",
      },
    ],
    revenue: {
      lowMonthly: revenueBase,
      realisticMonthly: revenueBase * 4,
      highMonthly: revenueBase * 14,
      pricingStrategy: ["3-day free trial", "₹50 one-time unlock", "Optional pro exports or agency packs"],
      assumptions: [
        `Category detected as ${category}`,
        "Fallback estimates use page signals, not live market data",
        "Real AI provider keys will improve detail and accuracy",
      ],
    },
    buildPlan: {
      mvpFeatures: [
        "Current-tab scanner",
        "Dynamic score generation",
        "Opportunity and weakness report",
        "Save/export report",
        "Payment-gated lifetime unlock",
      ],
      frontendStack: ["Chrome Extension MV3", "React", "TypeScript", "Vite"],
      backendArchitecture: ["Express API", "AI provider router", "Supabase licenses", "Razorpay payment links"],
      databaseSchema: ["licenses(device_id, email, status, source, payment_id, unlocked_at)", "projects(user_id, report, favorite)"],
      aiStack: ["OpenAI/Gemini/Claude when configured", "Dynamic local fallback when not configured"],
      suggestedApis: ["Razorpay", "Supabase", "OpenAI", "Chrome Tabs/Scripting APIs"],
      roadmap: [
        {
          phase: "MVP",
          goal: "Give users useful website-specific opportunity scores instantly.",
          features: ["Scan page", "Generate scores", "Show ideas", "Save report"],
          validationMetric: "Users scan multiple different websites and see different useful reports",
        },
        {
          phase: "Monetization",
          goal: "Convert trial users after value is proven.",
          features: ["3-day trial", "₹50 unlock", "Manual code fallback"],
          validationMetric: "Paid unlock conversion from active scanners",
        },
      ],
    },
    growthIdeas: [
      `Share ${category} teardown examples on social media`,
      "Create before/after website opportunity screenshots",
      "Offer free first scans to indie hackers",
      "Bundle reports for agencies and consultants",
    ],
    scores: {
      competition: score("Contextual", competition, `Competition score adjusted for ${category} category and visible page signals.`),
      difficulty: score("Buildability", difficulty, "Difficulty estimates MVP complexity from workflow, forms, and category."),
      scalability: score("Scale potential", scale, `Scale score reflects how broadly ${category} workflows can repeat across sites.`),
      viralPotential: score("Shareability", viral, "Viral potential reflects content/share signals and category behavior."),
      marketDemand: score("Demand", demand, "Demand uses category, CTA, pricing, and content-depth signals."),
    },
    exportBlocks: {
      markdown,
      notion: markdown,
    },
  };
}
