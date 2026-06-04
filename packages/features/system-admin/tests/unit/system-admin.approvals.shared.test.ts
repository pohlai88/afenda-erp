import { describe, expect, it } from "vitest";
import {
  readConfiguredApprovalRuleStatus,
  resolveApprovalRuleKey,
  toEscalationMinutes,
} from "../../src/features/approvals/sys-approval-rules.shared";

describe("approval rule shared helpers", () => {
  it("resolves approval keys from create and update action input", () => {
    expect(
      resolveApprovalRuleKey({
        mode: "create",
        approvalKey: "purchasing.po.high-value",
        name: "High value PO",
        moduleKey: "purchasing",
        action: "purchasing.purchase-order.create",
        targetType: "erp-record",
        approvalMode: "parallel",
        approverRoleKeys: ["admin"],
        delegateToRoleKeys: [],
        minApprovals: 1,
        escalationRoleKeys: [],
        status: "active",
        enabled: true,
      }),
    ).toBe("purchasing.po.high-value");

    expect(
      resolveApprovalRuleKey({
        mode: "update",
        approvalRuleId: "finance.expense",
        name: "Expense approval",
        moduleKey: "finance",
        action: "finance.expense.approve",
        targetType: "erp-record",
        approvalMode: "sequential",
        approverRoleKeys: ["finance-manager"],
        delegateToRoleKeys: [],
        minApprovals: 1,
        escalationRoleKeys: [],
        status: "active",
        enabled: true,
      }),
    ).toBe("finance.expense");
  });

  it("converts escalation hours to minutes", () => {
    expect(toEscalationMinutes(undefined)).toBeNull();
    expect(toEscalationMinutes(24)).toBe(1440);
  });

  it("reads configured approval status with active fallback", () => {
    expect(readConfiguredApprovalRuleStatus({ status: "deprecated" })).toBe(
      "deprecated",
    );
    expect(readConfiguredApprovalRuleStatus({})).toBe("active");
  });
});
