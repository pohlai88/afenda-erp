import type { ComponentProps } from "react";

import type { ListSurfaceRow } from "@afenda/governed-surface/schemas";
import type { Badge } from "@afenda/ui/badge";

import {
  catalogStatusBadge,
  moduleReadinessVerdictBadge,
} from "../../overview/surfaces/system-admin.control-list.shared";
import type {
  ApprovalReadinessVerdict,
  SystemAdminApprovalRuleStatus,
} from "../contracts/system-admin.approval-rule.contract";
import { systemAdminApprovalsUiCopy } from "./system-admin.approvals-ui.copy.shared";

type ApprovalBadgeCellKind = NonNullable<ListSurfaceRow["cellKinds"]>[string];
type ListCellTone = "default" | "positive" | "attention" | "critical";

export type SystemAdminApprovalDetailBadgeVariant = NonNullable<
  ComponentProps<typeof Badge>["variant"]
>;

export type SystemAdminApprovalBadgePresentation = {
  label: string;
  variant: SystemAdminApprovalDetailBadgeVariant;
};

export const systemAdminListCellToneToBadgeVariant = {
  positive: "success",
  attention: "warning",
  critical: "critical",
  default: "secondary",
} as const satisfies Record<ListCellTone, SystemAdminApprovalDetailBadgeVariant>;

export const systemAdminApprovalStatusLabels = {
  active: systemAdminApprovalsUiCopy.editor.statuses.active,
  disabled: systemAdminApprovalsUiCopy.editor.statuses.disabled,
  deprecated: systemAdminApprovalsUiCopy.editor.statuses.deprecated,
} as const satisfies Record<SystemAdminApprovalRuleStatus, string>;

export const systemAdminApprovalReadinessLabels = {
  ready: systemAdminApprovalsUiCopy.detail.badges.readiness.ready,
  warning: systemAdminApprovalsUiCopy.detail.badges.readiness.warning,
  blocked: systemAdminApprovalsUiCopy.detail.badges.readiness.blocked,
} as const satisfies Record<ApprovalReadinessVerdict, string>;

export const systemAdminApprovalEnabledLabels = {
  true: systemAdminApprovalsUiCopy.editor.enabledOptions.true,
  false: systemAdminApprovalsUiCopy.editor.enabledOptions.false,
} as const;

export const systemAdminApprovalEnabledBadgeVariants = {
  true: "success",
  false: "secondary",
} as const satisfies Record<"true" | "false", SystemAdminApprovalDetailBadgeVariant>;

const badgeFieldLabels = systemAdminApprovalsUiCopy.detail.fields;

export function resolveSystemAdminListCellTone(
  cellKind: ApprovalBadgeCellKind,
): ListCellTone {
  return cellKind.kind === "badge" ? (cellKind.tone ?? "default") : "default";
}

export function resolveSystemAdminListCellBadgeVariant(
  cellKind: ApprovalBadgeCellKind,
): SystemAdminApprovalDetailBadgeVariant {
  return systemAdminListCellToneToBadgeVariant[resolveSystemAdminListCellTone(cellKind)];
}

export function systemAdminApprovalStatusBadgeVariant(
  status: SystemAdminApprovalRuleStatus,
): SystemAdminApprovalDetailBadgeVariant {
  return resolveSystemAdminListCellBadgeVariant(catalogStatusBadge(status));
}

export function systemAdminApprovalReadinessBadgeVariant(
  verdict: ApprovalReadinessVerdict,
): SystemAdminApprovalDetailBadgeVariant {
  return resolveSystemAdminListCellBadgeVariant(
    moduleReadinessVerdictBadge(verdict),
  );
}

export function systemAdminApprovalEnabledBadgeVariant(
  enabled: boolean,
): SystemAdminApprovalDetailBadgeVariant {
  return systemAdminApprovalEnabledBadgeVariants[String(enabled) as "true" | "false"];
}

export function resolveSystemAdminApprovalStatusBadgePresentation(
  status: SystemAdminApprovalRuleStatus,
): SystemAdminApprovalBadgePresentation {
  return {
    label: systemAdminApprovalStatusLabels[status],
    variant: systemAdminApprovalStatusBadgeVariant(status),
  };
}

export function resolveSystemAdminApprovalReadinessBadgePresentation(
  verdict: ApprovalReadinessVerdict,
): SystemAdminApprovalBadgePresentation {
  return {
    label: systemAdminApprovalReadinessLabels[verdict],
    variant: systemAdminApprovalReadinessBadgeVariant(verdict),
  };
}

export function resolveSystemAdminApprovalEnabledBadgePresentation(
  enabled: boolean,
): SystemAdminApprovalBadgePresentation {
  return {
    label: enabled
      ? systemAdminApprovalEnabledLabels.true
      : systemAdminApprovalEnabledLabels.false,
    variant: systemAdminApprovalEnabledBadgeVariant(enabled),
  };
}

export function systemAdminApprovalStatusBadgeAriaLabel(
  status: SystemAdminApprovalRuleStatus,
): string {
  return `${badgeFieldLabels.status}: ${systemAdminApprovalStatusLabels[status]}`;
}

export function systemAdminApprovalReadinessBadgeAriaLabel(
  verdict: ApprovalReadinessVerdict,
): string {
  return `${badgeFieldLabels.readiness}: ${systemAdminApprovalReadinessLabels[verdict]}`;
}

export function systemAdminApprovalEnabledBadgeAriaLabel(enabled: boolean): string {
  const label = enabled
    ? systemAdminApprovalEnabledLabels.true
    : systemAdminApprovalEnabledLabels.false;

  return `${badgeFieldLabels.enabled}: ${label}`;
}
