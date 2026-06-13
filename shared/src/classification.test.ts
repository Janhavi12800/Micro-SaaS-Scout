import assert from "node:assert/strict";
import { CATEGORY_LABELS, detectCategory, executiveSummaryForCategory } from "./classification.js";
import type { PageSnapshot } from "./schemas.js";

function snapshot(overrides: Partial<PageSnapshot> & Pick<PageSnapshot, "url" | "title">): PageSnapshot {
  return {
    description: "",
    meta: {},
    headings: [],
    ctas: [],
    pricingSignals: [],
    forms: [],
    reviews: [],
    links: [],
    visibleText: "",
    capturedAt: new Date().toISOString(),
    ...overrides,
  };
}

function assertCategory(input: Partial<PageSnapshot> & Pick<PageSnapshot, "url" | "title">, expected: string) {
  const category = detectCategory(snapshot(input));
  assert.equal(category, expected, `Expected ${expected} for ${input.url}, got ${category}`);
}

assertCategory(
  {
    url: "https://www.google.com/search?q=best+crm+software",
    title: "best crm software - Google Search",
    description: "Search results",
    headings: ["best crm software"],
    visibleText: "About 1,230,000 results. People also ask. Related searches.",
    links: ["Result 1", "Result 2", "Result 3"],
  },
  "search",
);

assertCategory(
  {
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Example Video Title - YouTube",
    meta: { "og:type": "video.other", "og:site_name": "YouTube" },
    headings: ["Example Video Title"],
    visibleText: "Subscribe to channel. 12M views. Uploaded on Jan 1, 2024.",
    ctas: ["Subscribe"],
  },
  "video",
);

assertCategory(
  {
    url: "https://www.notion.so/pricing",
    title: "Notion Pricing",
    description: "Plans for teams and individuals",
    headings: ["Choose your plan", "Free", "Plus", "Business"],
    pricingSignals: ["$8 per month", "Free", "Enterprise"],
    ctas: ["Start free trial", "Request demo"],
    visibleText: "Free trial. Per user pricing. Integrations with Slack and GitHub. Dashboard for teams.",
    forms: ["Email signup"],
    links: Array.from({ length: 12 }, (_, index) => `Link ${index}`),
  },
  "saas",
);

assertCategory(
  {
    url: "https://shop.example.com/products/blue-widget",
    title: "Blue Widget | Example Store",
    meta: { "og:type": "product" },
    headings: ["Blue Widget", "Product description"],
    visibleText: "Add to cart. Free shipping. In stock. Sold by Example Store. Checkout securely.",
    ctas: ["Add to cart", "Buy now"],
    pricingSignals: ["$29"],
  },
  "commerce",
);

assertCategory(
  {
    url: "https://blog.example.com/how-to-grow-a-newsletter",
    title: "How to grow a newsletter",
    meta: { "og:type": "article", "article:published_time": "2024-01-01" },
    headings: ["How to grow a newsletter"],
    visibleText: "Written by Jane Doe. 8 min read. Published on Jan 1. Share this article. Related posts.",
    links: Array.from({ length: 20 }, (_, index) => `Post ${index}`),
  },
  "content",
);

assertCategory(
  {
    url: "https://chat.openai.com/",
    title: "ChatGPT",
    description: "An AI assistant by OpenAI",
    headings: ["What can I help with?"],
    visibleText: "AI assistant. GPT-4. Prompt examples. Artificial intelligence for writing and coding.",
    ctas: ["Try ChatGPT"],
  },
  "ai",
);

assertCategory(
  {
    url: "https://launchpad.example.com/",
    title: "LaunchPad",
    description: "Get started with LaunchPad today",
    headings: ["Ship your product faster"],
    ctas: ["Get started", "Join waitlist"],
    pricingSignals: ["$19/mo"],
    forms: ["Email"],
    visibleText: "Get started in minutes. Early access for founders.",
    links: ["Features", "Pricing", "FAQ"],
  },
  "landing",
);

const googleSummary = executiveSummaryForCategory("search", "google.com", "crm software");
assert.match(googleSummary, /search engine results page/i);
assert.doesNotMatch(googleSummary, /opportunity surface/i);

const generalSummary = executiveSummaryForCategory("general", "example.com", "Welcome");
assert.doesNotMatch(generalSummary, /opportunity surface/i);
assert.match(generalSummary, /general website/i);

assert.equal(CATEGORY_LABELS.video, "video platform");

console.log("classification tests passed");
