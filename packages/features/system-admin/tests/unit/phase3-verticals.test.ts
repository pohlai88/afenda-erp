import { describe, expect, it } from "vitest";
import { resolveTenantExecutionPolicyVerdict } from "@afenda/kernel/execution-tenant-policy";
import {
  mapTenantPolicySettingToRule,
  mapTenantPolicySettingToKernelRecord,
} from "../../src/policies/data/system-admin.policy-rules.mapper";
import {
  mapTenantApprovalSettingToKernelRecord,
  mapTenantApprovalSettingToRule,
} from "../../src/approvals/data/system-admin.approval-rules.mapper";
import { updatePolicyRuleInputSchema } from "../../src/policies/schemas/system-admin.policy-rule.schema";
import { updateApprovalRuleInputSchema } from "../../src/approvals/schemas/system-admin.approval-rule.schema";

describe("system admin phase 3 policy schemas", () => {
  it("rejects malformed policy condition JSON", () => {
    const parsed = updatePolicyRuleInputSchema.safeParse({
      policyRuleId: "finance.invoice.lock",
      name: "Lock posted invoices",
      moduleKey: "finance",
      action: "finance.invoice.update",
      targetType: "erp-record",
      effect: "lock",
      conditionJson: "{not-json",
      status: "active",
      priority: 100,
      enabled: true,
    });

    expect(parsed.success).toBe(false);
  });

  it("validates approver roles for approval rules", () => {
    const parsed = updateApprovalRuleInputSchema.safeParse({
      approvalRuleId: "purchasing.po.approval",
      name: "High value PO",
      moduleKey: "purchasing",
      action: "purchasing.purchase-order.create",
      targetType: "erp-record",
      approvalMode: "parallel",
      approverRoleKeys: "not-a-real-role",
      minApprovals: 1,
      status: "active",
      enabled: true,
    });

    expect(parsed.success).toBe(false);
  });
});

describe("system admin phase 3 execution kernel integration", () => {
  it("denies non-admin users from managing policies", () => {
    const capabilities = ["system-admin.policies.read"] as const;
    expect(capabilities.includes("system-admin.policies.manage")).toBe(false);
  });

  it("applies active lock policy rules with priority", () => {
    const policyRow = {
      id: "policy_1",
      organizationId: "org_phase3",
      policyKey: "finance.invoice.lock",
      label: "Lock posted invoice edits",
      enabled: true,
      readiness: "active" as const,
      configuration: {
        moduleKey: "finance",
        action: "finance.invoice.update",
        targetType: "erp-record",
        effect: "lock",
        status: "active",
        priority: 200,
        condition: { status: "posted" },
      },
    };

    const verdict = resolveTenantExecutionPolicyVerdict({
      policy: {
        action: "finance.invoice.update",
        targetType: "erp-record",
        metadata: { moduleKey: "finance" },
      },
      policyRules: [mapTenantPolicySettingToKernelRecord(policyRow)!],
      approvalRules: [],
      attributes: { status: "posted" },
    });

    expect(verdict?.allowed).toBe(false);
    expect(verdict?.effect).toBe("lock");
    expect(verdict?.policyRuleId).toBe("policy_1");
  });

  it("ignores disabled policy rules during verdict resolution", () => {
    const disabledRow = {
      id: "policy_disabled",
      organizationId: "org_phase3",
      policyKey: "finance.invoice.lock",
      label: "Disabled lock",
      enabled: false,
      readiness: "active" as const,
      configuration: {
        moduleKey: "finance",
        action: "finance.invoice.update",
        targetType: "erp-record",
        effect: "lock",
        status: "active",
        priority: 500,
        condition: {},
      },
    };

    const verdict = resolveTenantExecutionPolicyVerdict({
      policy: {
        action: "finance.invoice.update",
        targetType: "erp-record",
      },
      policyRules: [mapTenantPolicySettingToKernelRecord(disabledRow)].filter(
        (rule): rule is NonNullable<typeof rule> => rule !== null,
      ),
      approvalRules: [],
    });

    expect(verdict).toBeNull();
  });

  it("returns require_approval distinct from deny and lock", () => {
    const lockRow = {
      id: "policy_lock",
      organizationId: "org_phase3",
      policyKey: "finance.invoice.lock",
      label: "Lock",
      enabled: true,
      readiness: "active" as const,
      configuration: {
        moduleKey: "finance",
        action: "finance.invoice.update",
        targetType: "erp-record",
        effect: "lock",
        status: "active",
        priority: 300,
        condition: {},
      },
    };

    const lockVerdict = resolveTenantExecutionPolicyVerdict({
      policy: {
        action: "finance.invoice.update",
        targetType: "erp-record",
      },
      policyRules: [mapTenantPolicySettingToKernelRecord(lockRow)!],
      approvalRules: [],
    });

    expect(lockVerdict?.effect).toBe("lock");
    expect(lockVerdict?.allowed).toBe(false);

    const approvalRow = {
      id: "approval_1",
      organizationId: "org_phase3",
      approvalKey: "purchasing.po.approval",
      label: "PO approval",
      enabled: true,
      approverRole: "finance-manager" as const,
      escalationMinutes: 1440,
      configuration: {
        moduleKey: "purchasing",
        action: "purchasing.purchase-order.create",
        targetType: "erp-record",
        approverRoleKeys: ["finance-manager"],
        minApprovals: 2,
        status: "active",
      },
    };

    const verdict = resolveTenantExecutionPolicyVerdict({
      policy: {
        action: "purchasing.purchase-order.create",
        targetType: "erp-record",
        metadata: { moduleKey: "purchasing" },
      },
      policyRules: [],
      approvalRules: [mapTenantApprovalSettingToKernelRecord(approvalRow)!],
    });

    expect(verdict?.allowed).toBe(false);
    expect(verdict?.effect).toBe("require_approval");
    expect(verdict?.approvalRuleId).toBe("approval_1");
    expect(verdict?.policyRuleId).toBeUndefined();
  });

});

describe("system admin phase 3 rule mapping", () => {
  it("maps stored policy settings into governed rule rows", () => {
    const rule = mapTenantPolicySettingToRule({
      id: "policy_row",
      organizationId: "org_1",
      policyKey: "inventory.period.close",
      label: "Close inventory period",
      enabled: true,
      readiness: "active",
      configuration: {
        moduleKey: "inventory",
        action: "inventory.adjustment.create",
        targetType: "erp-record",
        effect: "lock",
        status: "active",
        priority: 50,
        condition: { periodClosed: true },
      },
    });

    expect(rule.effect).toBe("lock");
    expect(rule.status).toBe("active");
    expect(rule.priority).toBe(50);
  });

  it("maps approval settings with multiple approver roles", () => {
    const rule = mapTenantApprovalSettingToRule({
      id: "approval_row",
      organizationId: "org_1",
      approvalKey: "vendor.bank.change",
      label: "Vendor bank change",
      enabled: true,
      approverRole: "owner",
      escalationMinutes: 120,
      configuration: {
        moduleKey: "purchasing",
        action: "purchasing.vendor.bank-account.update",
        targetType: "erp-record",
        approvalMode: "parallel",
        approverRoleKeys: ["owner", "admin"],
        minApprovals: 2,
        status: "active",
      },
    });

    expect(rule.approverRoleKeys).toEqual(["owner", "admin"]);
    expect(rule.minApprovals).toBe(2);
  });
});
