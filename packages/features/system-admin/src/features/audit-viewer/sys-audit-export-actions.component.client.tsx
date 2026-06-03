"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui";
import { useState, useTransition } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import type { SystemAdminAuditExportPayload } from "../contracts/system-admin.audit-export.contract";
import type { SystemAdminAuditExportFormat } from "../schemas/system-admin.audit-export.schema";
import { systemAdminAuditUiCopy } from "../surface/system-admin.audit-ui.copy.shared";
import type { ExportSystemAdminAuditLogsAction } from "./system-admin.audit-export-button.component.client";

const EXPORT_FORMATS = ["csv", "json", "xlsx", "pdf"] as const;

const FORMAT_LABEL: Record<
  SystemAdminAuditExportFormat,
  keyof typeof systemAdminAuditUiCopy.export
> = {
  csv: "csvLabel",
  json: "jsonLabel",
  xlsx: "xlsxLabel",
  pdf: "pdfLabel",
};

function downloadExportPayload(payload: SystemAdminAuditExportPayload) {
  const bytes =
    payload.encoding === "base64"
      ? Uint8Array.from(atob(payload.content), (char) => char.charCodeAt(0))
      : new TextEncoder().encode(payload.content);

  const blob = new Blob([bytes], { type: payload.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `system-admin-audit-${new Date().toISOString().slice(0, 10)}.${payload.fileExtension}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SystemAdminAuditExportActions({
  exportAuditLogsAction,
  filterFields,
}: {
  exportAuditLogsAction: ExportSystemAdminAuditLogsAction;
  filterFields: Record<string, string>;
}) {
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<
    SystemAdminActionResult<SystemAdminAuditExportPayload> | undefined
  >();

  const runExport = (format: SystemAdminAuditExportFormat) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("format", format);
      for (const [key, value] of Object.entries(filterFields)) {
        if (value) {
          formData.set(key, value);
        }
      }

      const result = await exportAuditLogsAction(formData);
      setLastResult(result);

      if (!result.ok || !result.data) {
        return;
      }

      downloadExportPayload(result.data);
    });
  };

  return (
    <div className="flex flex-col items-end gap-surface-sm">
      <ActionFormErrors result={lastResult} />
      <div className="flex flex-wrap justify-end gap-surface-sm">
        {EXPORT_FORMATS.map((format) => (
          <Button
            key={format}
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => runExport(format)}
          >
            {pending
              ? systemAdminAuditUiCopy.export.pendingLabel
              : systemAdminAuditUiCopy.export[FORMAT_LABEL[format]]}
          </Button>
        ))}
      </div>
    </div>
  );
}
