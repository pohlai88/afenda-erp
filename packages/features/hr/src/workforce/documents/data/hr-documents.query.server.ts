import { listHrEmployeeDocumentsWindow } from "@afenda/db";
import type {
  HrEmployeeDocumentRow,
  HrEmployeeDocumentWindow,
} from "../contracts/hr-document.contract";

export async function listHrEmployeeDocuments(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  employeeId?: string;
  documentType?: string;
}): Promise<HrEmployeeDocumentWindow> {
  const window = await listHrEmployeeDocumentsWindow(input);

  return {
    rows: window.rows.map(mapDocumentRow),
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
  };
}

function mapDocumentRow(
  row: Awaited<
    ReturnType<typeof listHrEmployeeDocumentsWindow>
  >["rows"][number],
): HrEmployeeDocumentRow {
  return {
    id: row.id,
    employeeId: row.employeeId,
    employeeNumber: row.employeeNumber,
    employeeDisplayName: row.employeeDisplayName,
    documentType: row.documentType,
    title: row.title,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    classification: row.classification,
    verificationStatus: row.verificationStatus,
    lifecycleStatus: row.lifecycleStatus,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    uploadedAt: row.uploadedAt,
  };
}
