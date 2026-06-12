import type { AnalysisReport, AnalysisRequest, PageSnapshot } from "@micro-saas-scout/shared";
import { activateLicense, analyze, createRazorpayLink, getLicenseStatus } from "./lib/api";

type ScoutMessage =
  | { type: "ANALYZE_CURRENT_TAB"; mode?: AnalysisRequest["mode"]; provider?: AnalysisRequest["provider"] }
  | { type: "SAVE_REPORT"; report: AnalysisReport }
  | { type: "GET_LATEST_REPORT" }
  | { type: "OPEN_SIDE_PANEL" }
  | { type: "GET_TRIAL_STATUS" }
  | { type: "START_RAZORPAY_PAYMENT"; email?: string }
  | { type: "ACTIVATE_LICENSE"; code: string; email?: string };

type EntitlementStatus = {
  deviceId: string;
  trialStartedAt: string;
  trialEndsAt: string;
  trialDaysLeft: number;
  isTrialActive: boolean;
  isLicensed: boolean;
};

const TRIAL_DAYS = 3;

function canAnalyzeTab(tab: chrome.tabs.Tab) {
  const url = tab.url ?? "";
  return /^https?:\/\//i.test(url);
}

function scrapePageInTab(screenshot?: string) {
  function textOf(elements: Element[], limit = 24) {
    return elements
      .map((element) => element.textContent?.trim().replace(/\s+/g, " ") ?? "")
      .filter(Boolean)
      .slice(0, limit);
  }

  function collectMeta() {
    const meta: Record<string, string> = {};
    document.querySelectorAll("meta").forEach((tag) => {
      const key = tag.getAttribute("name") || tag.getAttribute("property");
      const content = tag.getAttribute("content");
      if (key && content) meta[key] = content;
    });
    return meta;
  }

  function looksLikeCta(text: string) {
    return /start|try|buy|book|demo|contact|subscribe|get|sign up|join|download/i.test(text);
  }

  const meta = collectMeta();
  const bodyText = document.body?.innerText?.replace(/\s+/g, " ").trim() ?? "";
  const buttons = [
    ...Array.from(document.querySelectorAll("button")),
    ...Array.from(document.querySelectorAll("a")),
  ];
  const reviewNodes = Array.from(
    document.querySelectorAll("[class*='review'], [class*='testimonial'], blockquote"),
  );

  return {
    url: location.href,
    title: document.title || location.hostname,
    description: meta.description,
    meta,
    headings: textOf(Array.from(document.querySelectorAll("h1,h2,h3")), 36),
    ctas: textOf(buttons.filter((element) => looksLikeCta(element.textContent ?? "")), 20),
    pricingSignals: Array.from(
      new Set(bodyText.match(/(?:free|\$\d+|pricing|per month|\/mo|enterprise)/gi) ?? []),
    ).slice(0, 24),
    forms: textOf(Array.from(document.querySelectorAll("form")), 12),
    reviews: textOf(reviewNodes, 16),
    links: textOf(Array.from(document.querySelectorAll("a")), 48),
    visibleText: bodyText.slice(0, 24000),
    screenshot,
    capturedAt: new Date().toISOString(),
  };
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error("No active tab found");
  return tab;
}

async function captureVisibleTab() {
  try {
    const window = await chrome.windows.getCurrent();
    if (typeof window.id !== "number") return undefined;
    return await chrome.tabs.captureVisibleTab(window.id, { format: "jpeg", quality: 62 });
  } catch {
    return undefined;
  }
}

