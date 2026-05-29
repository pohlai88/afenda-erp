export const systemAdminModulesUiCopy = {
  page: {
    title: "Modules",
    description:
      "Tenant module availability and readiness controls. Disabled modules are removed from active navigation targets.",
  },
  listSurface: {
    title: "Module readiness",
    emptyTitle: "No modules are registered.",
  },
  settingsPanel: {
    title: "Update module settings",
    description:
      "Changes are audited and enforced through tenant module settings consumed by AppShell navigation.",
  },
  accessDenied: {
    title: "Access denied",
    description:
      "You need the system-admin.modules.read capability to view module readiness.",
  },
} as const;
