import { Badge } from "@afenda/ui";
import {
  catalogStatusBadge,
  moduleReadinessVerdictBadge,
} from "../../overview/surfaces/system-admin.control-list.shared";

type ApprovalDetailBadgeTone = "positive" | "attention" | "critical" | "default";

const LIST_CELL_TONE_TO_BADGE_VARIANT = {
  positive: "success",
  attention: "warning",
  critical: "critical",
  default: "secondary",
} as const satisfies Record<
  ApprovalDetailBadgeTone,
  "success" | "warning" | "critical" | "secondary"
>;

function resolveBadgeTone(
  cellKind: ReturnType<typeof catalogStatusBadge>,
): ApprovalDetailBadgeTone {
  return cellKind.kind === "badge" ? (cellKind.tone ?? "default") : "default";
}

function GovernedToneBadge({
  value,
  tone,
}: {
  value: string;
  tone: ApprovalDetailBadgeTone;
}) {
  return (
    <Badge variant={LIST_CELL_TONE_TO_BADGE_VARIANT[tone]}>{value}</Badge>
  );
}

export function SystemAdminApprovalStatusBadge({ status }: { status: string }) {
  return (
    <GovernedToneBadge
      value={status}
      tone={resolveBadgeTone(catalogStatusBadge(status))}
    />
  );
}

export function SystemAdminApprovalReadinessBadge({
  verdict,
}: {
  verdict: string;
}) {
  return (
    <GovernedToneBadge
      value={verdict}
      tone={resolveBadgeTone(moduleReadinessVerdictBadge(verdict))}
    />
  );
}

export function SystemAdminApprovalEnabledBadge({
  enabled,
  enabledLabel,
  disabledLabel,
}: {
  enabled: boolean;
  enabledLabel: string;
  disabledLabel: string;
}) {
  return (
    <Badge variant={enabled ? "success" : "secondary"}>
      {enabled ? enabledLabel : disabledLabel}
    </Badge>
  );
}
