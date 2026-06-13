import {
  CATEGORY_LABELS,
  detectCategory,
  executiveSummaryForCategory,
  markdownSummaryForCategory,
  type Category,
} from "./classification.js";
import type { AnalysisReport, PageSnapshot, Score, StartupIdea } from "./schemas.js";

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

function score(label: string, value: number, explanation: string): Score {
  return { label, value: clamp(value), explanation };
}

function categoryBase(category: Category) {
  switch (category) {
    case "search":
      return { demand: 78, viral: 42, scale: 74, competition: 81, difficulty: 58 };
    case "video":
      return { demand: 73, viral: 86, scale: 68, competition: 82, difficulty: 54 };
    case "saas":
      return { demand: 82, viral: 50, scale: 84, competition: 77, difficulty: 60 };
    case "commerce":
      return { demand: 80, viral: 58, scale: 82, competition: 76, difficulty: 58 };
    case "content":
      return { demand: 66, viral: 78, scale: 63, competition: 68, difficulty: 42 };
    case "ai":
      return { demand: 84, viral: 74, scale: 88, competition: 79, difficulty: 67 };
    case "landing":
      return { demand: 71, viral: 62, scale: 70, competition: 64, difficulty: 46 };
    case "payments":
      return { demand: 88, viral: 48, scale: 91, competition: 84, difficulty: 72 };
    case "developer":
      return { demand: 76, viral: 45, scale: 86, competition: 70, difficulty: 62 };
    case "education":
      return { demand: 70, viral: 64, scale: 72, competition: 61, difficulty: 45 };
    case "productivity":
      return { demand: 74, viral: 52, scale: 79, competition: 73, difficulty: 56 };
    default:
      return { demand: 62, viral: 55, scale: 66, competition: 58, difficulty: 48 };
  }
}

function categoryScoreAdjustments(category: Category, snapshot: PageSnapshot) {
  switch (category) {
    case "search":
      return { demand: 4, viral: -8, scale: 3, competition: 5, difficulty: 2 };
    case "video":
      return { demand: 2, viral: 6, scale: 0, competition: 4, difficulty: -2 };
    case "saas":
      return {
        demand: snapshot.pricingSignals.length > 0 ? 5 : 2,
        viral: 0,
        scale: 4,
        competition: 3,
        difficulty: snapshot.forms.length > 0 ? 3 : 0,
      };
    case "commerce":
      return {
        demand: 3,
        viral: snapshot.reviews.length > 0 ? 4 : 0,
        scale: 2,
        competition: 4,
        difficulty: 1,
      };
    case "content":
      return { demand: 1, viral: 5, scale: -2, competition: 2, difficulty: -4 };
    case "ai":
      return { demand: 5, viral: 4, scale: 5, competition: 6, difficulty: 4 };
    case "landing":
      return {
        demand: snapshot.ctas.length > 1 ? 4 : 1,
        viral: 2,
        scale: -1,
        competition: -2,
        difficulty: -3,
      };
    default:
      return { demand: 0, viral: 0, scale: 0, competition: 0, difficulty: 0 };
  }
}

