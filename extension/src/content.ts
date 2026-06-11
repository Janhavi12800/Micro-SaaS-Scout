import type { PageSnapshot } from "@micro-saas-scout/shared";

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

function scrapePage(screenshot?: string): PageSnapshot {
  const meta = collectMeta();
  const bodyText = document.body?.innerText?.replace(/\s+/g, " ").trim() ?? "";
  const buttons = [
    ...Array.from(document.querySelectorAll("button")),
    ...Array.from(document.querySelectorAll("a")),
  ];
  const ctas = textOf(buttons.filter((element) => looksLikeCta(element.textContent ?? "")), 20);
  const pricingSignals = bodyText.match(/(?:free|\$\d+|pricing|per month|\/mo|enterprise)/gi) ?? [];
  const reviewNodes = Array.from(
    document.querySelectorAll("[class*='review'], [class*='testimonial'], blockquote"),
  );

  return {
    url: location.href,
    title: document.title || location.hostname,
    description: meta.description,
    meta,
    headings: textOf(Array.from(document.querySelectorAll("h1,h2,h3")), 36),
    ctas,
    pricingSignals: Array.from(new Set(pricingSignals)).slice(0, 24),
    forms: textOf(Array.from(document.querySelectorAll("form")), 12),
    reviews: textOf(reviewNodes, 16),
    links: textOf(Array.from(document.querySelectorAll("a")), 48),
    visibleText: bodyText.slice(0, 24000),
    screenshot,
    capturedAt: new Date().toISOString(),
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "SCOUT_SCRAPE_PAGE") {
    sendResponse({ snapshot: scrapePage(message.screenshot) });
  }
  return true;
});
