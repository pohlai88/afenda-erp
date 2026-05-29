import type { TenantApprovalSettingRow } from "@afenda/db";

type ApproverRole = NonNullable<TenantApprovalSettingRow["approverRole"]>;

export type ApprovalReadinessVerdict = "ready" | "warning" | "blocked";

export type SystemAdminApprovalMode = "sequential" | "parallel";

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
  delegateToRoleKeys: readonly ApproverRole[];
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
  minApprovals: number;
  escalationAfterHours?: number;
  status: SystemAdminApprovalRuleStatus;
  enabled: boolean;
};

export type SystemAdminApproverRoleOption = {
  value: string;
  label: string;
};
