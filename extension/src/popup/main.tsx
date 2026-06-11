import { useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import { ArrowRight, Download, PanelRightOpen, Save, Sparkles } from "lucide-react";
import type { AnalysisReport, AnalysisRequest } from "@micro-saas-scout/shared";
import { demoReport } from "@micro-saas-scout/shared";
import { Logo } from "../components/Logo";
import { ScorePill } from "../components/ScorePill";
import "../styles.css";

function Popup() {
  const [mode, setMode] = useState<AnalysisRequest["mode"]>("standard");
  const [report, setReport] = useState<AnalysisReport>(demoReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzePage() {
    setLoading(true);
    setError("");
    const response = await chrome.runtime.sendMessage({ type: "ANALYZE_CURRENT_TAB", mode });
    setLoading(false);
    if (response?.error) {
      setError(response.error);
      return;
    }
    setReport(response.report);
  }

  async function saveReport() {
    await chrome.runtime.sendMessage({ type: "SAVE_REPORT", report });
  }

  async function openSidePanel() {
    await chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" });
  }

  return (
    <div className="w-[390px] p-4">
      <div className="glass rounded-[2rem] p-4">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            onClick={openSidePanel}
            className="rounded-2xl border border-white/10 bg-white/10 p-2 text-sky-200"
            title="Open side panel"
          >
            <PanelRightOpen size={18} />
          </button>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-black/35 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
            <Sparkles size={14} />
            Current tab intelligence
          </div>
          <h1 className="mt-3 text-2xl font-black leading-tight text-white">
            Find hidden micro-SaaS opportunities here.
          </h1>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as AnalysisRequest["mode"])}
            className="mt-4 w-full rounded-2xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="standard">Standard analysis</option>
            <option value="hidden-opportunities">Find Hidden SaaS Opportunities</option>
            <option value="roast">Roast This Startup</option>
            <option value="clone-better">Clone This Business Better</option>
            <option value="roadmap">Build This roadmap</option>
          </select>
          <button
            onClick={analyzePage}
            disabled={loading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-sky-400 px-4 py-3 text-sm font-bold text-white shadow-glow disabled:opacity-60"
          >
            {loading ? "Scanning website..." : "Analyze current website"}
            <ArrowRight size={16} />
          </button>
          {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className="text-xs text-zinc-500">{report.url}</div>
          <h2 className="mt-1 text-lg font-bold text-white">{report.title}</h2>
          <p className="mt-2 line-clamp-4 text-sm leading-6 text-zinc-300">{report.executiveSummary}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <ScorePill label="demand" value={report.scores.marketDemand.value} />
            <ScorePill label="viral" value={report.scores.viralPotential.value} />
            <ScorePill label="scale" value={report.scores.scalability.value} />
          </div>
          <div className="mt-4 space-y-2">
            {report.saasIdeas.slice(0, 2).map((idea) => (
              <div key={idea.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                <div className="text-sm font-semibold text-white">{idea.name}</div>
                <div className="mt-1 text-xs text-zinc-500">{idea.tagline}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={saveReport}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white"
            >
              <Save size={14} /> Save
            </button>
            <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white">
              <Download size={14} /> Export
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Popup />);
