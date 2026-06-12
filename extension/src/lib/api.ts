import type { AnalysisReport, AnalysisRequest, ChatRequest } from "@micro-saas-scout/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export async function apiRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

export function analyze(input: AnalysisRequest) {
  return apiRequest<{ report: AnalysisReport }>("/api/analyze", input);
}

export function chat(input: ChatRequest) {
  return apiRequest<{ message: { role: "assistant"; content: string } }>("/api/chat", input);
}

export function getLicenseStatus(deviceId: string) {
  return apiRequest<{
    license: {
      deviceId: string;
      active: boolean;
      status: "free" | "active";
      source?: "manual" | "razorpay" | "admin";
      email?: string;
      unlockedAt?: string;
    };
  }>("/api/billing/license/status", { deviceId });
}

export function activateLicense(input: { deviceId: string; code: string; email?: string }) {
  return apiRequest<{
    license: {
      deviceId: string;
      active: boolean;
      status: "free" | "active";
      source?: "manual" | "razorpay" | "admin";
      email?: string;
      unlockedAt?: string;
    };
  }>("/api/billing/license/activate", input);
}

export function createRazorpayLink(input: { deviceId: string; email?: string }) {
  return apiRequest<{ url: string; mode: "static" | "razorpay" }>(
    "/api/billing/razorpay/create-link",
    input,
  );
}
