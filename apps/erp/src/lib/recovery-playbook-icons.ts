import type { RecoveryPlaybookIconKey } from "@afenda/kernel";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Boxes,
  ChartLine,
  ClipboardCheck,
  Scale,
  Shield,
  TrendingDown,
} from "lucide-react";

const recoveryPlaybookIcons = {
  "trending-down": TrendingDown,
  banknote: Banknote,
  boxes: Boxes,
  "clipboard-check": ClipboardCheck,
  "chart-line": ChartLine,
  scale: Scale,
  shield: Shield,
} as const satisfies Record<RecoveryPlaybookIconKey, LucideIcon>;

export function getRecoveryPlaybookIcon(iconKey: RecoveryPlaybookIconKey) {
  return recoveryPlaybookIcons[iconKey];
}
