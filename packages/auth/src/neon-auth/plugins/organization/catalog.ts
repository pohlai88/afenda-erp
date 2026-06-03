/** @see https://neon.com/docs/auth/guides/plugins/organization — not used for Afenda ERP tenancy. */
export const afendaTenantOrganizationPatterns = [
  "bootstrapOrganizationForUser",
  "switchActiveOrganization",
  "getOrganizationContext",
  "getPostSignInDestination.onboarding-vs-dashboard",
  "feature-system-admin.users.invite",
  "feature-system-admin.memberships",
] as const;

export const deferredNeonOrganizationClientMethods = [
  "organization.create",
  "organization.checkSlug",
  "organization.list",
  "organization.setActive",
  "organization.getFullOrganization",
  "organization.update",
  "organization.delete",
  "organization.inviteMember",
  "organization.acceptInvitation",
  "organization.rejectInvitation",
  "organization.cancelInvitation",
  "organization.getInvitation",
  "organization.listInvitations",
  "organization.listUserInvitations",
  "organization.listMembers",
  "organization.updateMemberRole",
  "organization.removeMember",
  "organization.getActiveMember",
  "organization.getActiveMemberRole",
  "organization.leave",
  "organization.checkRolePermission",
  "organization.useListOrganizations",
  "organization.useActiveOrganization",
  "auth.accept-invitation.route",
] as const;

export type AfendaTenantOrganizationPattern = (typeof afendaTenantOrganizationPatterns)[number];

export type DeferredNeonOrganizationClientMethod =
  (typeof deferredNeonOrganizationClientMethods)[number];
