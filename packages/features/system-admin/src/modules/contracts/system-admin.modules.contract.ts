import type { SystemAdminReadiness } from "@afenda/db";

export type SystemAdminModuleStatus =
  | "active"
  | "disabled"
  | "preview"
  | "deprecated";

export type SystemAdminModuleCatalogRow = {
  id: string;
  module: string;
  status: SystemAdminModuleStatus;
  capabilities: string;
  enabledRoles: string;
  readiness: SystemAdminReadiness;
  permission: string;
  lastChanged: string;
  href: string;
};

export const SYSTEM_ADMIN_PROTECTED_MODULE_KEY = "system-admin" as const;
