import type { ExecutionPolicyEffect } from "@afenda/kernel/execution-tenant-policy";

export type PolicyReadinessVerdict = "ready" | "warning" | "blocked";

export type SystemAdminPolicyRuleStatus =
  | "active"
  | "disabled"
  | "deprecated";

export type SystemAdminPolicyRule = {
  id: string;
  organizationId: string;
  key: string;
  name: string;
  moduleKey: string;
  action: string;
  targetType: string;
  effect: ExecutionPolicyEffect;
  condition: Record<string, unknown>;
  status: SystemAdminPolicyRuleStatus;
  priority: number;
  enabled: boolean;
  readiness: "preview" | "active" | "blocked" | "deprecated";
};

export type SystemAdminPolicyRuleDetail = {
  policyKey: string;
  name: string;
  moduleKey: string;
  action: string;
  targetType: string;
  effect: ExecutionPolicyEffect;
  status: SystemAdminPolicyRuleStatus;
  priority: number;
  enabled: boolean;
  readinessVerdict: PolicyReadinessVerdict;
  conditionJson: string;
  capabilityKey: string | null;
  capabilityLabel: string | null;
  requiredPermission: string | null;
  relatedApprovalKeys: readonly string[];
  coverageSummary: string;
  auditHref: string;
};

export type SystemAdminPolicyRuleListRow = {
  id: string;
  key: string;
  name: string;
  moduleKey: string;
  action: string;
  targetType: string;
  effect: ExecutionPolicyEffect;
  status: SystemAdminPolicyRuleStatus;
  enabled: boolean;
  priority: number;
  conditionSummary: string;
  readinessVerdict: PolicyReadinessVerdict;
  coverageSummary: string;
};

export type SystemAdminPolicyRuleEditorDefaults = {
  mode: "update";
  policyRuleId: string;
  name: string;
  moduleKey: string;
  action: string;
  targetType: string;
  effect: ExecutionPolicyEffect;
  conditionJson: string;
  status: SystemAdminPolicyRuleStatus;
  priority: number;
  enabled: boolean;
};
