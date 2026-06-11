import { Router } from "express";
import {
  analysisRequestSchema,
  chatRequestSchema,
  analysisReportSchema,
} from "@micro-saas-scout/shared";
import { validateBody } from "../middleware/validate";
import { analyzeWebsite, chatWithScout } from "../services/ai";
import { saveProject } from "../services/projects";

export const analysisRouter = Router();

analysisRouter.post(
  "/analyze",
  validateBody(analysisRequestSchema),
  async (req, res, next) => {
    try {
      const report = await analyzeWebsite(req.body);
      res.json({ report });
    } catch (error) {
      next(error);
    }
  },
);

analysisRouter.post(
  "/chat",
  validateBody(chatRequestSchema),
  async (req, res, next) => {
    try {
      const message = await chatWithScout(req.body);
      res.json({ message });
    } catch (error) {
      next(error);
    }
  },
);

analysisRouter.post("/save", validateBody(analysisReportSchema), async (req, res, next) => {
  try {
    const project = await saveProject(req.userId ?? "demo-user", req.body);
    res.json({ project });
  } catch (error) {
    next(error);
  }
});