async function scrapeActiveTab(): Promise<PageSnapshot> {
  const tab = await getActiveTab();
  if (!canAnalyzeTab(tab)) {
    throw new Error("This Chrome page cannot be analyzed. Open a normal http/https website and try again.");
  }

  const screenshot = await captureVisibleTab();

  try {
    const response = await chrome.tabs.sendMessage(tab.id!, {
      type: "SCOUT_SCRAPE_PAGE",
      screenshot,
    });
    if (response?.snapshot) {
      return response.snapshot as PageSnapshot;
    }
  } catch {
    // Tabs opened before extension install/reload may not have the content script.
    // Fall through to a direct injection so Analyze works without refreshing.
  }

  const [injected] = await chrome.scripting.executeScript({
    target: { tabId: tab.id! },
    func: scrapePageInTab,
    args: [screenshot],
  });

  if (!injected?.result) {
    throw new Error("Could not read this page. Refresh the tab and try again.");
  }

  return injected.result as PageSnapshot;
}

async function persistReport(report: AnalysisReport) {
  const saved = await chrome.storage.local.get(["reports"]);
  const reports = [report, ...((saved.reports as AnalysisReport[] | undefined) ?? [])].slice(0, 50);
  await chrome.storage.local.set({ latestReport: report, reports });
}

async function getOrCreateDeviceState() {
  const stored = await chrome.storage.local.get(["deviceId", "trialStartedAt", "license"]);
  const deviceId = typeof stored.deviceId === "string" ? stored.deviceId : crypto.randomUUID();
  const trialStartedAt =
    typeof stored.trialStartedAt === "string" ? stored.trialStartedAt : new Date().toISOString();

  if (!stored.deviceId || !stored.trialStartedAt) {
    await chrome.storage.local.set({ deviceId, trialStartedAt });
  }

  return {
    deviceId,
    trialStartedAt,
    localLicense: stored.license as { active?: boolean } | undefined,
  };
}

async function getEntitlementStatus(syncRemote = true): Promise<EntitlementStatus> {
  const { deviceId, trialStartedAt, localLicense } = await getOrCreateDeviceState();
  const trialStartMs = new Date(trialStartedAt).getTime();
  const trialEndsAtMs = trialStartMs + TRIAL_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let isLicensed = Boolean(localLicense?.active);

  if (syncRemote) {
    try {
      const response = await getLicenseStatus(deviceId);
      if (response.license.active) {
        isLicensed = true;
        await chrome.storage.local.set({ license: response.license });
      }
    } catch {
      // Keep local state usable if backend is offline.
    }
  }

  return {
    deviceId,
    trialStartedAt,
    trialEndsAt: new Date(trialEndsAtMs).toISOString(),
    trialDaysLeft: Math.max(0, Math.ceil((trialEndsAtMs - now) / (24 * 60 * 60 * 1000))),
    isTrialActive: now < trialEndsAtMs,
    isLicensed,
  };
}

function hostnameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "this website";
  }
}

