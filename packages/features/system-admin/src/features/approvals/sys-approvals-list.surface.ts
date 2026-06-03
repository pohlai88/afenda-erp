import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface/schemas";

import { buildLinkedControlListSurface } from "../../overview/surfaces/system-admin.control-list.shared";
import type { SystemAdminApprovalRuleListRow } from "../contracts/system-admin.approval-rule.contract";
import {
  buildSystemAdminApprovalsListColumns,
  mapApprovalRuleToListSurfaceRow,
} from "./system-admin.approvals-list.shared";
import { systemAdminApprovalsUiCopy } from "./system-admin.approvals-ui.copy.shared";

export const systemAdminApprovalsSurfaceKey = "system-admin.approvals.list";

export function buildApprovalsListSurface(input: {
  approvals: readonly SystemAdminApprovalRuleListRow[];
  searchValue?: string;
  canMutate?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canMutate = input.canMutate ?? false;
  const copy = systemAdminApprovalsUiCopy.list;

  return buildLinkedControlListSurface({
    key: systemAdminApprovalsSurfaceKey,
    title: copy.title,
    object: "approvals",
    columns: buildSystemAdminApprovalsListColumns(copy.columns),
    rows: input.approvals.map((approval) =>
      mapApprovalRuleToListSurfaceRow({
        approval,
        searchValue: input.searchValue,
        canMutate,
      }),
    ),
    emptyTitle: copy.emptyTitle,
    emptyDescription: canMutate
      ? copy.emptyDescription
      : copy.emptyDescriptionReadOnly,
    searchPlaceholder: copy.searchPlaceholder,
    searchValue: input.searchValue,
  });
}
