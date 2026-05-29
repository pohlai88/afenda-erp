export {
  SYSTEM_ADMIN_PROTECTED_MODULE_KEY,
  type SystemAdminModuleAvailability,
  type SystemAdminModuleCatalogRow,
  type SystemAdminModuleStatus,
} from "./system-admin.modules.contract";
export {
  resolveSystemAdminModuleCategory,
  systemAdminModuleCategoryById,
  type SystemAdminModuleCategory,
} from "./system-admin.module-category.contract";
export {
  resolveSystemAdminModuleAvailability,
  resolveSystemAdminModuleReadinessVerdict,
  type SystemAdminModuleReadinessVerdict,
} from "./system-admin.modules-readiness.shared";
export {
  formatModuleDependencyIssue,
  listDisabledModuleDependencyKeys,
  systemAdminCriticalModuleKeys,
  systemAdminModuleDependencies,
} from "./system-admin.module-dependencies.contract";
