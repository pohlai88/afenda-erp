import { describe, expect, it } from "vitest";

import {
  mapApprovalRuleToListSurfaceRow,
  resolveApprovalListRowTone,
  resolveApprovalRuleModeLabel,
  resolveApprovalTargetTypeLabel,
} from "../../src/features/approvals/sys-approvals-list.shared";
import { systemAdminApprovalsUiCopy } from "../../src/features/approvals/sys-approvals-ui.copy.shared";
import { SYSTEM_ADMIN_APPROVALS_MANAGE_CAPABILITY } from "../../src/features/approvals/sys-approvals-capability.shared";

const baseApproval = {
  id: "approval-gallery-1",
  key: "purchasing.po.approval",
  name: "High value purchase order",
  moduleKey: "purchasing",
  action: "purchasing.purchase-order.create",
  targetType: "erp-record",
  approvalMode: "sequential" as const,
  approverRoles: "finance-manager, owner",
  minApprovals: 2,
  escalation: "24h · notify",
  status: "active" as const,
  enabled: true,
  readinessVerdict: "ready" as const,
};

describe("system admin approvals list shared mappers", () => {
  it("maps human-readable approval mode labels", () => {
    expect(resolveApprovalRuleModeLabel("sequential")).toBe(
      systemAdminApprovalsUiCopy.editor.modes.sequential,
    );
    expect(resolveApprovalRuleModeLabel("parallel")).toBe(
      systemAdminApprovalsUiCopy.editor.modes.parallel,
    );
  });

  it("maps human-readable target type labels", () => {
    expect(resolveApprovalTargetTypeLabel("erp-record")).toBe("ERP record");
    expect(resolveApprovalTargetTypeLabel("custom-target")).toBe(
      "custom-target",
    );
  });

  it("derives permission-denied copy from capability constants", () => {
    expect(systemAdminApprovalsUiCopy.permissions.requiresManage).toBe(
      `Requires ${SYSTEM_ADMIN_APPROVALS_MANAGE_CAPABILITY}.`,
    );
  });

  it("assigns row tone from status and readiness verdict", () => {
    expect(
      resolveApprovalListRowTone({
        status: "active",
        readinessVerdict: "ready",
      }),
    ).toBe("default");
    expect(
      resolveApprovalListRowTone({
        status: "disabled",
        readinessVerdict: "warning",
      }),
    ).toBe("attention");
    expect(
      resolveApprovalListRowTone({
        status: "deprecated",
        readinessVerdict: "blocked",
      }),
    ).toBe("critical");
  });

  it("maps approval rules to list surface rows with badge cell kinds", () => {
    const row = mapApprovalRuleToListSurfaceRow({
      approval: baseApproval,
      canMutate: true,
    });

    expect(row.id).toBe(baseApproval.key);
    expect(row.cells.approvalMode).toBe("Sequential");
    expect(row.cells.targetType).toBe("ERP record");
    expect(row.cells.status).toBe("Active");
    expect(row.cells.readinessVerdict).toBe("Ready");
    expect(row.cellKinds?.status).toEqual({
      kind: "badge",
      tone: "positive",
    });
    expect(row.trailingAction?.state).toBe("ready");
    expect(row.rowHref).toContain("approvalsKey=purchasing.po.approval");
  });

  it("hides trailing mutation metadata for deprecated disabled rules", () => {
    const row = mapApprovalRuleToListSurfaceRow({
      approval: {
        ...baseApproval,
        status: "deprecated",
        enabled: false,
        readinessVerdict: "blocked",
      },
      canMutate: true,
    });

    expect(row.rowTone).toBe("critical");
    expect(row.trailingAction?.state).toBe("hidden");
  });
});
