import type { TenantApprovalSettingRow } from "@afenda/db";

type ApproverRole = NonNullable<TenantApprovalSettingRow["approverRole"]>;

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
  approverRoleKeys: readonly ApproverRole[];
  minApprovals: number;
  escalationAfterHours?: number;
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
  approverRoles: string;
  minApprovals: number;
  escalation: string;
  status: SystemAdminApprovalRuleStatus;
};
