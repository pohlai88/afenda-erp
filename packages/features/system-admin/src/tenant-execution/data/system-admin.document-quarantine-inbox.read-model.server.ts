import {
  listTenantDocumentsByScanStatus,
  type TenantErpDocumentQuarantineWindow,
} from "@afenda/db";
import type { ModuleId } from "@afenda/config/module-ids";
import { formatErpDateTime, formatErpFileSize } from "@afenda/kernel";

export type SystemAdminDocumentQuarantineInboxRow = {
  id: string;
  moduleId: ModuleId;
  title: string;
  contentType: string;
  size: string;
  access: string;
  classification: string;
  retentionClass: string;
  scanStatus: string;
  createdAt: string;
};

export type SystemAdminDocumentQuarantineInboxWindow = {
  rows: readonly SystemAdminDocumentQuarantineInboxRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  nextCursor?: string;
};

function serializeQuarantineDocument(
  document: TenantErpDocumentQuarantineWindow["rows"][number],
): SystemAdminDocumentQuarantineInboxRow {
  return {
    id: document.id,
    moduleId: document.moduleId,
    title: document.title,
    contentType: document.contentType,
    size: formatErpFileSize(document.sizeBytes),
    access: document.access,
    classification: document.classification,
    retentionClass: document.retentionClass,
    scanStatus: document.scanStatus,
    createdAt: formatErpDateTime(document.createdAt, {
      fallback: "Unknown",
      locale: "en-MY",
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kuala_Lumpur",
      timeZoneName: undefined,
    }),
  };
}

export async function loadSystemAdminDocumentQuarantineInboxWindow(input: {
  organizationId: string;
  limit?: number;
  cursor?: string;
}): Promise<SystemAdminDocumentQuarantineInboxWindow> {
  const window = await listTenantDocumentsByScanStatus({
    organizationId: input.organizationId,
    scanStatuses: ["failed", "quarantined"],
    limit: input.limit,
    query: input.cursor ? { cursor: input.cursor } : undefined,
  });

  return {
    rows: window.rows.map(serializeQuarantineDocument),
    pageSize: window.pageSize,
    totalCount: window.totalCount,
    hasNextPage: window.hasNextPage,
    ...(window.nextCursor ? { nextCursor: window.nextCursor } : {}),
  };
}
