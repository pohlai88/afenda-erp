/** @see https://neon.com/docs/auth/guides/plugins/organization — not used for Afenda ERP tenancy. */
export const deferredNeonOrganizationClientMethods = [
  "organization.create",
  "organization.list",
  "organization.setActive",
  "organization.inviteMember",
] as const;
