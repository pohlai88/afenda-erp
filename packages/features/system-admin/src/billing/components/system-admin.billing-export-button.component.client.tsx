"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui";
import { useState, useTransition } from "react";
import {
  systemAdminActionFailure,
  type SystemAdminActionResult,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
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
  const [lastResult, setLastResult] = useState<
    SystemAdminActionResult<{ csv: string; rowCount: number }> | undefined
  >();

  return (
    <div className="flex flex-col items-start gap-surface-sm">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        data-testid="system-admin-billing-export-button"
        onClick={() => {
          startTransition(async () => {
            const result = await exportBillingSummaryAction();

            if (!result.ok) {
              setLastResult(result);
              return;
            }

            if (!result.data) {
              setLastResult(systemAdminActionFailure("Export payload was missing."));
              return;
            }

            setLastResult(undefined);
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
      <ActionFormErrors result={lastResult} />
    </div>
  );
}
