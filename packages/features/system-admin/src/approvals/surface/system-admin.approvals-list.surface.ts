import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";
import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import {
  buildLinkedControlListSurface,
  catalogStatusBadge,
  linkCell,
  moduleReadinessVerdictBadge,
} from "../../overview/surfaces/system-admin.control-list.shared";
import type { SystemAdminApprovalRuleListRow } from "../contracts/system-admin.approval-rule.contract";
import { resolveSystemAdminApprovalRowTrailingAction } from "./system-admin.approvals-list-trailing.shared";
import { systemAdminApprovalsUiCopy } from "./system-admin.approvals-ui.copy.shared";

export const systemAdminApprovalsSurfaceKey = "system-admin.approvals.list";

export function buildApprovalsListSurface(input: {
  approvals: readonly SystemAdminApprovalRuleListRow[];
  searchValue?: string;
  canMutate?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canMutate = input.canMutate ?? false;
  const copy = systemAdminApprovalsUiCopy.list;
  const columns = copy.columns;

  return buildLinkedControlListSurface({
    key: systemAdminApprovalsSurfaceKey,
    title: copy.title,
    object: "approvals",
    columns: [
      {
        id: "name",
        header: columns.name,
        priority: "primary",
        pin: "start",
        cellKind: { kind: "link" },
      },
      { id: "moduleKey", header: columns.moduleKey, cellKind: { kind: "link" } },
      { id: "action", header: columns.action },
      { id: "targetType", header: columns.targetType },
      { id: "approvalMode", header: columns.approvalMode },
      { id: "approverRoles", header: columns.approverRoles },
      { id: "minApprovals", header: columns.minApprovals },
      { id: "escalation", header: columns.escalation },
      { id: "status", header: columns.status, cellKind: { kind: "badge" } },
      {
        id: "readinessVerdict",
        header: columns.readinessVerdict,
        cellKind: { kind: "badge" },
      },
    ],
    rows: input.approvals.map((approval) => ({
      id: approval.key,
      rowHref: systemAdminControlLinks.approval(
        approval.key,
        input.searchValue,
      ),
      linkColumnId: "name",
      trailingAction: resolveSystemAdminApprovalRowTrailingAction({
        enabled: approval.enabled,
        canMutate,
      }),
      cells: {
        name: approval.name,
        moduleKey: approval.moduleKey,
        action: approval.action,
        targetType: approval.targetType,
        approvalMode: approval.approvalMode,
        approverRoles: approval.approverRoles,
        minApprovals: String(approval.minApprovals),
        escalation: approval.escalation,
        status: approval.status,
        enabled: String(approval.enabled),
        readinessVerdict: approval.readinessVerdict,
      },
      cellKinds: {
        name: linkCell(
          systemAdminControlLinks.approval(approval.key, input.searchValue),
        ),
        moduleKey: linkCell(systemAdminControlLinks.modules(approval.moduleKey)),
        status: catalogStatusBadge(approval.status),
        readinessVerdict: moduleReadinessVerdictBadge(approval.readinessVerdict),
      },
    })),
    emptyTitle: copy.emptyTitle,
    emptyDescription: canMutate
      ? copy.emptyDescription
      : copy.emptyDescriptionReadOnly,
    searchPlaceholder: copy.searchPlaceholder,
    searchValue: input.searchValue,
  });
}
