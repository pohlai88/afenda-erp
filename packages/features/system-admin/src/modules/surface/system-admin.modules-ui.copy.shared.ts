export const systemAdminModulesUiCopy = {
  page: {
    title: "Modules",
    description:
      "Tenant module availability and readiness controls. Disabled modules are removed from active navigation targets.",
  },
  listSurface: {
    title: "Module readiness",
    searchPlaceholder: "Search modules by name or category",
    emptyTitle: "No modules are registered.",
    emptyDescription:
      "Module catalog entries appear when execution capabilities are registered for this deployment.",
  },
  settingsPanel: {
    title: "Update module settings",
    description:
      "Changes are audited and enforced through tenant module settings consumed by workspace navigation.",
  },
  accessDenied: {
    title: "Access denied",
    description:
      "You need the system-admin.modules.read capability to view module readiness.",
  },
} as const;
