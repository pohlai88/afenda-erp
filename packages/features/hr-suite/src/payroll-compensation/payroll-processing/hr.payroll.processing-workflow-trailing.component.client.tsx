"use client";

import type { PayrollRunStatus } from "./hr.payroll.processing-mutation.schema";

const WORKFLOW_LABELS: Record<string, string> = {
  draft: "Draft",
  validation: "Validated",
  preview: "Preview",
  pending_approval: "Pending approval",
  approved: "Approved",
  locked: "Locked",
  closed: "Closed",
};

export function HrPayrollRunWorkflowTrailingCell({
  runStatus,
  canApprove,
}: {
  runStatus: PayrollRunStatus | string;
  canApprove?: boolean;
}) {
  const label = WORKFLOW_LABELS[runStatus] ?? runStatus;

  return (
    <span className="inline-flex items-center gap-surface-sm type-control">
      <span className="rounded-full bg-muted px-2 py-0.5 type-caption font-medium">
        {label}
      </span>
      {canApprove && runStatus === "pending_approval" ? (
        <span className="type-muted">Awaiting approval</span>
      ) : null}
    </span>
  );
}