function localAnalysisReport(snapshot: PageSnapshot, reason?: string): AnalysisReport {
  const host = hostnameFromUrl(snapshot.url);
  const title = snapshot.title || host;
  const topHeading = snapshot.headings[0] ?? title;
  const hasPricing = snapshot.pricingSignals.length > 0;
  const hasForms = snapshot.forms.length > 0;
  const hasCtas = snapshot.ctas.length > 0;
  const revenueBase = hasPricing ? 4500 : 2500;

  const markdown = `# ${title}\n\nLocal Scout analysis for ${snapshot.url}\n\n## Top opportunity\nBuild a focused automation layer around the clearest user workflow on this page.`;

  return {
    id: crypto.randomUUID(),
    url: snapshot.url,
    title,
    generatedAt: new Date().toISOString(),
    executiveSummary: `Scout analyzed ${host} locally from the current tab. ${topHeading} shows an opportunity to package a sharper micro-SaaS around workflow automation, conversion improvement, and audience-specific insights.${reason ? ` Backend AI was unavailable, so this is a local fallback report.` : ""}`,
    positioning: `${host} appears positioned around: ${topHeading}.`,
    businessModel: hasPricing
      ? "Pricing/subscription signals are visible, suggesting a monetizable product or commercial funnel."
      : "No strong pricing signal was detected; opportunity may sit in lead generation, content, marketplace, or audience monetization.",
    weaknesses: [
      hasCtas ? "Calls-to-action exist, but they may not be tied to a clear quantified outcome." : "Clear conversion calls-to-action are limited or hard to detect.",
      hasPricing ? "Pricing signals exist, but the page may not fully explain ROI or buyer urgency." : "Pricing or monetization is not obvious from the visible page.",
      hasForms ? "Forms exist, but the follow-up workflow can likely be automated or enriched with AI." : "Lead capture and structured data collection appear limited.",
    ],
    missingFeatures: [
      "AI summary of user intent and buyer pain",
      "Personalized onboarding or recommendation flow",
      "Competitor gap monitor",
      "Automated lead qualification or content-to-insight workflow",
      "Shareable report/export experience",
    ],
    opportunities: [
      `Build an AI copilot that helps ${host} users complete the main workflow faster.`,
      `Create a Chrome extension that extracts insights from pages like ${host} and turns them into action plans.`,
      `Package a B2B micro-SaaS around monitoring, summarizing, or automating the repeated tasks visible on this site.`,
    ],
    saasIdeas: [
      {
        name: `${host.split(".")[0] || "Scout"} Copilot`,
        tagline: "Turn website signals into automated action plans.",
        targetCustomer: "Founders, operators, marketers, and teams using similar websites daily",
        pain: "Users manually review pages, extract information, compare options, and decide what to do next.",
        solution: "A lightweight AI layer that summarizes, scores, and automates the next best action from any page.",
        monetization: ["Free scan limit", "$19/mo solo plan", "$79/mo pro automation plan"],
        whyNow: "AI can now transform unstructured web pages into useful business workflows instantly.",
        difficulty: 46,
      },
      {
        name: "Opportunity Radar",
        tagline: "Find missing features and monetizable gaps from any website.",
        targetCustomer: "Indie hackers, agencies, and SaaS product teams",
        pain: "It is hard to quickly spot validated micro-SaaS ideas while browsing real websites.",
        solution: "A scanner that turns visible website structure, copy, CTAs, and pricing signals into startup ideas.",
        monetization: ["$29/mo pro scans", "PDF report exports", "Agency white-label add-on"],
        whyNow: "Browser extensions plus LLMs make instant contextual startup research possible.",
        difficulty: 52,
      },
    ],
    competitorGaps: [
      {
        competitor: "Manual research",
        betterAt: "Human judgment and nuance",
        gapToExploit: "Slow, inconsistent, and hard to repeat at scale",
        counterPositioning: "Instant AI startup analyst for every website",
      },
      {
        competitor: "Generic AI chatbots",
        betterAt: "Broad open-ended answers",
        gapToExploit: "They do not automatically scrape the current tab or structure startup reports",
        counterPositioning: "Purpose-built website-to-micro-SaaS scanner",
      },
    ],
    revenue: {
      lowMonthly: revenueBase,
      realisticMonthly: revenueBase * 5,
      highMonthly: revenueBase * 18,
      pricingStrategy: ["Free limited scans", "Monthly pro subscription", "Export/deep-analysis add-ons"],
      assumptions: [
        "Local fallback estimate based on visible page signals",
        "Real AI provider output may refine market size and pricing",
        "Revenue depends on niche focus, distribution, and retention",
      ],
    },
    buildPlan: {
      mvpFeatures: [
        "Current-tab website scanner",
        "AI opportunity summary",
        "Scores for demand, difficulty, and virality",
        "Save/export report",
        "Follow-up chat assistant",
      ],
      frontendStack: ["React", "TypeScript", "Vite", "Chrome Extension MV3"],
      backendArchitecture: ["Node.js API", "AI provider router", "Supabase persistence", "Stripe-ready billing"],
      databaseSchema: ["reports(id, user_id, url, title, json, created_at)", "ideas(id, report_id, name, score, json)"],
      aiStack: ["OpenAI", "Gemini", "Claude", "Local fallback analysis"],
      suggestedApis: ["OpenAI", "Supabase", "Stripe", "Clerk"],
      roadmap: [
        {
          phase: "MVP",
          goal: "Validate that users want instant website opportunity scans.",
          features: ["Analyze current tab", "Generate report", "Save locally"],
          validationMetric: "Users run 5+ scans in a week",
        },
        {
          phase: "Pro",
          goal: "Convert repeated usage into subscriptions.",
          features: ["PDF export", "Deep competitor gap detection", "Saved projects"],
          validationMetric: "5%+ free-to-pro conversion",
        },
      ],
    },
    growthIdeas: [
      "Share public teardown screenshots on founder communities",
      "Create weekly 'hidden SaaS opportunities' content",
      "Offer free scans as a lead magnet",
      "Build viral report cards with branded exports",
    ],
    scores: {
      competition: { label: "Moderate", value: 58, explanation: "Generic tools exist, but contextual website scanning is more focused." },
      difficulty: { label: "Buildable", value: 44, explanation: "The MVP is achievable with extension scraping and AI summaries." },
      scalability: { label: "High", value: 78, explanation: "The workflow applies across many websites and niches." },
      viralPotential: { label: "Strong", value: 72, explanation: "Teardowns and startup ideas are naturally shareable." },
      marketDemand: { label: "Promising", value: 74, explanation: "Founders and agencies constantly look for validated opportunities." },
    },
    exportBlocks: {
      markdown,
      notion: markdown,
    },
  };
}

