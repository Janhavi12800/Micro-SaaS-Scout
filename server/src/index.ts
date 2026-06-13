import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config.js";
import { attachUser } from "./middleware/auth.js";
import { analysisRouter } from "./routes/analysis.js";
import { billingRouter } from "./routes/billing.js";
import { exportRouter } from "./routes/export.js";
import { projectsRouter } from "./routes/projects.js";
import { getPaymentReadiness } from "./services/payment-readiness.js";

const app = express();
const allowedOrigins = new Set([
  config.dashboardOrigin,
  ...config.additionalCorsOrigins,
].filter(Boolean));
const configuredExtensionOrigin = config.extensionId
  ? `chrome-extension://${config.extensionId}`
  : "";

function isAllowedOrigin(origin: string) {
  if (allowedOrigins.has(origin)) return true;
  if (configuredExtensionOrigin && origin === configuredExtensionOrigin) return true;

  // Beginner/demo deployments do not know the Chrome extension ID until after
  // Chrome assigns it. Set CHROME_EXTENSION_ID in production to lock this down.
  if (!config.extensionId && origin.startsWith(config.extensionOrigin)) return true;

  return false;
}

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin not allowed: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(
  rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(attachUser);

app.get("/health", (_req, res) => {
  const payment = getPaymentReadiness();
  res.json({
    ok: true,
    service: "micro-saas-scout-api",
    payment: {
      ready: payment.ready,
      mode: payment.mode,
      amountInr: payment.amountInr,
      currency: payment.currency,
      unlockCodeConfigured: payment.unlockCodeConfigured,
      supabaseConfigured: payment.supabaseConfigured,
      webhookConfigured: payment.webhookConfigured,
      nextSteps: payment.nextSteps,
    },
  });
});

app.use("/api", analysisRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/export", exportRouter);
app.use("/api/billing", billingRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unknown server error";
  if (config.nodeEnv !== "production") {
    console.error(error);
  }
  res.status(500).json({ error: message });
});

app.listen(config.port, () => {
  console.log(`Micro-SaaS Scout API listening on :${config.port}`);
});
