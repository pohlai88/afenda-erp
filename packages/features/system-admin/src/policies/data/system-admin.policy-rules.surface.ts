import type {
  ListSurfaceRendererConfigurationResolvedInput,
  ListSurfaceRow,
} from "@afenda/governed-surface/schemas";
import type { ExecutionPolicyEffect } from "@afenda/kernel/execution-tenant-policy";
import { systemAdminControlLinks } from "../../contracts/system-admin.control-links.contract";
import {
  buildLinkedControlListSurface,
  catalogStatusBadge,
  linkCell,
} from "../../surfaces/system-admin.control.surface";
import type { SystemAdminPolicyRuleListRow } from "../contracts/system-admin.policy-rule.contract";

export const systemAdminPoliciesSurfaceKey = "system-admin.policies.list";

function policyEffectBadge(
  effect: ExecutionPolicyEffect,
): NonNullable<ListSurfaceRow["cellKinds"]>[string] {
  switch (effect) {
    case "allow":
      return { kind: "badge", tone: "positive" };
    case "warn":
    case "require_approval":
      return { kind: "badge", tone: "attention" };
    case "lock":
    case "deny":
      return { kind: "badge", tone: "critical" };
    default: {
      const _exhaustive: never = effect;
      return _exhaustive;
    }
  }
}

export function buildPoliciesListSurface(input: {
  policies: readonly SystemAdminPolicyRuleListRow[];
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  return buildLinkedControlListSurface({
    key: systemAdminPoliciesSurfaceKey,
    title: "Policy rules",
    object: "policies",
    columns: [
      { id: "name", header: "Rule", priority: "primary", pin: "start", cellKind: { kind: "link" } },
      { id: "moduleKey", header: "Module", cellKind: { kind: "link" } },
      { id: "action", header: "Action" },
      { id: "targetType", header: "Target" },
      { id: "effect", header: "Effect", cellKind: { kind: "badge" } },
      { id: "priority", header: "Priority" },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
      { id: "conditionSummary", header: "Conditions" },
    ],
    rows: input.policies.map((policy) => ({
      id: policy.id,
      cells: {
        name: policy.name,
        moduleKey: policy.moduleKey,
        action: policy.action,
        targetType: policy.targetType,
        effect: policy.effect,
        priority: String(policy.priority),
        status: policy.status,
        conditionSummary: policy.conditionSummary,
      },
      cellKinds: {
        name: linkCell(systemAdminControlLinks.policies(policy.key)),
        moduleKey: linkCell(systemAdminControlLinks.modules(policy.moduleKey)),
        effect: policyEffectBadge(policy.effect),
        status: catalogStatusBadge(policy.status),
      },
    })),
    emptyTitle: "No policy rules are configured for this organization.",
    searchValue: input.searchValue,
  });
}
