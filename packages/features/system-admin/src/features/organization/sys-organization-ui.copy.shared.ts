export const systemAdminOrganizationUiCopy = {
  page: {
    title: "Organization",
    description:
      "Operational organization defaults used by ERP modules, document controls, and tenant data-handling policy.",
  },
  list: {
    title: "Organization defaults",
    searchPlaceholder: "Search defaults by setting name or value",
    emptyTitle: "Organization defaults are not initialized.",
    emptyDescription:
      "Run tenant bootstrap or update defaults below when you have system-admin.organization.manage.",
  },
  form: {
    title: "Update organization defaults",
    description:
      "Changes are audited as system-admin.organization.update and apply tenant-wide operational, document, and data-handling settings.",
  },
  accessDenied: {
    title: "Access denied",
    description:
      "You need the system-admin.organization.read capability to view organization defaults.",
  },
} as const;
