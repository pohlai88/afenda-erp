import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";

export const systemAdminSecurityUiCopy = {
  page: {
    title: "Security",
    description:
      "Organization-level security posture. Sensitive changes are guarded, scoped, and audited.",
  },
  posture: {
    title: "Security posture",
    searchPlaceholder: "Search posture rows by category or setting",
    emptyTitle: "Security settings are not initialized.",
    emptyDescription:
      "Initialize security settings using the form below when you have system-admin.security.manage.",
  },
  readiness: {
    title: "Security readiness",
  },
  categories: {
    authentication: "Authentication governance",
    session: "Session governance",
    domain: "Domain governance",
    administrative: "Administrative protection",
    sensitive: "Sensitive action protection",
    metadata: "Configuration metadata",
  },
  recentChanges: {
    title: "Recent security changes",
    description: `Latest audited security configuration events. Open the audit viewer (${systemAdminRoutePaths.audit}) for full search and export.`,
    searchPlaceholder: "Search security changes by action or target",
    emptyTitle: "No recent security configuration changes recorded.",
    emptyDescription:
      "Changes appear here after security settings are updated for this organization.",
  },
  form: {
    title: "Update security settings",
    description:
      "Dangerous downgrades require explicit confirmation. Domain and session values are validated server-side.",
  },
  accessDenied: {
    title: "Security settings unavailable",
    description:
      "You need system-admin.security.read or system-admin.settings.read to review security posture.",
  },
} as const;
