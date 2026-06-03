/** @see https://neon.com/docs/auth/reference/nextjs-server#authorganizationcreate */
export const implementedNeonOrganizationClientMethods = [
  "organization.create",
  "organization.list",
  "organization.setActive",
  "organization.getFullOrganization",
  "organization.update",
  "organization.delete",
  "organization.inviteMember",
  "organization.acceptInvitation",
  "organization.rejectInvitation",
  "organization.cancelInvitation",
  "organization.listMembers",
  "organization.updateMemberRole",
  "organization.removeMember",
  "organization.leave",
] as const;

export const implementedNeonOrganizationServerMethods = [
  "organization.create",
  "organization.list",
  "organization.inviteMember",
] as const;
