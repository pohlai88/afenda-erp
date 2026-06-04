import type { ListColumn, ListSurfaceRow } from "@afenda/governed-surface/schemas";

import { systemAdminControlLinks } from "../overview/sys-control-links.contract";
import {
  catalogStatusBadge,
  linkCell,
  moduleReadinessVerdictBadge,
} from "../overview/sys-control-list.shared";
import type {
  SystemAdminApprovalMode,
  SystemAdminApprovalRuleListRow,
} from "./sys-approval-rule.contract";
import {
  systemAdminApprovalReadinessLabels,
  systemAdminApprovalStatusLabels,
} from "./sys-approvals-detail-badges.shared";
import { resolveSystemAdminApprovalRowTrailingAction } from "./sys-approvals-list-trailing.shared";
import { systemAdminApprovalsUiCopy } from "./sys-approvals-ui.copy.shared";

export const systemAdminApprovalModeLabels = {
  sequential: systemAdminApprovalsUiCopy.editor.modes.sequential,
  parallel: systemAdminApprovalsUiCopy.editor.modes.parallel,
} as const satisfies Record<SystemAdminApprovalMode, string>;

export function resolveApprovalRuleModeLabel(
  mode: SystemAdminApprovalMode,
): string {
  return systemAdminApprovalModeLabels[mode];
}

export function resolveApprovalTargetTypeLabel(targetType: string): string {
  const labels = systemAdminApprovalsUiCopy.list.targetTypeLabels;

  if (targetType in labels) {
    return labels[targetType as keyof typeof labels];
  }

  return targetType;
}

export function resolveApprovalListRowTone(
  approval: Pick<
    SystemAdminApprovalRuleListRow,
    "status" | "readinessVerdict"
  >,
): NonNullable<ListSurfaceRow["rowTone"]> {
  if (
    approval.status === "deprecated" ||
    approval.readinessVerdict === "blocked"
  ) {
    return "critical";
  }

  if (
    approval.readinessVerdict === "warning" ||
    approval.status === "disabled"
  ) {
    return "attention";
  }

  return "default";
}

export function buildSystemAdminApprovalsListColumns(
  columns = systemAdminApprovalsUiCopy.list.columns,
): ListColumn[] {
  return [
    {
      id: "name",
      header: columns.name,
      priority: "primary",
      pin: "start",
      wrap: true,
      minWidth: 200,
      cellKind: { kind: "link" },
    },
    {
      id: "moduleKey",
      header: columns.moduleKey,
      cellKind: { kind: "link" },
    },
    {
      id: "action",
      header: columns.action,
      wrap: true,
      minWidth: 180,
    },
    { id: "targetType", header: columns.targetType },
    { id: "approvalMode", header: columns.approvalMode },
    { id: "approverRoles", header: columns.approverRoles, wrap: true },
    { id: "minApprovals", header: columns.minApprovals },
    {
      id: "escalation",
      header: columns.escalation,
      wrap: true,
      minWidth: 160,
    },
    {
      id: "status",
      header: columns.status,
      cellKind: { kind: "badge" },
    },
    {
      id: "readinessVerdict",
      header: columns.readinessVerdict,
      cellKind: { kind: "badge" },
    },
  ];
}

export function mapApprovalRuleToListSurfaceRow(input: {
  approval: SystemAdminApprovalRuleListRow;
  searchValue?: string;
  canMutate: boolean;
}): Pick<
  ListSurfaceRow,
  | "id"
  | "cells"
  | "rowHref"
  | "linkColumnId"
  | "cellKinds"
  | "trailingAction"
  | "rowTone"
> {
  const { approval } = input;
  const approvalHref = systemAdminControlLinks.approval(
    approval.key,
    input.searchValue,
  );

  return {
    id: approval.key,
    rowHref: approvalHref,
    linkColumnId: "name",
    rowTone: resolveApprovalListRowTone(approval),
    trailingAction: resolveSystemAdminApprovalRowTrailingAction({
      status: approval.status,
      enabled: approval.enabled,
      canMutate: input.canMutate,
    }),
    cells: {
      name: approval.name,
      moduleKey: approval.moduleKey,
      action: approval.action,
      targetType: resolveApprovalTargetTypeLabel(approval.targetType),
      approvalMode: resolveApprovalRuleModeLabel(approval.approvalMode),
      approverRoles: approval.approverRoles,
      minApprovals: String(approval.minApprovals),
      escalation: approval.escalation,
      status: systemAdminApprovalStatusLabels[approval.status],
      enabled: String(approval.enabled),
      readinessVerdict:
        systemAdminApprovalReadinessLabels[approval.readinessVerdict],
    },
    cellKinds: {
      name: linkCell(approvalHref),
      moduleKey: linkCell(
        systemAdminControlLinks.modules(approval.moduleKey),
      ),
      status: catalogStatusBadge(approval.status),
      readinessVerdict: moduleReadinessVerdictBadge(
        approval.readinessVerdict,
      ),
    },
  };
}
