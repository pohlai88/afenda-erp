import {
  listOrganizationInvitations as listOrganizationInvitationsFromDb,
  listRoleOverridesForOrganization as listRoleOverridesForOrganizationFromDb,
  listTenantMembers as listTenantMembersFromDb,
} from "@afenda/db";

export function listOrganizationInvitations(
  input: Parameters<typeof listOrganizationInvitationsFromDb>[0],
) {
  return listOrganizationInvitationsFromDb(input);
}

export function listRoleOverridesForOrganization(
  input: Parameters<typeof listRoleOverridesForOrganizationFromDb>[0],
) {
  return listRoleOverridesForOrganizationFromDb(input);
}

export function listTenantMembers(
  input: Parameters<typeof listTenantMembersFromDb>[0],
) {
  return listTenantMembersFromDb(input);
}
