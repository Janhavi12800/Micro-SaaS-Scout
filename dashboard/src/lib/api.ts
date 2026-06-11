import type { AnalysisReport, AnalysisRequest, ChatRequest } from "@micro-saas-scout/shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

export function analyzeWebsite(input: AnalysisRequest) {
  return request<{ report: AnalysisReport }>("/api/analyze", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function chat(input: ChatRequest) {
  return request<{ message: { role: "assistant"; content: string } }>("/api/chat", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listProjects() {
  return request<{ projects: Array<{ id: string; report: AnalysisReport; createdAt: string }> }>(
    "/api/projects",
  );
}
