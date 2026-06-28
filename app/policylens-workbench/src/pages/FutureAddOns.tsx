import { useState } from "react";
import { useStore } from "../store";
import { answerFor, type SearchHit } from "../logic/searchAssistant";
import { StatusBadge } from "../components/StatusBadge";
import {
  Sparkles,
  Network,
  FileUp,
  Plug,
  Globe,
  FlaskConical,
  ShieldHalf,
  Search,
  Send,
} from "lucide-react";

const ADDONS = [
  { icon: Sparkles, title: "RAG policy assistant", desc: "Retrieval-augmented Q&A grounded in policy text with citations. A deterministic, offline preview is available below today." },
  { icon: Network, title: "FHIR / Da Vinci mapping", desc: "Map extracted rules to CRD, DTR, and PAS workflows for standards-based prior authorization." },
  { icon: FileUp, title: "PDF & document ingestion", desc: "Upload real policy PDFs and auto-extract clauses, versions, and candidate rules." },
  { icon: Plug, title: "Claims system connector", desc: "Stream live claims to evaluate rules against production volume with guardrails." },
  { icon: Globe, title: "Provider portal", desc: "Give providers transparency into requirements, pends, and reasons before submission." },
  { icon: FlaskConical, title: "Model evaluation harness", desc: "Benchmark LLM rule-extraction quality against human-validated gold sets." },
  { icon: ShieldHalf, title: "Enterprise RBAC & SSO", desc: "Role-based access, approval chains, and audit-grade identity for regulated teams." },
];

export function FutureAddOns() {
  const { domain } = useStore();
  const [query, setQuery] = useState("What documentation is required?");
  const [submitted, setSubmitted] = useState<{ answer: string; hits: SearchHit[] } | null>(null);

  const run = () => setSubmitted(answerFor(domain, query));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-800">Future Add-ons</h1>
        <p className="mt-1 text-sm text-slate-500">
          The roadmap beyond the MVP. These are intentionally marked as future work; the items below are not yet
          wired into operational flows.
        </p>
      </div>

      {/* Working preview of the future RAG assistant */}
      <div className="card card-pad">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold text-navy-800">
            <Search size={16} className="text-teal-600" /> Policy assistant — working offline preview
          </p>
          <StatusBadge tone="ok">Functional preview</StatusBadge>
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Deterministic keyword retrieval over {domain.name} {domain.newVersion} — no API key, fully grounded with
          citations. This stands in for the future RAG assistant.
        </p>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="Ask about documentation, timelines, thresholds…"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
          />
          <button className="btn-primary" onClick={run}>
            <Send size={15} /> Ask
          </button>
        </div>
        {submitted && (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-3 text-sm text-navy-700">
              {submitted.answer}
            </div>
            {submitted.hits.length > 0 && (
              <div className="space-y-2">
                <p className="eyebrow">Grounded matches</p>
                {submitted.hits.map((h, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-navy-700">{h.title}</span>
                      <StatusBadge tone="neutral">{h.kind}</StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{h.text}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{h.citation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ADDONS.map((a) => (
          <div key={a.title} className="card card-pad relative overflow-hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                <a.icon size={20} />
              </span>
              <p className="text-sm font-semibold text-navy-800">{a.title}</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{a.desc}</p>
            <div className="mt-4">
              <StatusBadge tone="warn">Coming soon</StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
