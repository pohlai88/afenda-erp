"use client";

import { Button } from "@afenda/ui";
import { DownloadIcon } from "lucide-react";
import { useTransition } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import type { ExportSystemAdminDataManagementActionData } from "../contracts";
import { systemAdminDataManagementUiCopy } from "../surface/system-admin.data-management-ui.copy.shared";

export type ExportSystemAdminDataManagementAction = (input?: {
  scope?: "jobs" | "failures" | "exports";
}) => Promise<SystemAdminActionResult<ExportSystemAdminDataManagementActionData>>;

export function SystemAdminDataManagementExportButton({
  exportDataManagementAction,
}: {
  exportDataManagementAction: ExportSystemAdminDataManagementAction;
}) {
  const [pending, startTransition] = useTransition();
  const copy = systemAdminDataManagementUiCopy.exports;

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await exportDataManagementAction({ scope: "jobs" });

          if (!result.ok || !result.data) {
            if (!result.ok) {
              console.error(result.error);
            }
            return;
          }

          const blob = new Blob([result.data.csv], {
            type: "text/csv;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `system-admin-data-management-${new Date().toISOString().slice(0, 10)}.csv`;
          anchor.click();
          URL.revokeObjectURL(url);
        });
      }}
    >
      <DownloadIcon data-icon="inline-start" />
      {pending ? copy.pendingButtonLabel : copy.buttonLabel}
    </Button>
  );
}
