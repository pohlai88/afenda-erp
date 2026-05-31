"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { useActionState, useEffect, useRef } from "react";

import { exportHrTimeClockReportAction } from "../actions/hr.time.clock-integration.actions.server";
import {
  HR_TIME_CLOCK_REPORT_KINDS,
  type HrTimeClockReportCsvResult,
  type HrTimeClockReportKind,
} from "../data/hr.time.clock-integration-reports.shared";
import { hrTimeClockUiCopy } from "../surface/hr.time.clock-integration-ui.copy.shared";

function downloadReportPayload(payload: HrTimeClockReportCsvResult) {
  const blob = new Blob([payload.content], { type: payload.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `hr-time-clock-${payload.reportKind}-${new Date().toISOString().slice(0, 10)}.${payload.fileExtension}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function HrTimeClockReportExportButton({
  reportKind,
}: {
  reportKind: HrTimeClockReportKind;
}) {
  const copy = hrTimeClockUiCopy.reports;
  const downloadedRef = useRef<string | null>(null);
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<HrTimeClockReportCsvResult> | undefined,
      formData: FormData,
    ) => exportHrTimeClockReportAction(formData),
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

export function HrTimeClockReportsExportPanel() {
  const copy = hrTimeClockUiCopy.reports;

  return (
    <div className="flex flex-col gap-surface-md">
      <p className="type-muted">{copy.panelDescription}</p>
      <div className="flex flex-wrap gap-surface-sm">
        {HR_TIME_CLOCK_REPORT_KINDS.map((reportKind) => (
          <HrTimeClockReportExportButton key={reportKind} reportKind={reportKind} />
        ))}
      </div>
    </div>
  );
}
