import { generateFallbackReport, type AnalysisReport, type AnalysisRequest, type PageSnapshot } from "@micro-saas-scout/shared";
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
        report = generateFallbackReport(snapshot, {
          id: crypto.randomUUID(),
          reason: error instanceof Error ? error.message : "API unavailable",
        });
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
