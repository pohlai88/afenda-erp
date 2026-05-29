export const systemAdminUsersUiCopy = {
  page: {
    title: "Users",
    description:
      "Invite users and inspect active tenant access without changing the execution-kernel boundary.",
    inviteSectionTitle: "Invite user",
    lifecycleAlertTitle: "Membership lifecycle",
    lifecycleAlertBeforeMembershipsLink:
      "Suspend, reactivate, and remove organization members on this surface. For membership-only review and role coverage, use ",
    lifecycleAlertBetweenLinks: ". Role overrides and identity policy invites live on ",
    lifecycleAlertAfterIdentityLink: ".",
  },
  listSurface: {
    title: "Organization users",
    description:
      "Last active reflects audit activity until session telemetry is recorded.",
    searchPlaceholder: "Search users by name or email",
    emptyTitle: "No users or pending invitations",
    emptyDescription: "Invite a user to grant organization access.",
  },
  section: {
    title: "Organization users",
    description:
      "Users and pending invitations for the active organization. Lifecycle actions require system-admin.users.manage.",
    trailingHeader: "Actions",
  },
  accessDenied: {
    title: "Access denied",
    description:
      "You need the system-admin.users.read capability to view organization users.",
  },
  invite: {
    emailLabel: "Email",
    roleLabel: "Initial role",
    submitLabel: "Invite",
  },
  trailing: {
    resend: "Resend",
    cancel: "Cancel",
    suspend: "Suspend",
    reactivate: "Reactivate",
    remove: "Remove",
    inspectAccess: "Inspect access",
    viewRoles: "View roles",
    closeInspection: "Close",
  },
  inspection: {
    title: "Access inspection",
    subtitle: (userLabel: string, email: string) =>
      `Read-only summary for ${userLabel} (${email})`,
    statusPrefix: "Status",
    effectivePermissions: "Effective permissions",
    enabledModules: "Enabled modules",
    accessibleCapabilities: "Accessible capabilities",
    blockedCapabilities: "Blocked capabilities",
    emptyPermissions: "None",
    emptyModules: "None for this role",
  },
} as const;
