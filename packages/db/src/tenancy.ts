import { eq } from "drizzle-orm";

export function byOrganization(
  table: { organizationId: Parameters<typeof eq>[0] },
  organizationId: string,
) {
  return eq(table.organizationId, organizationId);
}
