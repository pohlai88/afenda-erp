import type { ExecutionPolicyEffect } from "@afenda/kernel/execution-tenant-policy";

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

export type SystemAdminPolicyRuleListRow = {
  id: string;
  key: string;
  name: string;
  moduleKey: string;
  action: string;
  targetType: string;
  effect: ExecutionPolicyEffect;
  status: SystemAdminPolicyRuleStatus;
  priority: number;
  conditionSummary: string;
};
