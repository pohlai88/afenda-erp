import { listHrSbsAuditTrailWindow } from "@afenda/db";

export async function listHrSbsAuditEvents(input: {
  organizationId: string;
  search?: string;
  benchmarkVersionId?: string;
  mappingId?: string;
  analysisId?: string;
  limit?: number;
  offset?: number;
}) {
  return listHrSbsAuditTrailWindow(input);
}
