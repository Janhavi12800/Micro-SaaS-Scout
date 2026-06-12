import { useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import { ArrowRight, Download, PanelRightOpen, Save, Sparkles } from "lucide-react";
import type { AnalysisReport, AnalysisRequest } from "@micro-saas-scout/shared";
import { Logo } from "../components/Logo";
import { ScorePill } from "../components/ScorePill";
import "../styles.css";

function Popup() {
  const [mode, setMode] = useState<AnalysisRequest["mode"]>("standard");
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzePage() {
    setLoading(true);
    setError("");
    try {
      const response = await chrome.runtime.sendMessage({ type: "ANALYZE_CURRENT_TAB", mode });
      if (response?.error) {
        setError(response.error);
        return;
      }
      if (!response?.report) {
        setError("No report returned. Refresh the page and try again.");
        return;
      }
      setReport(response.report);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not analyze this page.");
    } finally {
      setLoading(false);
    }
  }

  async function saveReport() {
    if (!report) return;
    await chrome.runtime.sendMessage({ type: "SAVE_REPORT", report });
  }

  async function openSidePanel() {
    await chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" });
  }

  return (
    <div className="popup-shell">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="popup-card">
        <div className="popup-header">
          <Logo />
          <button
            onClick={openSidePanel}
            className="icon-button"
            title="Open side panel"
          >
            <PanelRightOpen size={18} />
          </button>
        </div>

        <div className="hero-card">
          <div className="eyebrow">
            <Sparkles size={14} />
            Current tab intelligence
          </div>
          <h1 className="hero-title">
            Find hidden micro-SaaS opportunities here.
          </h1>
          <p className="hero-copy">
            AI scans this website and creates a startup teardown with gaps, ideas, revenue, and roadmap.
          </p>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as AnalysisRequest["mode"])}
            className="select-input"
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
            className="primary-button"
          >
            {loading ? "Scanning website..." : "Analyze current website"}
            <ArrowRight size={16} />
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>

        {report ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="report-card">
            <div className="url-pill">{report.url}</div>
            <h2 className="report-title">{report.title}</h2>
            <p className="report-summary">{report.executiveSummary}</p>
            <div className="score-grid">
              <ScorePill label="demand" value={report.scores.marketDemand.value} />
              <ScorePill label="viral" value={report.scores.viralPotential.value} />
              <ScorePill label="scale" value={report.scores.scalability.value} />
            </div>
            <div className="idea-list">
              {report.saasIdeas.slice(0, 2).map((idea) => (
                <div key={idea.name} className="idea-card">
                  <div className="idea-name">{idea.name}</div>
                  <div className="idea-tagline">{idea.tagline}</div>
                </div>
              ))}
            </div>
            <div className="action-grid">
              <button
                onClick={saveReport}
                className="secondary-button"
              >
                <Save size={14} /> Save
              </button>
              <button className="secondary-button">
                <Download size={14} /> Export
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="empty-card">
            <div className="empty-icon"><Sparkles size={18} /></div>
            <h2 className="empty-title">No analysis yet</h2>
            <p className="empty-copy">
              Open any normal website, then click Analyze to generate a fresh AI opportunity report for that exact page.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Popup />);
