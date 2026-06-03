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
  identity: {
    page: {
      title: "Identity & access",
      description:
        "Tenant role overrides and navigation to user lifecycle surfaces. Invite, suspend, and remove users on the Users surface — not here.",
    },
    accessDenied: {
      title: "Access denied",
      description:
        "You need the system-admin.users.read capability to view identity and access controls for this organization.",
    },
    inviteSection: {
      title: "Invite member (identity policy)",
      description:
        "Uses system-admin.identity.write. For the full user lifecycle (resend, suspend, inspect access), use the Users surface.",
    },
    overridesList: {
      title: "Role overrides",
      description:
        "Overrides apply on top of the static role catalog when the session is refreshed.",
      surfaceHeaderTitle: "Role permission overrides",
      searchPlaceholder: "Search overrides by role or permission key",
      emptyTitle: "No tenant-specific overrides configured.",
      emptyDescription:
        "Use the form below to grant or deny a permission for a role when you have identity.write.",
    },
    overrideForm: {
      title: "Set role override",
    },
    domainLinks: [
      {
        title: "Users",
        description:
          "Invite users, resend invitations, suspend or remove access, and inspect effective permissions.",
      },
      {
        title: "Memberships",
        description: "Review membership status and role assignment coverage.",
      },
      {
        title: "Roles",
        description: "Browse the tenant role catalog and assignment posture.",
      },
      {
        title: "Permissions",
        description: "Inspect the declared permission catalog and role coverage.",
      },
    ] as const,
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