function revenueBaseForCategory(category: Category, snapshot: PageSnapshot) {
  switch (category) {
    case "payments":
      return 7000;
    case "saas":
      return snapshot.pricingSignals.length ? 5200 : 3800;
    case "commerce":
      return 4600;
    case "ai":
      return 4800;
    case "search":
      return 3200;
    case "video":
      return 1800;
    case "landing":
      return snapshot.pricingSignals.length ? 3600 : 2400;
    case "content":
      return 2100;
    default:
      return snapshot.pricingSignals.length ? 4200 : 2500;
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
    search: {
      name: "SERP Intent Scout",
      tagline: "Turn search result pages into keyword and niche product opportunities.",
      targetCustomer: "SEO consultants, indie hackers, and content-led founders",
      pain: "Search intent is visible on SERPs but tedious to convert into product ideas manually.",
      solution: `Analyze ${host} result patterns to suggest keyword gaps, comparison pages, and intent-specific micro-tools.`,
      monetization: ["₹50 lifetime unlock", "SEO report exports", "Agency keyword packs"],
      whyNow: "Search behavior is shifting quickly and founders need faster intent research.",
      difficulty: 52,
    },
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
    saas: {
      name: `${brand} Workflow Wedge`,
      tagline: "Find narrower SaaS wedges from established software websites.",
      targetCustomer: "SaaS founders, product marketers, and automation agencies",
      pain: "Broad SaaS products are crowded; builders need sharper workflow-specific entry points.",
      solution: `Use ${host} feature, pricing, and integration signals to propose onboarding, billing, and ops automations.`,
      monetization: ["₹50 scans", "MVP spec exports", "Agency teardown packs"],
      whyNow: "Buyers want focused workflow ROI instead of all-in-one platforms.",
      difficulty: 58,
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
    landing: {
      name: "Landing Page Copilot",
      tagline: "Turn single-page product sites into CRO and lead-gen product ideas.",
      targetCustomer: "Marketers, indie hackers, and conversion agencies",
      pain: "Landing pages hide repeatable conversion patterns that are hard to benchmark quickly.",
      solution: `Analyze ${host} hero copy, CTAs, and proof elements to suggest personalization, qualification, and follow-up tools.`,
      monetization: ["₹50 scans", "CRO teardown exports", "Agency swipe files"],
      whyNow: "Founders launch faster with AI and need sharper conversion feedback loops.",
      difficulty: 43,
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
  const categoryLabel = CATEGORY_LABELS[category];
  const base = categoryBase(category);
  const adjustments = categoryScoreAdjustments(category, snapshot);
  const seed = hashString(`${snapshot.url}|${snapshot.title}|${snapshot.headings.join("|")}`);
  const variance = (offset: number) => ((seed >> offset) % 17) - 8;
  const signalBoost = Math.min(10, snapshot.ctas.length + snapshot.forms.length + snapshot.pricingSignals.length);
  const textBoost = snapshot.visibleText.length > 8000 ? 5 : snapshot.visibleText.length > 2500 ? 3 : 0;
  const topHeading = snapshot.headings[0] ?? snapshot.title;
  const reasonLine = options.reason ? ` This fallback was used because live AI was unavailable.` : "";

  const demand = clamp(base.demand + adjustments.demand + signalBoost + textBoost + variance(1));
  const viral = clamp(base.viral + adjustments.viral + (snapshot.reviews.length > 0 ? 4 : 0) + variance(3));
  const scale = clamp(base.scale + adjustments.scale + (snapshot.links.length > 20 ? 4 : 0) + variance(5));
  const competition = clamp(base.competition + adjustments.competition + signalBoost / 2 + variance(7));
  const difficulty = clamp(base.difficulty + adjustments.difficulty + (snapshot.forms.length > 0 ? 4 : 0) + variance(9));
  const revenueBase = revenueBaseForCategory(category, snapshot);
  const ideas = ideasForCategory(category, host, brand);

  const markdown = [
    `# ${snapshot.title}`,
    "",
    `URL: ${snapshot.url}`,
    "",
    `Category: ${categoryLabel}`,
    "",
    "## Summary",
    markdownSummaryForCategory(category, host, topHeading, reasonLine),
    "",
    "## Top Ideas",
    ...ideas.map((idea) => `- ${idea.name}: ${idea.tagline}`),
  ].join("\n");

  return {
    id: options.id ?? `fallback-${seed}-${Date.now()}`,
    url: snapshot.url,
    title: snapshot.title,
    generatedAt: new Date().toISOString(),
    executiveSummary: executiveSummaryForCategory(category, host, topHeading, reasonLine),
    positioning: `${host} is positioned as a ${categoryLabel}. The page centers on "${topHeading}" with ${snapshot.ctas.length} CTA signals and ${snapshot.headings.length} heading signals.`,
    businessModel:
      snapshot.pricingSignals.length > 0
        ? `Commercial intent is visible through pricing/payment signals: ${snapshot.pricingSignals.slice(0, 4).join(", ")}.`
        : category === "search"
          ? "Search pages monetize through ads, data products, and intent-driven tools rather than direct checkout flows."
          : category === "content"
            ? "Content sites typically monetize through subscriptions, sponsorships, affiliate offers, or paid products."
            : `No strong pricing signal was detected, so monetization likely depends on lead capture, audience building, or workflow automation.`,
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
      `Build a ${categoryLabel} intelligence layer for people researching pages like ${host}.`,
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
        `Website classified as ${categoryLabel}`,
        "Fallback estimates use hostname, meta, URL, and content signals rather than live market data",
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
      `Share ${categoryLabel} teardown examples on social media`,
      "Create before/after website opportunity screenshots",
      "Offer free first scans to indie hackers",
      "Bundle reports for agencies and consultants",
    ],
    scores: {
      competition: score("Contextual", competition, `Competition score adjusted for ${categoryLabel} and visible page signals.`),
      difficulty: score("Buildability", difficulty, `Difficulty reflects ${categoryLabel} MVP complexity and detected forms/workflows.`),
      scalability: score("Scale potential", scale, `Scale score reflects how broadly ${categoryLabel} workflows repeat across sites.`),
      viralPotential: score("Shareability", viral, `Shareability reflects ${categoryLabel} content patterns and social proof signals.`),
      marketDemand: score("Demand", demand, `Demand uses ${categoryLabel} signals plus CTA, pricing, and content depth.`),
    },
    exportBlocks: {
      markdown,
      notion: markdown,
    },
  };
}
