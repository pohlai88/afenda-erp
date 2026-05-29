import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
  type ListSurfaceRow,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { clampHrPageSize, HR_MODULE_ID } from "../../../contracts";
import type { HrEmployeeDocumentRow } from "../contracts/hr-document.contract";
import {
  hrDocumentsSurfaceKey,
  hrDocumentsUiCopy,
} from "./hr-documents-ui.copy.shared";

function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

const VERIFICATION_BADGE: Record<
  HrEmployeeDocumentRow["verificationStatus"],
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  pending: { kind: "badge", tone: "attention" },
  verified: { kind: "badge", tone: "positive" },
  rejected: { kind: "badge", tone: "critical" },
};

const DOCUMENT_COLUMNS = [
  { id: "title", header: "Title", priority: "primary" as const, minWidth: 200 },
  { id: "employee", header: "Employee", minWidth: 160 },
  { id: "documentType", header: "Type", minWidth: 120 },
  {
    id: "verification",
    header: "Verification",
    cellKind: { kind: "badge" as const },
    minWidth: 120,
  },
  { id: "classification", header: "Class", minWidth: 100 },
  { id: "expiresOn", header: "Expires", minWidth: 120 },
  { id: "size", header: "Size", minWidth: 80 },
  { id: "uploadedAt", header: "Uploaded", minWidth: 180 },
] as const;

export function buildHrDocumentsListSurface(input: {
  window: {
    rows: readonly HrEmployeeDocumentRow[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const listCopy = hrDocumentsUiCopy.listSurface;
  const pageSize = clampHrPageSize(input.window.pageSize);

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: {
        search: {
          param: "documentsQ",
          label: "Search",
          placeholder: listCopy.searchPlaceholder,
          value: input.searchValue,
        },
        densityToggle: true,
        columnPicker: true,
        resetParams: ["documentsQ", "employeeId", "documentType"],
      },
    },
    requiresErpPermission: {
      module: HR_MODULE_ID,
      object: "documents",
      function: "read",
    },
    pagination: {
      pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: {
        title: hrDocumentsUiCopy.section.title,
        description: hrDocumentsUiCopy.section.description,
      },
      columnsId: "hr-workforce-documents",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: listCopy.emptyTitle,
        description: listCopy.emptyDescription,
      },
    },
    columns: [...DOCUMENT_COLUMNS],
    rows: input.window.rows.map((document) => ({
      id: document.id,
      cells: {
        title: document.title,
        employee: `${document.employeeNumber} — ${document.employeeDisplayName}`,
        documentType: document.documentType,
        verification: document.verificationStatus,
        classification: document.classification,
        expiresOn: document.effectiveTo
          ? formatErpDateTime(document.effectiveTo)
          : "—",
        size: formatBytes(document.sizeBytes),
        uploadedAt: formatErpDateTime(document.uploadedAt),
      },
      cellKinds: {
        verification: VERIFICATION_BADGE[document.verificationStatus],
      },
    })),
  });
}

export { hrDocumentsSurfaceKey };
