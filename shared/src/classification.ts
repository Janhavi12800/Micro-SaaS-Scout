import type { PageSnapshot } from "./schemas.js";

export type Category =
  | "search"
  | "video"
  | "saas"
  | "commerce"
  | "content"
  | "ai"
  | "landing"
  | "payments"
  | "developer"
  | "education"
  | "productivity"
  | "general";

const ALL_CATEGORIES: Category[] = [
  "search",
  "video",
  "saas",
  "commerce",
  "content",
  "ai",
  "landing",
  "payments",
  "developer",
  "education",
  "productivity",
  "general",
];

const CATEGORY_PRIORITY: Category[] = [
  "search",
  "video",
  "commerce",
  "ai",
  "saas",
  "landing",
  "content",
  "payments",
  "developer",
  "education",
  "productivity",
  "general",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  search: "search engine results page",
  video: "video platform",
  saas: "SaaS product",
  commerce: "ecommerce store",
  content: "blog or content site",
  ai: "AI tool",
  landing: "product landing page",
  payments: "payments and fintech platform",
  developer: "developer platform",
  education: "education platform",
  productivity: "productivity tool",
  general: "general website",
};

const SEARCH_HOST =
  /^(www\.)?(google|bing|duckduckgo|yahoo|ecosia|startpage|brave)\.[a-z.]+$|^(search\.yahoo\.com)$/i;
const VIDEO_HOST = /^(www\.)?(youtube|youtu|m\.youtube|vimeo|twitch)\.[a-z.]+$|^youtu\.be$/i;
const COMMERCE_HOST =
  /^(www\.)?(amazon|ebay|etsy|shopify|woocommerce|aliexpress|flipkart|myntra)\.[a-z.]+$|\.myshopify\.com$/i;
const CONTENT_HOST =
  /^(www\.)?(medium|substack|wordpress|ghost|blogger|hashnode|dev\.to)\.[a-z.]+$|\.substack\.com$/i;
const AI_HOST =
  /^(www\.)?(openai|anthropic|claude|chatgpt|midjourney|perplexity|jasper|copy\.ai|huggingface)\.[a-z.]+$|^(chat\.openai)\.[a-z.]+$/i;
const SAAS_HOST =
  /^(www\.)?(notion|slack|asana|monday|airtable|hubspot|salesforce|zendesk|intercom|figma|canva|stripe)\.[a-z.]+$/i;
const PAYMENTS_HOST = /^(www\.)?(stripe|paypal|razorpay|square|plaid|wise|revolut)\.[a-z.]+$/i;
const DEVELOPER_HOST = /^(www\.)?(github|gitlab|stackoverflow|npmjs|vercel|netlify|docker)\.[a-z.]+$/i;

function emptyScores(): Record<Category, number> {
  return Object.fromEntries(ALL_CATEGORIES.map((category) => [category, 0])) as Record<Category, number>;
}

function addScore(scores: Record<Category, number>, category: Category, points: number) {
  scores[category] += points;
}

function parseUrl(url: string) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function normalizeHost(hostname: string) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function metaBlob(meta: Record<string, string>) {
  return Object.entries(meta)
    .map(([key, value]) => `${key} ${value}`)
    .join(" ")
    .toLowerCase();
}

