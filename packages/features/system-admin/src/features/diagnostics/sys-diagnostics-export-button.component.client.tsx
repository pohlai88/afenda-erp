"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui";
import { DownloadIcon } from "lucide-react";
import { useState, useTransition } from "react";
import {
  systemAdminActionFailure,
  type SystemAdminActionResult,
} from "../tenant-execution/sys-action-result.contract";
import { systemAdminDiagnosticsUiCopy } from "./sys-diagnostics-ui.copy.shared";

export type ExportSystemAdminDiagnosticsAction = () => Promise<
  SystemAdminActionResult<{ csv: string; rowCount: number }>
>;

export function SystemAdminDiagnosticsExportButton({
  exportDiagnosticsAction,
}: {
  exportDiagnosticsAction: ExportSystemAdminDiagnosticsAction;
}) {
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<
    SystemAdminActionResult<{ csv: string; rowCount: number }> | undefined
  >();

  return (
    <div className="flex flex-col items-start gap-surface-sm">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await exportDiagnosticsAction();

            if (!result.ok) {
              setLastResult(result);
              return;
            }

            if (!result.data) {
              setLastResult(systemAdminActionFailure("Export payload was missing."));
              return;
            }

            setLastResult(undefined);
            const blob = new Blob([result.data.csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `system-admin-diagnostics-${new Date().toISOString().slice(0, 10)}.csv`;
            anchor.click();
            URL.revokeObjectURL(url);
          });
        }}
      >
        <DownloadIcon data-icon="inline-start" />
        {pending
          ? systemAdminDiagnosticsUiCopy.export.pendingLabel
          : systemAdminDiagnosticsUiCopy.export.label}
      </Button>
      <ActionFormErrors result={lastResult} />
    </div>
  );
}
