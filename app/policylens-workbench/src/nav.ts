export interface NavItem {
  id: string;
  label: string;
  icon: string;
  group: "Operate" | "Analyze" | "Govern";
}

export const NAV_ITEMS: NavItem[] = [
  { id: "command-center", label: "Command Center", icon: "gauge", group: "Operate" },
  { id: "policy-library", label: "Policy Library", icon: "library", group: "Operate" },
  { id: "version-diff", label: "Version Diff", icon: "git-compare", group: "Analyze" },
  { id: "impact-map", label: "Impact Map", icon: "network", group: "Analyze" },
  { id: "rule-studio", label: "Rule Studio", icon: "sliders", group: "Operate" },
  { id: "scenario-lab", label: "Scenario Lab", icon: "flask", group: "Analyze" },
  { id: "qa-tests", label: "QA Tests", icon: "check-checks", group: "Analyze" },
  { id: "reviewer-queue", label: "Reviewer Queue", icon: "inbox", group: "Operate" },
  { id: "audit-pack", label: "Audit Pack", icon: "package", group: "Govern" },
  { id: "future-addons", label: "Future Add-ons", icon: "sparkles", group: "Govern" },
  { id: "responsible-use", label: "Responsible Use", icon: "scale", group: "Govern" },
];

export const DEFAULT_PAGE = "command-center";
