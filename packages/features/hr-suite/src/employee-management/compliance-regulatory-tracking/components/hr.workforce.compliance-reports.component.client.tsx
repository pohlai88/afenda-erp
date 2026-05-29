"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { type ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { useActionState, useEffect, useRef } from "react";

import { exportHrComplianceReportAction } from "../actions/hr.workforce.compliance.actions.server";
import {
  HR_COMPLIANCE_REPORT_KINDS,
  type HrComplianceReportCsvResult,
  type HrComplianceReportKind,
} from "../data/hr.workforce.compliance.reports.shared";
import { hrComplianceUiCopy } from "../surface/hr.workforce.compliance-ui.copy.shared";

function downloadReportPayload(payload: HrComplianceReportCsvResult) {
  const blob = new Blob([payload.content], { type: payload.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `hr-compliance-${payload.reportKind}-${new Date().toISOString().slice(0, 10)}.${payload.fileExtension}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function HrComplianceReportExportButton({
  reportKind,
}: {
  reportKind: HrComplianceReportKind;
}) {
  const copy = hrComplianceUiCopy.reports;
  const downloadedRef = useRef<string | null>(null);
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<HrComplianceReportCsvResult> | undefined,
      formData: FormData,
    ) => exportHrComplianceReportAction(formData),
    undefined,
  );

  useEffect(() => {
    if (!state?.ok || !state.data) {
      return;
    }

    const downloadKey = `${state.data.reportKind}:${state.data.rowCount}:${state.data.content.length}`;
    if (downloadedRef.current === downloadKey) {
      return;
    }

    downloadedRef.current = downloadKey;
    downloadReportPayload(state.data);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-surface-sm">
      <input type="hidden" name="reportKind" value={reportKind} />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? copy.pendingLabel : copy.exportLabels[reportKind]}
      </Button>
      <ActionFormErrors result={state} />
    </form>
  );
}

export function HrComplianceReportsExportPanel() {
  const copy = hrComplianceUiCopy.reports;

  return (
    <div className="flex flex-col gap-surface-md">
      <p className="type-muted">{copy.panelDescription}</p>
      <div className="flex flex-wrap gap-surface-sm">
        {HR_COMPLIANCE_REPORT_KINDS.map((reportKind) => (
          <HrComplianceReportExportButton key={reportKind} reportKind={reportKind} />
        ))}
      </div>
    </div>
  );
}
