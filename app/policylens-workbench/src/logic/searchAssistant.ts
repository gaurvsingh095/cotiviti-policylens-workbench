import type { PolicyDomain } from "../types/policy";

// A deterministic, offline "search assistant" — no LLM, no API key. It does
// keyword retrieval over the domain's clauses and rules and returns grounded
// snippets with citations. This stands in for the future RAG assistant while
// being fully functional and explainable today.

export interface SearchHit {
  kind: "clause" | "rule" | "summary";
  title: string;
  text: string;
  citation: string;
  score: number;
}

function score(haystack: string, terms: string[]): number {
  const h = haystack.toLowerCase();
  let s = 0;
  for (const t of terms) {
    if (!t) continue;
    if (h.includes(t)) s += 2;
    // partial token credit
    else if (t.length > 4 && h.includes(t.slice(0, Math.ceil(t.length * 0.7)))) s += 1;
  }
  return s;
}

export function searchDomain(dom: PolicyDomain, query: string): SearchHit[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
  if (!terms.length) return [];

  const hits: SearchHit[] = [];

  dom.summary.forEach((s, i) => {
    const sc = score(s, terms);
    if (sc > 0) hits.push({ kind: "summary", title: `Summary point ${i + 1}`, text: s, citation: `${dom.name} ${dom.newVersion} summary`, score: sc });
  });

  dom.changedClauses.forEach((c) => {
    const sc = score(`${c.newText} ${c.oldText} ${c.note}`, terms);
    if (sc > 0)
      hits.push({
        kind: "clause",
        title: c.changeType.replace(/_/g, " ").toLowerCase(),
        text: c.newText || c.oldText,
        citation: `${dom.name} ${dom.newVersion} clause change`,
        score: sc + 1,
      });
  });

  dom.rules.forEach((r) => {
    const sc = score(`${r.condition} ${r.action} ${r.sourceClause} ${r.ruleType}`, terms);
    if (sc > 0)
      hits.push({
        kind: "rule",
        title: `${r.ruleId} · ${r.condition}`,
        text: r.sourceClause,
        citation: `Rule ${r.ruleId} (${r.severity})`,
        score: sc + 1,
      });
  });

  return hits.sort((a, b) => b.score - a.score).slice(0, 6);
}

export function answerFor(dom: PolicyDomain, query: string): { answer: string; hits: SearchHit[] } {
  const hits = searchDomain(dom, query);
  if (!hits.length) {
    return {
      answer: `No grounded match in ${dom.name} ${dom.newVersion}. Try terms like "documentation", "timeline", "duplicate", or "threshold".`,
      hits,
    };
  }
  const top = hits[0];
  return {
    answer: `Based on ${dom.name} ${dom.newVersion}: ${top.text} (${top.citation}).`,
    hits,
  };
}