function countMatches(text: string, patterns: RegExp[]) {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function ctaText(snapshot: PageSnapshot) {
  return snapshot.ctas.join(" ").toLowerCase();
}

function isSearchPage(url: URL, host: string) {
  if (!SEARCH_HOST.test(host)) return false;
  return url.pathname.includes("/search") || url.searchParams.has("q") || url.searchParams.has("p");
}

function isLandingPage(snapshot: PageSnapshot) {
  const textLength = snapshot.visibleText.length;
  const hasFocusedPitch = snapshot.headings.length <= 4 && snapshot.ctas.length >= 1;
  const hasCommercialIntent =
    snapshot.pricingSignals.length > 0 ||
    /start free|get started|sign up|book demo|request demo|try free|join waitlist/i.test(ctaText(snapshot));
  const compactPage = textLength < 7000;
  const limitedNavigation = snapshot.links.length < 18;

  return hasFocusedPitch && hasCommercialIntent && compactPage && limitedNavigation;
}

function scoreHostname(host: string, scores: Record<Category, number>) {
  if (VIDEO_HOST.test(host)) addScore(scores, "video", 100);
  if (COMMERCE_HOST.test(host)) addScore(scores, "commerce", 80);
  if (CONTENT_HOST.test(host)) addScore(scores, "content", 75);
  if (AI_HOST.test(host)) addScore(scores, "ai", 85);
  if (SAAS_HOST.test(host)) addScore(scores, "saas", 80);
  if (PAYMENTS_HOST.test(host)) addScore(scores, "payments", 85);
  if (DEVELOPER_HOST.test(host)) addScore(scores, "developer", 80);
}

function scoreUrl(url: URL, host: string, scores: Record<Category, number>) {
  const path = url.pathname.toLowerCase();
  const full = `${url.pathname}${url.search}`.toLowerCase();

  if (isSearchPage(url, host)) addScore(scores, "search", 120);

  if (/\/blog|\/article|\/post|\/news\//.test(path)) addScore(scores, "content", 35);
  if (/\/product|\/shop|\/store|\/cart|\/collections?\//.test(path)) addScore(scores, "commerce", 40);
  if (/\/pricing|\/plans?|\/features|\/integrations?/.test(path)) addScore(scores, "saas", 30);
  if (/\/watch|\/shorts|\/channel|\/playlist/.test(path)) addScore(scores, "video", 45);
  if (/\/docs|\/api|\/reference|\/sdk/.test(path)) addScore(scores, "developer", 30);

  if (/[?&]q=|[?&]search=/.test(full) && SEARCH_HOST.test(host)) addScore(scores, "search", 40);
}

function scoreMeta(meta: Record<string, string>, scores: Record<Category, number>) {
  const blob = metaBlob(meta);
  const ogType = (meta["og:type"] ?? "").toLowerCase();

  if (ogType.includes("article") || meta["article:published_time"]) addScore(scores, "content", 35);
  if (ogType.includes("product")) addScore(scores, "commerce", 35);
  if (ogType.includes("video")) addScore(scores, "video", 25);
  if (/ecommerce|shopping|store|retail/.test(blob)) addScore(scores, "commerce", 25);
  if (/software|saas|platform|application/.test(blob)) addScore(scores, "saas", 20);
  if (/\bai\b|artificial intelligence|machine learning|llm|gpt/.test(blob)) addScore(scores, "ai", 25);
}

function scoreTitleAndDescription(title: string, description: string, scores: Record<Category, number>) {
  const titleLower = title.toLowerCase();
  const combined = `${titleLower} ${description}`.toLowerCase();

  if (/- google search|search results|bing search|duckduckgo/i.test(combined)) addScore(scores, "search", 40);
  if (/\byoutube\b|watch on youtube|youtube video/i.test(combined)) addScore(scores, "video", 35);
  if (/\bblog\b|newsletter|article by|written by/i.test(combined)) addScore(scores, "content", 25);
  if (/\bshop\b|buy now|add to cart|free shipping|in stock/i.test(combined)) addScore(scores, "commerce", 25);
  if (/\bsaas\b|software as a service|free trial|per month|pricing plans/i.test(combined)) addScore(scores, "saas", 25);
  if (/\bai\b|artificial intelligence|chatbot|copilot|gpt-|llm/i.test(combined)) addScore(scores, "ai", 20);

  if (/^[\w\s.-]{2,40}$/.test(title.trim()) && /get started|launch|waitlist|early access/i.test(description)) {
    addScore(scores, "landing", 20);
  }
}

function scoreContent(snapshot: PageSnapshot, scores: Record<Category, number>) {
  const headings = snapshot.headings.join(" ").toLowerCase();
  const ctas = ctaText(snapshot);
  const body = snapshot.visibleText.slice(0, 5000).toLowerCase();
  const pricing = snapshot.pricingSignals.join(" ").toLowerCase();

  const commerceHits = countMatches(`${headings} ${body}`, [
    /\badd to cart\b/,
    /\bshopping cart\b/,
    /\bfree shipping\b/,
    /\bin stock\b/,
    /\bcheckout\b/,
    /\bshop now\b/,
    /\bsold by\b/,
    /\bproduct description\b/,
  ]);
  addScore(scores, "commerce", commerceHits * 12);

  const saasHits = countMatches(`${headings} ${ctas} ${pricing} ${body.slice(0, 2000)}`, [
    /\bfree trial\b/,
    /\bper month\b/,
    /\bper user\b/,
    /\benterprise plan\b/,
    /\brequest demo\b/,
    /\bbook a demo\b/,
    /\bstart free\b/,
    /\bintegrations?\b/,
    /\bapi access\b/,
    /\bworkflow automation\b/,
    /\bdashboard\b/,
  ]);
  addScore(scores, "saas", saasHits * 10);
  if (snapshot.pricingSignals.length >= 2) addScore(scores, "saas", 15);

  const aiHits = countMatches(`${headings} ${snapshot.title} ${body.slice(0, 1500)}`, [
    /\bartificial intelligence\b/,
    /\bgenerative ai\b/,
    /\blarge language model\b/,
    /\bchat with\b/,
    /\bai-powered\b/,
    /\bai assistant\b/,
    /\bprompt\b/,
    /\bllm\b/,
    /\bgpt-?\d/i,
  ]);
  addScore(scores, "ai", aiHits * 12);

  const contentHits = countMatches(`${headings} ${body.slice(0, 2000)}`, [
    /\bpublished on\b/,
    /\bmin read\b/,
    /\bwritten by\b/,
    /\bposted on\b/,
    /\btable of contents\b/,
    /\bshare this article\b/,
    /\brelated posts\b/,
    /\bnewsletter\b/,
  ]);
  addScore(scores, "content", contentHits * 10);

  const videoHits = countMatches(`${headings} ${body.slice(0, 1200)}`, [
    /\bsubscribe to channel\b/,
    /\bwatch later\b/,
    /\bview count\b/,
    /\buploaded on\b/,
    /\byoutube shorts\b/,
    /\bvideo transcript\b/,
  ]);
  addScore(scores, "video", videoHits * 15);

  const developerHits = countMatches(`${headings} ${body.slice(0, 2000)}`, [
    /\bapi reference\b/,
    /\bdeveloper docs\b/,
    /\bgetting started guide\b/,
    /\binstallation\b/,
    /\bsdk\b/,
    /\bgithub repository\b/,
    /\bcode sample\b/,
  ]);
  addScore(scores, "developer", developerHits * 10);

  const educationHits = countMatches(`${headings} ${body.slice(0, 2000)}`, [
    /\benroll now\b/,
    /\bcourse curriculum\b/,
    /\blesson \d+/,
    /\bstudent\b/,
    /\bcertificate\b/,
    /\blearning path\b/,
  ]);
  addScore(scores, "education", educationHits * 10);

  const productivityHits = countMatches(`${headings} ${body.slice(0, 2000)}`, [
    /\bproject management\b/,
    /\btask board\b/,
    /\bteam collaboration\b/,
    /\bcalendar sync\b/,
    /\bkanban\b/,
    /\bcrm\b/,
  ]);
  addScore(scores, "productivity", productivityHits * 10);

  const paymentsHits = countMatches(`${headings} ${body.slice(0, 2000)}`, [
    /\bpayment gateway\b/,
    /\bmerchant account\b/,
    /\binvoice\b/,
    /\bpayout\b/,
    /\btransaction fee\b/,
    /\bfinancial services\b/,
  ]);
  addScore(scores, "payments", paymentsHits * 10);

  if (isLandingPage(snapshot)) addScore(scores, "landing", 35);

  if (snapshot.forms.length > 0 && snapshot.ctas.length > 0 && snapshot.headings.length <= 5) {
    addScore(scores, "landing", 12);
  }
}

function pickCategory(scores: Record<Category, number>): Category {
  const threshold = 20;
  const ranked = CATEGORY_PRIORITY.map((category) => ({ category, score: scores[category] }))
    .filter((entry) => entry.score >= threshold)
    .sort((left, right) => right.score - left.score || CATEGORY_PRIORITY.indexOf(left.category) - CATEGORY_PRIORITY.indexOf(right.category));

  if (ranked.length === 0) return "general";

  const top = ranked[0]!;
  if (ranked.length === 1) return top.category;

  const runnerUp = ranked[1]!;
  if (top.score - runnerUp.score < 8 && CATEGORY_PRIORITY.indexOf(runnerUp.category) < CATEGORY_PRIORITY.indexOf(top.category)) {
    return runnerUp.category;
  }

  return top.category;
}

export function detectCategory(snapshot: PageSnapshot): Category {
  const parsed = parseUrl(snapshot.url);
  const host = parsed ? normalizeHost(parsed.hostname) : "";
  const scores = emptyScores();

  if (host) scoreHostname(host, scores);
  if (parsed) scoreUrl(parsed, host, scores);

  scoreMeta(snapshot.meta, scores);
  scoreTitleAndDescription(snapshot.title, (snapshot.description ?? "").toLowerCase(), scores);
  scoreContent(snapshot, scores);

  return pickCategory(scores);
}

export function executiveSummaryForCategory(
  category: Category,
  host: string,
  topHeading: string,
  reasonLine = "",
): string {
  const heading = topHeading || host;
  const summaries: Record<Category, string> = {
    search: `${host} is a search engine results page. Query intent around "${heading}" suggests SEO research, SERP monitoring, and niche keyword intelligence micro-SaaS opportunities.`,
    video: `${host} is a video platform page. Content themes around "${heading}" point to creator analytics, sponsorship matching, and audience growth tooling.`,
    saas: `${host} reads as a SaaS product site. Messaging around "${heading}" reveals gaps in onboarding, integrations, billing workflows, and vertical automation you could productize.`,
    commerce: `${host} behaves like an ecommerce surface. Merchandising and conversion signals around "${heading}" highlight CRO, retention, reviews, and storefront optimization ideas.`,
    content: `${host} is a blog or content property. Topics around "${heading}" suggest newsletter tooling, sponsorship workflows, and audience monetization products.`,
    ai: `${host} is an AI-powered tool. Capabilities around "${heading}" reveal narrower workflow automations, prompt libraries, and vertical AI copilots worth building.`,
    landing: `${host} is a focused product landing page. The pitch around "${heading}" exposes lead qualification, personalization, and conversion optimization micro-SaaS angles.`,
    payments: `${host} is a payments or fintech platform. Billing and transaction signals around "${heading}" suggest revenue ops, reconciliation, and merchant workflow products.`,
    developer: `${host} is a developer platform. Documentation and API signals around "${heading}" point to SDK helpers, integration templates, and dev-experience tooling.`,
    education: `${host} is an education platform. Learning content around "${heading}" suggests course builders, tutoring workflows, and study-assistant products.`,
    productivity: `${host} is a productivity or team workflow tool. Process signals around "${heading}" highlight automation, reporting, and cross-tool orchestration opportunities.`,
    general: `${host} is a general website. Visible signals around "${heading}" suggest practical micro-SaaS ideas in automation, analytics, conversion, and workflow packaging.`,
  };

  return `${summaries[category]}${reasonLine}`;
}

export function markdownSummaryForCategory(category: Category, host: string, topHeading: string, reasonLine = "") {
  const heading = topHeading || host;
  const summaries: Record<Category, string> = {
    search: `${host} is classified as a search results page with query focus on "${heading}".${reasonLine}`,
    video: `${host} is classified as a video platform page centered on "${heading}".${reasonLine}`,
    saas: `${host} is classified as a SaaS website positioned around "${heading}".${reasonLine}`,
    commerce: `${host} is classified as an ecommerce page merchandising "${heading}".${reasonLine}`,
    content: `${host} is classified as a blog or content site discussing "${heading}".${reasonLine}`,
    ai: `${host} is classified as an AI tool focused on "${heading}".${reasonLine}`,
    landing: `${host} is classified as a product landing page promoting "${heading}".${reasonLine}`,
    payments: `${host} is classified as a payments/fintech platform around "${heading}".${reasonLine}`,
    developer: `${host} is classified as a developer platform covering "${heading}".${reasonLine}`,
    education: `${host} is classified as an education platform teaching "${heading}".${reasonLine}`,
    productivity: `${host} is classified as a productivity tool for "${heading}".${reasonLine}`,
    general: `${host} shows mixed signals around "${heading}".${reasonLine}`,
  };

  return summaries[category];
}
