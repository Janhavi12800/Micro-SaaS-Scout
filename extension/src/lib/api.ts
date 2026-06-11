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
