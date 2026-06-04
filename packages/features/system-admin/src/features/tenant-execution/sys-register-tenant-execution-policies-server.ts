import { registerTenantExecutionPolicyEvaluator } from "@afenda/kernel/execution";
import { resolveTenantExecutionPolicyVerdict } from "@afenda/kernel/execution-tenant-policy";
import { loadTenantExecutionRulesForOrganization } from "./sys-tenant-execution-rules.loader.server";

let tenantExecutionPoliciesRegistered = false;

export function ensureTenantExecutionPoliciesRegistered() {
  if (tenantExecutionPoliciesRegistered) {
    return;
  }

  tenantExecutionPoliciesRegistered = true;

  registerTenantExecutionPolicyEvaluator(async ({ context, policy }) => {
    const { policyRules, approvalRules } =
      await loadTenantExecutionRulesForOrganization(context.organizationId);

    return resolveTenantExecutionPolicyVerdict({
      policy,
      policyRules,
      approvalRules,
      attributes:
        policy.metadata && typeof policy.metadata === "object"
          ? (policy.metadata as Record<string, unknown>)
          : undefined,
    });
  });
}

ensureTenantExecutionPoliciesRegistered();
