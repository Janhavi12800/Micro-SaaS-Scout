import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { nanoid } from "nanoid";
import OpenAI from "openai";
import {
  analysisReportSchema,
  buildAnalysisPrompt,
  buildChatPrompt,
  demoReport,
  type AnalysisReport,
  type AnalysisRequest,
  type ChatMessage,
  type ChatRequest,
} from "@micro-saas-scout/shared";
import { config } from "../config";

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  throw new Error("AI response did not contain JSON");
}

function reportFromDemo(input: AnalysisRequest): AnalysisReport {
  return {
    ...demoReport,
    id: nanoid(),
    url: input.snapshot.url,
    title: input.snapshot.title,
    generatedAt: new Date().toISOString(),
    executiveSummary: `${demoReport.executiveSummary} Demo mode analyzed ${input.snapshot.title}. Add an AI provider key for live intelligence.`,
  };
}

function hydrateReport(raw: unknown, input: AnalysisRequest): AnalysisReport {
  const parsed = analysisReportSchema.parse(raw);
  return {
    ...parsed,
    id: parsed.id || nanoid(),
    url: input.snapshot.url,
    title: input.snapshot.title,
    generatedAt: parsed.generatedAt || new Date().toISOString(),
  };
}

async function callOpenAI(messages: ChatMessage[]) {
  if (!config.openaiApiKey) return null;
  const client = new OpenAI({ apiKey: config.openaiApiKey });
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.45,
    response_format: { type: "json_object" },
    messages,
  });
  return response.choices[0]?.message?.content ?? null;
}

async function callGemini(messages: ChatMessage[]) {
  if (!config.geminiApiKey) return null;
  const client = new GoogleGenerativeAI(config.geminiApiKey);
  const model = client.getGenerativeModel({ model: "gemini-1.5-pro" });
  const response = await model.generateContent(
    messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join("\n\n"),
  );
  return response.response.text();
}

async function callClaude(messages: ChatMessage[]) {
  if (!config.anthropicApiKey) return null;
  const client = new Anthropic({ apiKey: config.anthropicApiKey });
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 5000,
    temperature: 0.45,
    system: messages.find((message) => message.role === "system")?.content,
    messages: messages
      .filter((message) => message.role !== "system")
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content,
      })),
  });

  const text = response.content
    .map((block) => ("text" in block ? block.text : ""))
    .join("\n");
  return text || null;
}

async function callProvider(provider: AnalysisRequest["provider"], messages: ChatMessage[]) {
  if (provider === "openai") return callOpenAI(messages);
  if (provider === "gemini") return callGemini(messages);
  if (provider === "claude") return callClaude(messages);
  return null;
}

export async function analyzeWebsite(input: AnalysisRequest): Promise<AnalysisReport> {
  const messages = buildAnalysisPrompt(input);
  const text = await callProvider(input.provider, messages);

  if (!text) {
    return reportFromDemo(input);
  }

  const json = JSON.parse(extractJson(text));
  return hydrateReport(json, input);
}

export async function chatWithScout(input: ChatRequest) {
  const messages = buildChatPrompt(input.messages, {
    snapshot: input.snapshot,
    report: input.report,
  });
  const text = await callProvider(input.provider, messages);

  if (!text) {
    const lastQuestion = input.messages.at(-1)?.content ?? "What should I build?";
    return {
      role: "assistant" as const,
      content: `Demo AI answer for: "${lastQuestion}"\n\nFocus on a narrow buyer, identify a painful workflow on the analyzed site, package one AI automation as a paid subscription, and validate with a landing page plus concierge MVP before building deep integrations.`,
    };
  }

  return {
    role: "assistant" as const,
    content: text,
  };
}
