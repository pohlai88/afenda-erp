export const systemAdminCapabilitiesUiCopy = {
  page: {
    title: "Capabilities",
    description:
      "Capability metadata comes from the execution kernel. Coverage verdicts flag missing permissions, routes, audit mappings, and org-level availability.",
  },
  list: {
    title: "Execution capabilities",
    searchPlaceholder: "Search capabilities by key, module, or route",
    emptyTitle: "No execution capabilities are registered.",
    emptyDescription:
      "Execution capabilities are declared by the kernel catalog for this deployment.",
  },
  settings: {
    title: "Update capability availability",
    description:
      "Org-level capability availability is stored in tenant capability settings and audited.",
  },
  roleMatrix: {
    title: "Per-role capability matrix",
    searchPlaceholder: "Search matrix rows by role, capability, or permission",
    emptyTitle: "No capability rows match the current role filter.",
    emptyDescription:
      "Clear the role filter or pick another role to see execution coverage for this tenant.",
  },
  accessDenied: {
    title: "Access denied",
    description:
      "You need the system-admin.capabilities.read capability to view execution capabilities for this organization.",
  },
} as const;
