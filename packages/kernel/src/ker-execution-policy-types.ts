import type { ExecutionPolicyEffect } from "./ker-tenant-execution-rules";

export type ExecutionPolicyCheck = {
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

export type ExecutionPolicyVerdict = {
  allowed: boolean;
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
  effect?: ExecutionPolicyEffect;
  policyRuleId?: string;
  approvalRuleId?: string;
};
