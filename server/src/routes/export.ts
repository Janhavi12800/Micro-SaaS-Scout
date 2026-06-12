import { Router } from "express";
import { z } from "zod";
import { analysisReportSchema } from "@micro-saas-scout/shared";
import { validateBody } from "../middleware/validate.js";
import {
  renderJson,
  renderMarkdown,
  renderNotion,
  renderPdf,
  type ExportFormat,
} from "../services/exports.js";

const exportBodySchema = z.object({
  format: z.enum(["json", "markdown", "notion", "pdf"]),
  report: analysisReportSchema,
});
type ExportBody = z.infer<typeof exportBodySchema>;

const mimeByFormat: Record<ExportFormat, string> = {
  json: "application/json",
  markdown: "text/markdown",
  notion: "text/markdown",
  pdf: "application/pdf",
};

export const exportRouter = Router();

exportRouter.post("/", validateBody(exportBodySchema), async (req, res, next) => {
  try {
    const { format, report } = req.body as ExportBody;
    res.setHeader("content-type", mimeByFormat[format]);
    res.setHeader(
      "content-disposition",
      `attachment; filename="micro-saas-scout-${report.id}.${format === "pdf" ? "pdf" : "md"}"`,
    );

    if (format === "json") return res.send(renderJson(report));
    if (format === "markdown") return res.send(renderMarkdown(report));
    if (format === "notion") return res.send(renderNotion(report));

    const pdf = await renderPdf(report);
    return res.send(pdf);
  } catch (error) {
    return next(error);
  }
});
