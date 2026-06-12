import PDFDocument from "pdfkit";
import type { AnalysisReport } from "@micro-saas-scout/shared";

export type ExportFormat = "json" | "markdown" | "notion" | "pdf";

export function renderMarkdown(report: AnalysisReport) {
  return [
    `# ${report.title}`,
    "",
    `**URL:** ${report.url}`,
    `**Generated:** ${report.generatedAt}`,
    "",
    "## Executive summary",
    report.executiveSummary,
    "",
    "## Opportunities",
    ...report.opportunities.map((item) => `- ${item}`),
    "",
    "## Micro-SaaS ideas",
    ...report.saasIdeas.map(
      (idea) =>
        `### ${idea.name}\n${idea.tagline}\n\n- Buyer: ${idea.targetCustomer}\n- Pain: ${idea.pain}\n- Solution: ${idea.solution}\n- Monetization: ${idea.monetization.join(", ")}`,
    ),
    "",
    "## Revenue estimate",
    `- Low: $${report.revenue.lowMonthly.toLocaleString()}/mo`,
    `- Realistic: $${report.revenue.realisticMonthly.toLocaleString()}/mo`,
    `- High: $${report.revenue.highMonthly.toLocaleString()}/mo`,
    "",
    "## Build plan",
    ...report.buildPlan.mvpFeatures.map((item) => `- ${item}`),
    "",
    "## Growth ideas",
    ...report.growthIdeas.map((item) => `- ${item}`),
  ].join("\n");
}

export function renderJson(report: AnalysisReport) {
  return JSON.stringify(report, null, 2);
}

export function renderNotion(report: AnalysisReport) {
  return [
    `# ${report.title}`,
    "> Micro-SaaS Scout opportunity report",
    "",
    `URL:: ${report.url}`,
    `MRR realistic:: $${report.revenue.realisticMonthly.toLocaleString()}`,
    "",
    "## Top bets",
    ...report.saasIdeas.map((idea) => `- **${idea.name}** - ${idea.tagline}`),
    "",
    "## Scores",
    ...Object.entries(report.scores).map(
      ([key, score]) => `- ${key}: ${score.value}/100 - ${score.label}`,
    ),
  ].join("\n");
}

export async function renderPdf(report: AnalysisReport) {
  const doc = new PDFDocument({ margin: 48 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  doc.fontSize(22).text("Micro-SaaS Scout", { continued: false });
  doc.moveDown(0.4);
  doc.fontSize(16).text(report.title);
  doc.fontSize(10).fillColor("#666").text(report.url);
  doc.moveDown();
  doc.fillColor("#111").fontSize(13).text(report.executiveSummary);
  doc.moveDown();

  doc.fontSize(15).text("Top opportunities");
  report.opportunities.forEach((item) => {
    doc.fontSize(11).text(`• ${item}`);
  });

  doc.moveDown();
  doc.fontSize(15).text("Micro-SaaS ideas");
  report.saasIdeas.forEach((idea) => {
    doc.moveDown(0.4);
    doc.fontSize(12).text(idea.name);
    doc.fontSize(10).text(idea.tagline);
    doc.fontSize(10).text(`Buyer: ${idea.targetCustomer}`);
  });

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
