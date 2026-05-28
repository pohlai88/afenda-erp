import type {
  ListSurfaceRendererConfigurationResolvedInput,
} from "@afenda/governed-surface/schemas";
import { systemAdminControlLinks } from "../../contracts/system-admin.control-links.contract";
import {
  buildLinkedControlListSurface,
  catalogStatusBadge,
  linkCell,
} from "../../surfaces/system-admin.control.surface";
import type { SystemAdminApprovalRuleListRow } from "../contracts/system-admin.approval-rule.contract";

export const systemAdminApprovalsSurfaceKey = "system-admin.approvals.list";

export function buildApprovalsListSurface(input: {
  approvals: readonly SystemAdminApprovalRuleListRow[];
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminApprovalsSurfaceKey,
    title: "Approval rules",
    object: "approvals",
    columns: [
      { id: "name", header: "Rule", priority: "primary", pin: "start", cellKind: { kind: "link" } },
      { id: "moduleKey", header: "Module", cellKind: { kind: "link" } },
      { id: "action", header: "Action" },
      { id: "targetType", header: "Target" },
      { id: "approverRoles", header: "Approvers" },
      { id: "minApprovals", header: "Min approvals" },
      { id: "escalation", header: "Escalation" },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
    ],
    rows: input.approvals.map((approval) => ({
      id: approval.id,
      cells: {
        name: approval.name,
        moduleKey: approval.moduleKey,
        action: approval.action,
        targetType: approval.targetType,
        approverRoles: approval.approverRoles,
        minApprovals: String(approval.minApprovals),
        escalation: approval.escalation,
        status: approval.status,
      },
      cellKinds: {
        name: linkCell(systemAdminControlLinks.approvals(approval.key)),
        moduleKey: linkCell(systemAdminControlLinks.modules(approval.moduleKey)),
        status: catalogStatusBadge(approval.status),
      },
    })),
    emptyTitle: "No approval rules are configured for this organization.",
    searchValue: input.searchValue,
  });
}
