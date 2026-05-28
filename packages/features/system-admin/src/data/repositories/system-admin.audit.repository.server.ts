import {
  listAuditLogsForOrganization as listAuditLogsForOrganizationFromDb,
  listRetentionPolicies as listRetentionPoliciesFromDb,
} from "@afenda/db";

export function listAuditLogsForOrganization(
  input: Parameters<typeof listAuditLogsForOrganizationFromDb>[0],
) {
  return listAuditLogsForOrganizationFromDb(input);
}

export function listRetentionPolicies(
  input: Parameters<typeof listRetentionPoliciesFromDb>[0],
) {
  return listRetentionPoliciesFromDb(input);
}
