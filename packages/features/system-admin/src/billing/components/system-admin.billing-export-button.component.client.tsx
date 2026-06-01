"use client";

import { Button } from "@afenda/ui";
import { useTransition } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminBillingUiCopy } from "../surface/system-admin.billing-ui.copy.shared";

export type ExportSystemAdminBillingSummaryAction = () => Promise<
  SystemAdminActionResult<{ csv: string; rowCount: number }>
>;

export function SystemAdminBillingExportButton({
  exportBillingSummaryAction,
}: {
  exportBillingSummaryAction: ExportSystemAdminBillingSummaryAction;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      data-testid="system-admin-billing-export-button"
      onClick={() => {
        startTransition(async () => {
          const result = await exportBillingSummaryAction();

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
          anchor.download = "billing-summary.csv";
          anchor.click();
          URL.revokeObjectURL(url);
        });
      }}
    >
      {systemAdminBillingUiCopy.export.label}
    </Button>
  );
}
