import type { TenantApprovalSettingRow } from "@afenda/db";

type ApproverRole = NonNullable<TenantApprovalSettingRow["approverRole"]>;

export type ApprovalReadinessVerdict = "ready" | "warning" | "blocked";

export type SystemAdminApprovalMode = "sequential" | "parallel";

export type ApprovalEscalationBehavior = "notify" | "reassign" | "expire";

export type SystemAdminApprovalRuleStatus =
  | "active"
  | "disabled"
  | "deprecated";

export type SystemAdminApprovalRule = {
  id: string;
  organizationId: string;
  key: string;
  name: string;
  moduleKey: string;
  action: string;
  targetType: string;
  approvalMode: SystemAdminApprovalMode;
  approverRoleKeys: readonly ApproverRole[];
  minApprovals: number;
  escalationAfterHours?: number;
  escalationBehavior?: ApprovalEscalationBehavior;
  escalationRoleKeys: readonly ApproverRole[];
  delegateToRoleKeys: readonly ApproverRole[];
  delegationValidDays?: number;
  status: SystemAdminApprovalRuleStatus;
  enabled: boolean;
};

export type SystemAdminApprovalRuleListRow = {
  id: string;
  key: string;
  name: string;
  moduleKey: string;
  action: string;
  targetType: string;
  approvalMode: SystemAdminApprovalMode;
  approverRoles: string;
  minApprovals: number;
  escalation: string;
  status: SystemAdminApprovalRuleStatus;
  enabled: boolean;
  readinessVerdict: ApprovalReadinessVerdict;
};

export type SystemAdminApprovalRuleEditorDefaults = {
  mode: "update";
  approvalRuleId: string;
  name: string;
  moduleKey: string;
  action: string;
  targetType: string;
  approvalMode: SystemAdminApprovalMode;
  approverRoleKeys: string;
  delegateToRoleKeys: string;
  delegationValidDays?: number;
  minApprovals: number;
  escalationAfterHours?: number;
  escalationBehavior?: ApprovalEscalationBehavior;
  escalationRoleKeys: string;
  status: SystemAdminApprovalRuleStatus;
  enabled: boolean;
};

export type SystemAdminApproverRoleOption = {
  value: string;
  label: string;
};

export type SystemAdminApprovalRuleDetail = {
  approvalKey: string;
  name: string;
  moduleKey: string;
  action: string;
  targetType: string;
  approvalMode: SystemAdminApprovalMode;
  approverRoleKeys: readonly string[];
  delegateToRoleKeys: readonly string[];
  minApprovals: number;
  escalationAfterHours?: number;
  escalationBehavior?: ApprovalEscalationBehavior;
  escalationRoleKeys: readonly string[];
  delegationValidDays?: number;
  status: SystemAdminApprovalRuleStatus;
  enabled: boolean;
  readinessVerdict: ApprovalReadinessVerdict;
  capabilityKey: string | null;
  capabilityLabel: string | null;
  requiredPermission: string | null;
  relatedPolicyKeys: readonly string[];
  recentActivity: readonly SystemAdminApprovalActivityRow[];
  auditHref: string;
};

export type SystemAdminApprovalActivityRow = {
  id: string;
  occurredAt: string;
  actorId: string;
  action: string;
  summary: string;
};
