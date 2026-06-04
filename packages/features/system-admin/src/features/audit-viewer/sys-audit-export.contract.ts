import type { SystemAdminAuditExportFormat } from "./sys-audit-export.schema";

export type SystemAdminAuditExportPayload = {
  format: SystemAdminAuditExportFormat;
  content: string;
  rowCount: number;
  totalCount: number;
  truncated: boolean;
  mimeType: string;
  fileExtension: string;
  encoding: "utf8" | "base64";
};
