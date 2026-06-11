import type { AnalysisReport, AnalysisRequest, PageSnapshot } from "@micro-saas-scout/shared";
import { analyze } from "./lib/api";

type ScoutMessage =
  | { type: "ANALYZE_CURRENT_TAB"; mode?: AnalysisRequest["mode"]; provider?: AnalysisRequest["provider"] }
  | { type: "SAVE_REPORT"; report: AnalysisReport }
  | { type: "GET_LATEST_REPORT" }
  | { type: "OPEN_SIDE_PANEL" };

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
  const screenshot = await captureVisibleTab();
  const response = await chrome.tabs.sendMessage(tab.id!, {
    type: "SCOUT_SCRAPE_PAGE",
    screenshot,
  });
  return response.snapshot as PageSnapshot;
}

async function persistReport(report: AnalysisReport) {
  const saved = await chrome.storage.local.get(["reports"]);
  const reports = [report, ...((saved.reports as AnalysisReport[] | undefined) ?? [])].slice(0, 50);
  await chrome.storage.local.set({ latestReport: report, reports });
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
      sendResponse({ report: stored.latestReport });
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
