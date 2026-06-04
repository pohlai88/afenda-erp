import { describe, expect, it } from "vitest";
import type { SystemAdminPolicyRule } from "../../src/features/policies/system-admin.policy-rule.contract";
import { evaluatePolicyRuleReadiness } from "../../src/features/policies/system-admin.policy-rules.readiness.server";

function baseRule(
  overrides: Partial<SystemAdminPolicyRule> = {},
): SystemAdminPolicyRule {
  return {
    id: "policy_1",
    organizationId: "org_1",
    key: "system-admin.policy.example",
    name: "Example policy",
    moduleKey: "system-admin",
    action: "system-admin.policies.manage",
    targetType: "erp-record",
    effect: "lock",
    condition: {},
    status: "active",
    priority: 100,
    enabled: true,
    readiness: "active",
    ...overrides,
  };
}

describe("policy rule readiness", () => {
  it("returns ready for active rules with registered actions", () => {
    expect(evaluatePolicyRuleReadiness(baseRule())).toBe("ready");
  });

  it("returns blocked when the action is not in the execution catalog", () => {
    expect(
      evaluatePolicyRuleReadiness(
        baseRule({ action: "unknown.module.action" }),
      ),
    ).toBe("blocked");
  });

  it("returns warning for disabled or deprecated rules", () => {
    expect(evaluatePolicyRuleReadiness(baseRule({ enabled: false }))).toBe(
      "warning",
    );
    expect(
      evaluatePolicyRuleReadiness(baseRule({ status: "deprecated" })),
    ).toBe("warning");
  });
});
