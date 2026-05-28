import type { AppCapability } from "@afenda/auth";

export type SystemAdminPermissionRiskLevel = "low" | "standard" | "elevated";

export type SystemAdminPermissionCatalogStatus =
  | "active"
  | "orphan"
  | "unused";

export type SystemAdminPermissionCatalogRow = {
  id: AppCapability;
  permission: AppCapability;
  module: string;
  label: string;
  description: string;
  capabilityCount: number;
  roleCount: number;
  status: SystemAdminPermissionCatalogStatus;
  riskLevel: SystemAdminPermissionRiskLevel;
};
