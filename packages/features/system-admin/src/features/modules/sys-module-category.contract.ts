import type { ModuleId } from "@afenda/config/module-ids";

export type SystemAdminModuleCategory =
  | "core"
  | "operations"
  | "finance"
  | "people"
  | "platform";

export const systemAdminModuleCategoryById = {
  dashboard: "core",
  finance: "finance",
  sales: "operations",
  purchasing: "operations",
  inventory: "operations",
  hr: "people",
  crm: "people",
  approvals: "operations",
  reports: "operations",
  "system-admin": "platform",
} as const satisfies Record<ModuleId, SystemAdminModuleCategory>;

export function resolveSystemAdminModuleCategory(
  moduleId: string,
): SystemAdminModuleCategory {
  if (moduleId in systemAdminModuleCategoryById) {
    return systemAdminModuleCategoryById[moduleId as ModuleId];
  }

  return "operations";
}
