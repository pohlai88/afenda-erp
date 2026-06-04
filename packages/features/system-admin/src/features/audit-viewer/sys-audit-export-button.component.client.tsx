"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui";
import { useState, useTransition } from "react";
import {
  systemAdminActionFailure,
  type SystemAdminActionResult,
} from "../tenant-execution/sys-action-result.contract";
import type { SystemAdminAuditExportPayload } from "./sys-audit-export.contract";
import type { SystemAdminAuditExportFormat } from "./sys-audit-export.schema";
import { systemAdminAuditUiCopy } from "./sys-audit-ui.copy.shared";

export type { SystemAdminAuditExportPayload };

export type ExportSystemAdminAuditLogsAction = (
  formData: FormData,
) => Promise<SystemAdminActionResult<SystemAdminAuditExportPayload>>;

const FORMAT_LABEL: Record<SystemAdminAuditExportFormat, keyof typeof systemAdminAuditUiCopy.export> = {
  csv: "csvLabel",
  json: "jsonLabel",
  xlsx: "csvLabel",
  pdf: "csvLabel",
};

export function SystemAdminAuditExportButton({
  format,
  exportAuditLogsAction,
  filterFields,
}: {
  format: SystemAdminAuditExportFormat;
  exportAuditLogsAction: ExportSystemAdminAuditLogsAction;
  filterFields: Record<string, string>;
}) {
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<
    SystemAdminActionResult<SystemAdminAuditExportPayload> | undefined
  >();
  const labelKey = FORMAT_LABEL[format];

  return (
    <div className="flex flex-col items-start gap-surface-sm">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const formData = new FormData();
            formData.set("format", format);
            for (const [key, value] of Object.entries(filterFields)) {
              if (value) {
                formData.set(key, value);
              }
            }

            const result = await exportAuditLogsAction(formData);

            if (!result.ok) {
              setLastResult(result);
              return;
            }

            if (!result.data) {
              setLastResult(systemAdminActionFailure("Export payload was missing."));
              return;
            }

            setLastResult(undefined);
            const blob = new Blob([result.data.content], {
              type: result.data.mimeType,
            });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `system-admin-audit-${new Date().toISOString().slice(0, 10)}.${result.data.fileExtension}`;
            anchor.click();
            URL.revokeObjectURL(url);
          });
        }}
      >
        {pending
          ? systemAdminAuditUiCopy.export.pendingLabel
          : systemAdminAuditUiCopy.export[labelKey]}
      </Button>
      <ActionFormErrors result={lastResult} />
    </div>
  );
}
