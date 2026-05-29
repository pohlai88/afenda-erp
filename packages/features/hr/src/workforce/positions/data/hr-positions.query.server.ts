import { listHrPositions } from "@afenda/db";

export async function listHrPositionCatalog(input: {
  organizationId: string;
  limit?: number;
}) {
  return listHrPositions(input);
}
