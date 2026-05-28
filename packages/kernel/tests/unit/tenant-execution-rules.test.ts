import { beforeEach, describe, expect, it } from "vitest";
import type { ExecutionContext } from "../../src/execution-kernel/context/execution-context";
import {
  ExecutionPolicyApprovalRequiredError,
  ExecutionPolicyDeniedError,
} from "../../src/execution-kernel/errors/execution-errors";
import {
  assertExecutionPolicy,
  defineExecutionPolicy,
  registerTenantExecutionPolicyEvaluator,
  resetExecutionPolicyRegistryForTest,
  resolveExecutionPolicyVerdict,
} from "../../src/execution-kernel/policy/execution-policy";
import { resolveTenantExecutionPolicyVerdict } from "../../src/execution-kernel/policy/tenant-execution-rules";

const context: ExecutionContext = {
  organizationId: "org_kernel_policy",
  organizationSlug: "afenda-ops",
  userId: "user_kernel_policy",
  membershipId: "member_kernel_policy",
  locale: "en-MY",
  actorType: "user",
  capabilities: ["finance.view"],
  role: "owner",
  sessionSource: "dev",
};

describe("tenant execution policy rules", () => {
  beforeEach(() => {
    resetExecutionPolicyRegistryForTest();
  });

  it("evaluates require_approval separately from deny", () => {
    const verdict = resolveTenantExecutionPolicyVerdict({
      policy: {
        action: "purchasing.purchase-order.create",
        targetType: "erp-record",
      },
      policyRules: [],
      approvalRules: [
        {
          id: "approval_rule",
          key: "purchasing.po",
          moduleKey: "purchasing",
          action: "purchasing.purchase-order.create",
          targetType: "erp-record",
          approverRoleKeys: ["finance-manager"],
          minApprovals: 1,
          status: "active",
        },
      ],
    });

    expect(verdict?.effect).toBe("require_approval");
    expect(verdict?.allowed).toBe(false);
  });

  it("throws approval-required errors separately from hard deny", async () => {
    registerTenantExecutionPolicyEvaluator(async ({ policy }) => ({
      allowed: false,
      action: policy.action,
      targetType: policy.targetType,
      effect: "require_approval",
      approvalRuleId: "approval_rule",
      reason: "Needs finance approval",
    }));

    await expect(
      assertExecutionPolicy(context, {
        action: "purchasing.purchase-order.create",
        targetType: "erp-record",
      }),
    ).rejects.toBeInstanceOf(ExecutionPolicyApprovalRequiredError);

    resetExecutionPolicyRegistryForTest();

    registerTenantExecutionPolicyEvaluator(async ({ policy }) => ({
      allowed: false,
      action: policy.action,
      targetType: policy.targetType,
      effect: "lock",
      policyRuleId: "policy_rule",
      reason: "Locked",
    }));

    await expect(
      assertExecutionPolicy(context, {
        action: "finance.invoice.update",
        targetType: "erp-record",
      }),
    ).rejects.toBeInstanceOf(ExecutionPolicyDeniedError);
  });

  it("runs tenant policy evaluators after action-specific policies", async () => {
    defineExecutionPolicy("finance.payroll.update", () => null);

    registerTenantExecutionPolicyEvaluator(async ({ policy }) => ({
      allowed: false,
      action: policy.action,
      targetType: policy.targetType,
      effect: "lock",
      reason: "Tenant lock",
      policyRuleId: "tenant_rule",
    }));

    const verdict = await resolveExecutionPolicyVerdict(context, {
      action: "finance.payroll.update",
      targetType: "erp-record",
    });

    expect(verdict.effect).toBe("lock");
    expect(verdict.policyRuleId).toBe("tenant_rule");
  });
});
