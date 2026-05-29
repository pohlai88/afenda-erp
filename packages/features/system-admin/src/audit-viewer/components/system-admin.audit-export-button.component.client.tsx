"use client";

import { Button } from "@afenda/ui";
import { useTransition } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { exportSystemAdminAuditLogsAction } from "../actions/system-admin.audit.actions.server";

export function SystemAdminAuditExportButton({
  filterFields,
}: {
  filterFields: Record<string, string>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const formData = new FormData();
          for (const [key, value] of Object.entries(filterFields)) {
            if (value) {
              formData.set(key, value);
            }
          }

          const result = (await exportSystemAdminAuditLogsAction(
            formData,
          )) as SystemAdminActionResult<{ csv: string; rowCount: number }>;

          if (!result.ok) {
            console.error(result.error);
            return;
          }

          if (!result.data) {
            return;
          }

          const blob = new Blob([result.data.csv], {
            type: "text/csv;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `system-admin-audit-${new Date().toISOString().slice(0, 10)}.csv`;
          anchor.click();
          URL.revokeObjectURL(url);
        });
      }}
    >
      {pending ? "Exporting…" : "Export evidence (CSV)"}
    </Button>
  );
}
