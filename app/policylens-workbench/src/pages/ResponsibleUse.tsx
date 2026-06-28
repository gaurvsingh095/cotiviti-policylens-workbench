import { RESPONSIBLE_USE_NOTE } from "../logic/auditPack";
import {
  ShieldCheck,
  UserCheck,
  Lock,
  FileSearch,
  Ban,
  GitBranch,
} from "lucide-react";

const PRINCIPLES = [
  { icon: Lock, title: "Synthetic data only", body: "Every domain, case, and rule in this workbench is fabricated for demonstration. There is no PHI and no real patient, provider, or payment data anywhere in the app." },
  { icon: Ban, title: "No real decisions", body: "PolicyLens does not make real medical, payment, or coverage decisions. Outputs are illustrative and route to human review by design." },
  { icon: UserCheck, title: "Human validation required", body: "Every extracted rule is a candidate. A qualified reviewer must approve, reject, or request revision before any rule could be considered for operational use." },
  { icon: FileSearch, title: "Source traceability", body: "Each rule and finding cites the exact policy clause it came from, so a reviewer can always verify the origin of any statement or decision." },
  { icon: GitBranch, title: "Deterministic & explainable", body: "The evaluation engine is plain, testable logic — not a black-box model. The same inputs always produce the same outputs, which keeps results auditable." },
  { icon: ShieldCheck, title: "Privacy by construction", body: "The app runs entirely in the browser on local state with no external API calls and no API keys, so no data leaves the machine." },
];

export function ResponsibleUse() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-800">Responsible Use</h1>
        <p className="mt-1 text-sm text-slate-500">
          How PolicyLens Workbench is designed to be used safely and the boundaries it operates within.
        </p>
      </div>

      <div className="rounded-xl border border-navy-200 bg-navy-50/60 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-navy-800">
          <ShieldCheck size={18} /> Statement of responsible use
        </p>
        <p className="mt-2 text-sm leading-relaxed text-navy-700">{RESPONSIBLE_USE_NOTE}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="card card-pad">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <p.icon size={20} />
            </span>
            <p className="mt-3 text-sm font-semibold text-navy-800">{p.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="card card-pad">
        <p className="text-sm font-semibold text-navy-800">Intended use</p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
          This is a proof-of-concept for demonstrating a policy-operations workflow: turning written policy into
          structured, source-cited, human-reviewed rules with synthetic QA and exportable audit trails. It is suitable
          for internal demos, design discussions, and evaluation — not for production use against real data without the
          appropriate engineering, validation, security, and compliance controls in place.
        </p>
      </div>
    </div>
  );
}
