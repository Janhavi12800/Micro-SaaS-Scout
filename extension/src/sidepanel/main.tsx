import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Bot, Lightbulb, Send, Sparkles, Wrench } from "lucide-react";
import type { AnalysisReport, ChatMessage } from "@micro-saas-scout/shared";
import { demoReport } from "@micro-saas-scout/shared";
import { chat } from "../lib/api";
import { Logo } from "../components/Logo";
import "../styles.css";

function SidePanel() {
  const [report, setReport] = useState<AnalysisReport>(demoReport);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ask me how to improve this business, what to build, or how to make it go viral.",
    },
  ]);
  const [input, setInput] = useState("What micro-SaaS should I build from this?");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_LATEST_REPORT" }).then((response) => {
      if (response?.report) setReport(response.report);
    });
  }, []);

  async function sendMessage() {
    if (!input.trim()) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const response = await chat({
        report,
        messages: next,
        provider: "openai",
      });
      setMessages([...next, response.message]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Demo fallback: choose the narrowest buyer with urgent pain, ship a concierge MVP, price from the ROI, and use teardown content as the acquisition loop.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sidepanel-shell">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="sidepanel-header">
        <Logo />
        <span className="status-pill">
          Pro-ready
        </span>
      </div>

      <section className="panel-card hero-panel">
        <div className="eyebrow">
          <Sparkles size={14} />
          Scout report
        </div>
        <h1 className="panel-title">{report.title}</h1>
        <p className="panel-copy">{report.executiveSummary}</p>
        <div className="panel-score-grid">
          {Object.entries(report.scores).map(([key, score]) => (
            <div key={key} className="score-card">
              <div className="score-value">{score.value}</div>
              <div className="score-label">{key}</div>
              <div className="score-track">
                <div className="score-fill" style={{ width: `${score.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-section-grid">
        <div className="panel-card">
          <div className="section-title">
            <Lightbulb size={16} />
            Best ideas
          </div>
          {report.saasIdeas.map((idea) => (
            <div key={idea.name} className="idea-card side-idea-card">
              <div className="idea-name">{idea.name}</div>
              <div className="idea-tagline">{idea.solution}</div>
            </div>
          ))}
        </div>

        <div className="panel-card">
          <div className="section-title">
            <Wrench size={16} />
            Build this
          </div>
          <ul className="feature-list">
            {report.buildPlan.mvpFeatures.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel-card chat-card">
        <div className="section-title">
          <Bot size={16} />
          AI chat assistant
        </div>
        <div className="message-list">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={message.role === "user" ? "message message-user" : "message message-ai"}
            >
              {message.content}
            </div>
          ))}
          {loading && <div className="typing-line">Scout is typing...</div>}
        </div>
        <div className="chat-input-row">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void sendMessage();
            }}
            className="chat-input"
          />
          <button
            onClick={sendMessage}
            className="send-button"
          >
            <Send size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<SidePanel />);
