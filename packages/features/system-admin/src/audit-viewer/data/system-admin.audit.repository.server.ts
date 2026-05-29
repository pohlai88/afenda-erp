import { listRetentionPolicies as listRetentionPoliciesFromDb } from "@afenda/db";

export function listRetentionPolicies(
  input: Parameters<typeof listRetentionPoliciesFromDb>[0],
) {
  return listRetentionPoliciesFromDb(input);
}
