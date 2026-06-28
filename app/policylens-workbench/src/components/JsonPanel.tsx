import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

function highlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="json-str">"$1"</span>')
    .replace(/: (true|false)/g, ': <span class="json-bool">$1</span>')
    .replace(/: (-?\d+\.?\d*)/g, ': <span class="json-num">$1</span>');
}

export function JsonPanel({
  data,
  title,
  filename,
  maxHeight = "28rem",
}: {
  data: unknown;
  title?: string;
  filename?: string;
  maxHeight?: string;
}) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename ?? "policylens-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <span className="font-mono text-xs text-slate-500">{title ?? "json"}</span>
        <div className="flex gap-2">
          <button className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={copy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
          {filename && (
            <button className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={download}>
              <Download size={14} />
              Download
            </button>
          )}
        </div>
      </div>
      <pre
        className="json-panel !rounded-none !border-0"
        style={{ maxHeight }}
        dangerouslySetInnerHTML={{ __html: highlight(json) }}
      />
    </div>
  );
}
