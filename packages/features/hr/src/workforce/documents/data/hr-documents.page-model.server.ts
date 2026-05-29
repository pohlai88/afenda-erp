import { listHrDocumentRequirements } from "@afenda/db";
import { clampHrPageSize } from "../../../contracts/pagination";
import { listHrEmployeeDocuments } from "./hr-documents.query.server";

export async function buildHrDocumentsPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
  limit?: number;
}) {
  const searchValue =
    typeof input.searchParams?.documentsQ === "string"
      ? input.searchParams.documentsQ
      : undefined;
  const employeeId =
    typeof input.searchParams?.employeeId === "string"
      ? input.searchParams.employeeId
      : undefined;
  const documentType =
    typeof input.searchParams?.documentType === "string"
      ? input.searchParams.documentType
      : undefined;

  const [window, requirements] = await Promise.all([
    listHrEmployeeDocuments({
      organizationId: input.organizationId,
      limit: clampHrPageSize(input.limit ?? 25),
      search: searchValue,
      employeeId,
      documentType,
    }),
    listHrDocumentRequirements({ organizationId: input.organizationId }),
  ]);

  return { window, requirements, searchValue, employeeId, documentType };
}
