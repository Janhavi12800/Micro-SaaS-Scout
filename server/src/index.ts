import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config";
import { attachUser } from "./middleware/auth";
import { analysisRouter } from "./routes/analysis";
import { billingRouter } from "./routes/billing";
import { exportRouter } from "./routes/export";
import { projectsRouter } from "./routes/projects";

const app = express();

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
      if (
        origin === config.dashboardOrigin ||
        origin.startsWith("chrome-extension://") ||
        origin.startsWith(config.extensionOrigin)
      ) {
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
  res.json({ ok: true, service: "micro-saas-scout-api" });
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
