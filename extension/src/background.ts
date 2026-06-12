import type { AnalysisReport, AnalysisRequest, PageSnapshot } from "@micro-saas-scout/shared";
import { analyze } from "./lib/api";

type ScoutMessage =
  | { type: "ANALYZE_CURRENT_TAB"; mode?: AnalysisRequest["mode"]; provider?: AnalysisRequest["provider"] }
  | { type: "SAVE_REPORT"; report: AnalysisReport }
  | { type: "GET_LATEST_REPORT" }
  | { type: "OPEN_SIDE_PANEL" };

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
      const snapshot = await scrapeActiveTab();
      const { report } = await analyze({
        snapshot,
        mode: message.mode ?? "standard",
        provider: message.provider ?? "openai",
      });
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
