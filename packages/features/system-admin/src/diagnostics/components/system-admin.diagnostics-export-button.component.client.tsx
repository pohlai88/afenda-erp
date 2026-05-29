"use client";

import { Button } from "@afenda/ui";
import { DownloadIcon } from "lucide-react";
import { useTransition } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminDiagnosticsUiCopy } from "../surface/system-admin.diagnostics-ui.copy.shared";

export type ExportSystemAdminDiagnosticsAction = () => Promise<
  SystemAdminActionResult<{ csv: string; rowCount: number }>
>;

export function SystemAdminDiagnosticsExportButton({
  exportDiagnosticsAction,
}: {
  exportDiagnosticsAction: ExportSystemAdminDiagnosticsAction;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await exportDiagnosticsAction();

          if (!result.ok || !result.data) {
            console.error(result.ok ? "Missing export payload" : result.error);
            return;
          }

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
  );
}
