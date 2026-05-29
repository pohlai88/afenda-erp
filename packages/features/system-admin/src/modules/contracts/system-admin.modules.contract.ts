import type { SystemAdminReadiness } from "@afenda/db";
import type { SystemAdminModuleCategory } from "./system-admin.module-category.contract";
import type { SystemAdminModuleReadinessVerdict } from "./system-admin.modules-readiness.shared";

export type SystemAdminModuleStatus =
  | "active"
  | "disabled"
  | "preview"
  | "deprecated";

export type SystemAdminModuleAvailability = "enabled" | "disabled" | "preview";

export type SystemAdminModuleCatalogRow = {
  id: string;
  module: string;
  category: SystemAdminModuleCategory;
  status: SystemAdminModuleStatus;
  availability: SystemAdminModuleAvailability;
  visibility: "visible" | "hidden";
  capabilities: string;
  permissions: string;
  policies: string;
  readinessVerdict: SystemAdminModuleReadinessVerdict;
  readiness: SystemAdminReadiness;
  lastChanged: string;
  href: string;
};

export const SYSTEM_ADMIN_PROTECTED_MODULE_KEY = "system-admin" as const;
