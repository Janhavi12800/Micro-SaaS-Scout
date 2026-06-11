import { z } from "zod";

export const providerSchema = z.enum(["openai", "gemini", "claude", "demo"]);
export type AiProvider = z.infer<typeof providerSchema>;

export const pageSnapshotSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  description: z.string().optional(),
  meta: z.record(z.string(), z.string()).default({}),
  headings: z.array(z.string()).default([]),
  ctas: z.array(z.string()).default([]),
  pricingSignals: z.array(z.string()).default([]),
  forms: z.array(z.string()).default([]),
  reviews: z.array(z.string()).default([]),
  links: z.array(z.string()).default([]),
  visibleText: z.string().max(24000),
  screenshot: z.string().optional(),
  capturedAt: z.string(),
});
export type PageSnapshot = z.infer<typeof pageSnapshotSchema>;

export const scoreSchema = z.object({
  label: z.string(),
  value: z.number().min(0).max(100),
  explanation: z.string(),
});
export type Score = z.infer<typeof scoreSchema>;

export const revenueEstimateSchema = z.object({
  lowMonthly: z.number().nonnegative(),
  realisticMonthly: z.number().nonnegative(),
  highMonthly: z.number().nonnegative(),
  pricingStrategy: z.array(z.string()),
  assumptions: z.array(z.string()),
});
export type RevenueEstimate = z.infer<typeof revenueEstimateSchema>;

export const roadmapItemSchema = z.object({
  phase: z.string(),
  goal: z.string(),
  features: z.array(z.string()),
  validationMetric: z.string(),
});
export type RoadmapItem = z.infer<typeof roadmapItemSchema>;

export const startupIdeaSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  targetCustomer: z.string(),
  pain: z.string(),
  solution: z.string(),
  monetization: z.array(z.string()),
  whyNow: z.string(),
  difficulty: z.number().min(0).max(100),
});
export type StartupIdea = z.infer<typeof startupIdeaSchema>;

export const competitorGapSchema = z.object({
  competitor: z.string(),
  betterAt: z.string(),
  gapToExploit: z.string(),
  counterPositioning: z.string(),
});
export type CompetitorGap = z.infer<typeof competitorGapSchema>;

export const buildPlanSchema = z.object({
  mvpFeatures: z.array(z.string()),
  frontendStack: z.array(z.string()),
  backendArchitecture: z.array(z.string()),
  databaseSchema: z.array(z.string()),
  aiStack: z.array(z.string()),
  suggestedApis: z.array(z.string()),
  roadmap: z.array(roadmapItemSchema),
});
export type BuildPlan = z.infer<typeof buildPlanSchema>;

export const analysisReportSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  generatedAt: z.string(),
  executiveSummary: z.string(),
  positioning: z.string(),
  businessModel: z.string(),
  weaknesses: z.array(z.string()),
  missingFeatures: z.array(z.string()),
  opportunities: z.array(z.string()),
  saasIdeas: z.array(startupIdeaSchema),
  competitorGaps: z.array(competitorGapSchema),
  revenue: revenueEstimateSchema,
  buildPlan: buildPlanSchema,
  growthIdeas: z.array(z.string()),
  scores: z.object({
    competition: scoreSchema,
    difficulty: scoreSchema,
    scalability: scoreSchema,
    viralPotential: scoreSchema,
    marketDemand: scoreSchema,
  }),
  exportBlocks: z.object({
    markdown: z.string(),
    notion: z.string(),
  }),
});
export type AnalysisReport = z.infer<typeof analysisReportSchema>;

export const analysisRequestSchema = z.object({
  snapshot: pageSnapshotSchema,
  mode: z
    .enum([
      "standard",
      "roast",
      "hidden-opportunities",
      "clone-better",
      "roadmap",
    ])
    .default("standard"),
  provider: providerSchema.default("openai"),
});
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;

export const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
  report: analysisReportSchema.optional(),
  snapshot: pageSnapshotSchema.optional(),
  messages: z.array(chatMessageSchema),
  provider: providerSchema.default("openai"),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const savedProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  report: analysisReportSchema,
  favorite: z.boolean().default(false),
  createdAt: z.string(),
});
export type SavedProject = z.infer<typeof savedProjectSchema>;
