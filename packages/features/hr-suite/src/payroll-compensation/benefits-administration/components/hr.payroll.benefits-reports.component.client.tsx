"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { type ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { useActionState, useEffect, useRef } from "react";

import { exportHrBenefitReportAction } from "../actions/hr.payroll.benefits.actions.server";
import {
  HR_BENEFIT_REPORT_KINDS,
  type HrBenefitReportCsvResult,
  type HrBenefitReportKind,
} from "../data/hr.payroll.benefits-reports.shared";
import { hrBenefitsUiCopy } from "../surface/hr.payroll.benefits-ui.copy.shared";

function downloadReportPayload(payload: HrBenefitReportCsvResult) {
  const blob = new Blob([payload.content], { type: payload.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `hr-benefits-${payload.reportKind}-${new Date().toISOString().slice(0, 10)}.${payload.fileExtension}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

const REPORT_LABELS: Record<HrBenefitReportKind, string> = {
  cost: hrBenefitsUiCopy.reports.costLabel,
  enrollment: hrBenefitsUiCopy.reports.enrollmentLabel,
  payroll_deduction: hrBenefitsUiCopy.reports.deductionLabel,
};

function HrBenefitsReportExportButton({
  reportKind,
}: {
  reportKind: HrBenefitReportKind;
}) {
  const copy = hrBenefitsUiCopy.reports;
  const downloadedRef = useRef<string | null>(null);
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<HrBenefitReportCsvResult> | undefined,
      formData: FormData,
    ) => exportHrBenefitReportAction(formData),
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
        {pending ? "Exporting…" : `${REPORT_LABELS[reportKind]} — ${copy.downloadLabel}`}
      </Button>
      <ActionFormErrors result={state} />
    </form>
  );
}

export function HrBenefitsReportsExportPanel() {
  const copy = hrBenefitsUiCopy.reports;

  return (
    <div className="flex flex-col gap-surface-md">
      <p className="type-muted">{copy.sectionDescription}</p>
      <div className="flex flex-wrap gap-surface-sm">
        {HR_BENEFIT_REPORT_KINDS.map((reportKind) => (
          <HrBenefitsReportExportButton key={reportKind} reportKind={reportKind} />
        ))}
      </div>
    </div>
  );
}
