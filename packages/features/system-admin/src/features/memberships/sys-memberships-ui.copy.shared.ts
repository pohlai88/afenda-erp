export const systemAdminMembershipsUiCopy = {
  page: {
    title: "Memberships",
    description:
      "Review organizational participation and membership lifecycle for the active tenant.",
    lifecycleAlertTitle: "Invitations and pending users",
    lifecycleAlertBeforeUsersLink:
      "Invite users, resend invitations, and cancel pending invites on the ",
    lifecycleAlertAfterUsersLink:
      " surface. Inspect effective access on Users as well. This page focuses on active membership state and role coverage.",
  },
  listSurface: {
    title: "Organization memberships",
    description:
      "Review membership state and primary role coverage for the active organization.",
    searchPlaceholder: "Search members by name or email",
    emptyTitle: "No memberships found",
    emptyDescription: "Members appear here after they join the organization.",
  },
  section: {
    title: "Organization memberships",
    description:
      "Membership lifecycle actions require system-admin.memberships.manage. Role removal requires system-admin.roles.manage.",
    trailingHeader: "Actions",
  },
  accessDenied: {
    title: "Access denied",
    description:
      "You need the system-admin.memberships.read capability to view organization memberships.",
  },
} as const;
