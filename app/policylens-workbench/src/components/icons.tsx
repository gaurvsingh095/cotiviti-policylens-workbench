import {
  Scan,
  Receipt,
  FileText,
  Activity,
  Award,
  Handshake,
  Landmark,
  Clipboard,
  Stethoscope,
  Shield,
  Gavel,
  Headset,
  BarChart3,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  scan: Scan,
  receipt: Receipt,
  "file-text": FileText,
  activity: Activity,
  award: Award,
  handshake: Handshake,
  landmark: Landmark,
  clipboard: Clipboard,
  stethoscope: Stethoscope,
  shield: Shield,
  gavel: Gavel,
  headset: Headset,
  "bar-chart": BarChart3,
};

export function DomainIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = MAP[name] ?? HelpCircle;
  return <Icon size={size} />;
}
