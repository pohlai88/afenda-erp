import type { SystemAdminAuditExportFormat } from "../schemas/system-admin.audit-export.schema";

export type SystemAdminAuditExportPayload = {
  format: SystemAdminAuditExportFormat;
  content: string;
  rowCount: number;
  mimeType: string;
  fileExtension: string;
  encoding: "utf8" | "base64";
};
