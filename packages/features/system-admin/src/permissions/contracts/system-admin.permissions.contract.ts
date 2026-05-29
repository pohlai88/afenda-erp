export type SystemAdminPermissionRiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type SystemAdminPermissionCatalogStatus =
  | "active"
  | "orphan"
  | "unused"
  | "missing"
  | "deprecated";

export type SystemAdminPermissionCoverageVerdict =
  | "covered"
  | "orphan"
  | "missing_capability"
  | "unassigned"
  | "overprivileged"
  | "deprecated";

export type SystemAdminPermissionCatalogRow = {
  id: string;
  permission: string;
  module: string;
  group: string;
  label: string;
  description: string;
  capabilityCount: number;
  roleCount: number;
  status: SystemAdminPermissionCatalogStatus;
  coverageVerdict: SystemAdminPermissionCoverageVerdict;
  riskLevel: SystemAdminPermissionRiskLevel;
};
