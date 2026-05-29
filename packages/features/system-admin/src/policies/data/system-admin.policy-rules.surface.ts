import type {
  ListSurfaceRendererConfigurationResolvedInput,
  ListSurfaceRow,
} from "@afenda/governed-surface/schemas";
import type { ExecutionPolicyEffect } from "@afenda/kernel/execution-tenant-policy";
import { systemAdminControlLinks } from "../../overview/contracts/system-admin.control-links.contract";
import {
  buildLinkedControlListSurface,
  catalogStatusBadge,
  linkCell,
  moduleReadinessVerdictBadge,
} from "../../overview/surfaces/system-admin.control-list.shared";
import type { SystemAdminPolicyRuleListRow } from "../contracts/system-admin.policy-rule.contract";
import { resolveSystemAdminPolicyRowTrailingAction } from "../surface/system-admin.policy-rules-list-trailing.shared";

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
  canMutate?: boolean;
}): ListSurfaceRendererConfigurationResolvedInput {
  const canMutate = input.canMutate ?? false;
  return buildLinkedControlListSurface({
    key: systemAdminPoliciesSurfaceKey,
    title: "Policy rules",
    object: "policies",
    columns: [
      { id: "name", header: "Policy", priority: "primary", pin: "start", cellKind: { kind: "link" } },
      { id: "moduleKey", header: "Module", cellKind: { kind: "link" } },
      { id: "effect", header: "Effect", cellKind: { kind: "badge" } },
      { id: "priority", header: "Priority" },
      { id: "status", header: "Status", cellKind: { kind: "badge" } },
      { id: "readinessVerdict", header: "Readiness", cellKind: { kind: "badge" } },
      { id: "coverageSummary", header: "Coverage" },
      { id: "action", header: "Action" },
      { id: "conditionSummary", header: "Conditions" },
    ],
    rows: input.policies.map((policy) => ({
      id: policy.id,
      rowHref: systemAdminControlLinks.policy(policy.key, input.searchValue),
      linkColumnId: "name",
      trailingAction: resolveSystemAdminPolicyRowTrailingAction({
        enabled: policy.enabled,
        canMutate,
      }),
      cells: {
        name: policy.name,
        moduleKey: policy.moduleKey,
        effect: policy.effect,
        priority: String(policy.priority),
        status: policy.status,
        enabled: String(policy.enabled),
        readinessVerdict: policy.readinessVerdict,
        coverageSummary: policy.coverageSummary,
        action: policy.action,
        conditionSummary: policy.conditionSummary,
      },
      cellKinds: {
        name: linkCell(systemAdminControlLinks.policy(policy.key, input.searchValue)),
        moduleKey: linkCell(systemAdminControlLinks.modules(policy.moduleKey)),
        effect: policyEffectBadge(policy.effect),
        status: catalogStatusBadge(policy.status),
        readinessVerdict: moduleReadinessVerdictBadge(policy.readinessVerdict),
      },
    })),
    emptyTitle: "No policy rules are configured for this organization.",
    searchValue: input.searchValue,
  });
}
