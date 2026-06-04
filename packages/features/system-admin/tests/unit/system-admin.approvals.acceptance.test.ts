import { describe, expect, it, vi } from "vitest";
import { resolveTenantExecutionPolicyVerdict } from "@afenda/kernel/execution-tenant-policy";

vi.mock("@afenda/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@afenda/db")>();
  return {
    ...actual,
    searchTenantAuditLogs: vi.fn(async () => ({ rows: [], totalCount: 0 })),
  };
});

import {
  APPROVAL_ACCEPTANCE_CRITERIA_COVERAGE,
  APPROVAL_REQUIREMENT_COVERAGE,
  assertApprovalAcceptanceCriteriaComplete,
  assertApprovalCoverageComplete,
} from "../../src/features/approvals/sys-approval-rules.coverage.shared";
import { buildSystemAdminApprovalRuleDetail } from "../../src/features/approvals/sys-approval-rules.detail.server";
import {
  mapTenantApprovalSettingToKernelRecord,
  mapTenantApprovalSettingToRule,
} from "../../src/features/approvals/sys-approval-rules.mapper";
import { evaluateApprovalRuleReadiness } from "../../src/features/approvals/sys-approval-rules.readiness.server";
import { updateApprovalRuleInputSchema } from "../../src/features/approvals/sys-approval-rule.schema";

describe("SUC-001..030 coverage registry", () => {
  it("registers all thirty functional requirements", () => {
    assertApprovalCoverageComplete();
    const codes = APPROVAL_REQUIREMENT_COVERAGE.map((entry) => entry.code);
    for (let index = 1; index <= 30; index += 1) {
      expect(codes).toContain(`SUC-${String(index).padStart(3, "0")}`);
    }
  });

  it("maps all enterprise acceptance criteria as shipped", () => {
    assertApprovalAcceptanceCriteriaComplete();
    expect(APPROVAL_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(18);
    expect(
      APPROVAL_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (row) => row.status === "shipped",
      ),
    ).toBe(true);
  });
});

describe("SUC domain behavior", () => {
  const approvalRow = {
    id: "approval_1",
    organizationId: "org_1",
    approvalKey: "purchasing.po.approval",
    label: "High value PO",
    enabled: true,
    approverRole: "finance-manager" as const,
    escalationMinutes: 1440,
    configuration: {
      moduleKey: "purchasing",
      action: "purchasing.purchase-order.create",
      targetType: "erp-record",
      approvalMode: "sequential",
      approverRoleKeys: ["finance-manager", "owner"],
      delegateToRoleKeys: ["operations-manager"],
      minApprovals: 2,
      escalationAfterHours: 24,
      escalationBehavior: "notify",
      delegationValidDays: 30,
      status: "active",
    },
  };

  it("resolves sequential and parallel kernel records with approval mode", () => {
    const sequential = mapTenantApprovalSettingToKernelRecord(approvalRow);
    expect(sequential?.approvalMode).toBe("sequential");
    expect(sequential?.delegateToRoleKeys).toEqual(["operations-manager"]);

    const parallel = mapTenantApprovalSettingToKernelRecord({
      ...approvalRow,
      configuration: {
        ...approvalRow.configuration,
        approvalMode: "parallel",
      },
    });
    expect(parallel?.approvalMode).toBe("parallel");
  });

  it("builds approval detail with related policies and capability context", async () => {
    const detail = await buildSystemAdminApprovalRuleDetail({
      organizationId: "org_1",
      approvalKey: "purchasing.po.approval",
      approvalSettings: [approvalRow],
      policySettings: [
        {
          id: "policy_1",
          organizationId: "org_1",
          policyKey: "purchasing.po.require-approval",
          label: "Require PO approval",
          enabled: true,
          readiness: "active" as const,
          configuration: {
            moduleKey: "purchasing",
            action: "purchasing.purchase-order.create",
            targetType: "erp-record",
            effect: "require_approval",
            status: "active",
            priority: 100,
            condition: {},
          },
        },
      ],
    });

    expect(detail?.approvalMode).toBe("sequential");
    expect(detail?.relatedPolicyKeys).toContain("purchasing.po.require-approval");
    expect(detail?.readinessVerdict).toBe(
      evaluateApprovalRuleReadiness(mapTenantApprovalSettingToRule(approvalRow)),
    );
    expect(detail?.recentActivity).toEqual([]);
  });

  it("links require_approval policy verdicts to active approval rules", () => {
    const kernelRecord = mapTenantApprovalSettingToKernelRecord(approvalRow);
    expect(kernelRecord).not.toBeNull();

    const verdict = resolveTenantExecutionPolicyVerdict({
      policy: {
        action: "purchasing.purchase-order.create",
        targetType: "erp-record",
        metadata: { moduleKey: "purchasing" },
      },
      policyRules: [],
      approvalRules: [kernelRecord!],
    });

    expect(verdict?.effect).toBe("require_approval");
    expect(verdict?.approvalRuleId).toBe("approval_1");
  });

  it("requires escalation behavior when escalation hours are configured", () => {
    expect(
      updateApprovalRuleInputSchema.safeParse({
        approvalRuleId: "finance.payment",
        name: "Payment",
        moduleKey: "finance",
        action: "finance.documents.write",
        targetType: "erp-record",
        approvalMode: "parallel",
        approverRoleKeys: "finance-manager",
        minApprovals: 1,
        escalationAfterHours: 24,
        status: "active",
        enabled: true,
      }).success,
    ).toBe(false);
  });

  it("validates escalation timing bounds per SUC-018", () => {
    expect(
      updateApprovalRuleInputSchema.safeParse({
        approvalRuleId: "finance.payment",
        name: "Payment",
        moduleKey: "finance",
        action: "finance.documents.write",
        targetType: "erp-record",
        approvalMode: "parallel",
        approverRoleKeys: "finance-manager",
        minApprovals: 1,
        escalationAfterHours: 721,
        escalationBehavior: "expire",
        status: "active",
        enabled: true,
      }).success,
    ).toBe(false);
  });
});
