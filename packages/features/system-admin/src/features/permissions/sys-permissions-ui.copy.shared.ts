export const systemAdminPermissionsUiCopy = {
  page: {
    title: "Permissions",
    description:
      "Permissions are declared capability contracts grouped by module and action. Coverage verdicts flag orphan, unassigned, missing capability, and overprivileged grants.",
  },
  catalog: {
    title: "Permission catalog",
    searchPlaceholder: "Search permissions by key, module, or label",
    emptyTitle: "No permissions match the current filters.",
    emptyDescription:
      "Clear search and coverage filters, or reconcile the execution capability catalog.",
  },
  overrides: {
    title: "Role permission overrides",
    description:
      "Tenant overrides apply on top of the static role catalog when sessions are refreshed.",
  },
  bundleForm: {
    title: "Update role permission bundle",
    description:
      "Permissions are assigned through roles. High-risk and critical grants require explicit confirmation.",
  },
  missingCatalogAlert: (count: number) =>
    `${count} execution capability reference${count === 1 ? "" : "s"} permission keys that are not registered in the declared catalog. Review the coverage column and reconcile the catalog before granting new role bundles.`,
  accessDenied: {
    title: "Permission catalog unavailable",
    description:
      "You need system-admin.permissions.read or system-admin.identity.read to review the permission catalog.",
  },
} as const;
