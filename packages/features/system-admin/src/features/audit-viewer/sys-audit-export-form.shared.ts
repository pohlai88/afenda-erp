import { readOptionalFormValue } from "../tenant-execution/sys-execution-settings.shared";
import { SYSTEM_ADMIN_AUDIT_DEFAULT_PAGE_SIZE } from "./sys-audit-viewer.limits.shared";
import { systemAdminAuditExportFormatSchema } from "./sys-audit-export.schema";
import {
  systemAdminAuditSearchParamsSchema,
} from "./sys-audit-filter.schema";

export function parseSystemAdminAuditExportFormData(formData: FormData) {
  const readField = (key: string) => readOptionalFormValue(formData.get(key));

  const formatParsed = systemAdminAuditExportFormatSchema.safeParse(
    readField("format") ?? "csv",
  );

  const paramsParsed = systemAdminAuditSearchParamsSchema.safeParse({
    auditQ: readField("auditQ"),
    auditActor: readField("auditActor"),
    auditAction: readField("auditAction"),
    auditTargetType: readField("auditTargetType"),
    auditTargetId: readField("auditTargetId"),
    auditModule: readField("auditModule"),
    auditOutcome: readField("auditOutcome"),
    auditFrom: readField("auditFrom"),
    auditTo: readField("auditTo"),
    auditSort: readField("auditSort"),
    auditPage: 1,
    auditPageSize: SYSTEM_ADMIN_AUDIT_DEFAULT_PAGE_SIZE,
  });

  return {
    formatParsed,
    paramsParsed,
  };
}
