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
    <div className="min-h-screen p-4">
      <div className="mb-4 flex items-center justify-between">
        <Logo />
        <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-[11px] text-violet-100">
          Pro-ready
        </span>
      </div>

      <section className="glass rounded-[2rem] p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
          <Sparkles size={14} />
          Scout report
        </div>
        <h1 className="mt-3 text-2xl font-black text-white">{report.title}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{report.executiveSummary}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {Object.entries(report.scores).map(([key, score]) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="text-xl font-bold text-white">{score.value}</div>
              <div className="text-[11px] capitalize text-zinc-500">{key}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-3">
        <div className="glass rounded-3xl p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Lightbulb size={16} className="text-sky-300" />
            Best ideas
          </div>
          {report.saasIdeas.map((idea) => (
            <div key={idea.name} className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="text-sm font-semibold text-white">{idea.name}</div>
              <div className="mt-1 text-xs leading-5 text-zinc-400">{idea.solution}</div>
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Wrench size={16} className="text-sky-300" />
            Build this
          </div>
          <ul className="space-y-2 text-sm text-zinc-300">
            {report.buildPlan.mvpFeatures.map((feature) => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="glass mt-4 rounded-[2rem] p-4">
        <div className="mb-3 flex items-center gap-2 font-semibold text-white">
          <Bot size={16} className="text-violet-300" />
          AI chat assistant
        </div>
        <div className="max-h-80 space-y-3 overflow-auto pr-1">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === "user"
                  ? "ml-8 rounded-2xl bg-sky-400/15 p-3 text-sm text-sky-50"
                  : "mr-8 rounded-2xl bg-white/10 p-3 text-sm leading-6 text-zinc-200"
              }
            >
              {message.content}
            </div>
          ))}
          {loading && <div className="text-xs text-zinc-500">Scout is typing...</div>}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void sendMessage();
            }}
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none"
          />
          <button
            onClick={sendMessage}
            className="rounded-2xl bg-gradient-to-r from-violet-500 to-sky-400 p-3 text-white"
          >
            <Send size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<SidePanel />);