function isPlaceholderReport(report: unknown) {
  return (
    typeof report === "object" &&
    report !== null &&
    "url" in report &&
    (report as { url?: string }).url === "https://example-saas.com"
  );
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => undefined);
});

chrome.runtime.onMessage.addListener((message: ScoutMessage, _sender, sendResponse) => {
  (async () => {
    if (message.type === "ANALYZE_CURRENT_TAB") {
      const entitlement = await getEntitlementStatus();
      if (!entitlement.isTrialActive && !entitlement.isLicensed) {
        sendResponse({ trialExpired: true, entitlement });
        return;
      }

      const snapshot = await scrapeActiveTab();
      let report: AnalysisReport;
      try {
        const response = await analyze({
          snapshot,
          mode: message.mode ?? "standard",
          provider: message.provider ?? "openai",
        });
        report = response.report;
      } catch (error) {
        report = localAnalysisReport(snapshot, error instanceof Error ? error.message : "API unavailable");
      }
      await persistReport(report);
      sendResponse({ report });
      return;
    }

    if (message.type === "SAVE_REPORT") {
      await persistReport(message.report);
      sendResponse({ ok: true });
      return;
    }

    if (message.type === "GET_LATEST_REPORT") {
      const stored = await chrome.storage.local.get(["latestReport"]);
      sendResponse({ report: isPlaceholderReport(stored.latestReport) ? undefined : stored.latestReport });
      return;
    }

    if (message.type === "GET_TRIAL_STATUS") {
      const entitlement = await getEntitlementStatus();
      sendResponse({ entitlement });
      return;
    }

    if (message.type === "START_RAZORPAY_PAYMENT") {
      const entitlement = await getEntitlementStatus(false);
      const response = await createRazorpayLink({
        deviceId: entitlement.deviceId,
        email: message.email,
      });
      await chrome.tabs.create({ url: response.url });
      sendResponse({ ok: true, url: response.url });
      return;
    }

    if (message.type === "ACTIVATE_LICENSE") {
      const entitlement = await getEntitlementStatus(false);
      const response = await activateLicense({
        deviceId: entitlement.deviceId,
        code: message.code,
        email: message.email,
      });
      await chrome.storage.local.set({ license: response.license });
      sendResponse({ license: response.license, entitlement: await getEntitlementStatus(false) });
      return;
    }

    if (message.type === "OPEN_SIDE_PANEL") {
      const tab = await getActiveTab();
      await chrome.sidePanel.open({ windowId: tab.windowId });
      sendResponse({ ok: true });
    }
  })().catch((error) => {
    sendResponse({ error: error instanceof Error ? error.message : "Unknown error" });
  });

  return true;
});
