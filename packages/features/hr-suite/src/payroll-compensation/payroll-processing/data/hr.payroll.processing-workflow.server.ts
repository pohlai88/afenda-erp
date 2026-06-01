import {
  approveHrPayrollRun,
  calculateHrPayrollRun,
  finalizeHrPayrollRun,
  getHrPayrollRunSummary,
  lockHrPayrollRun,
  previewHrPayrollRun,
  submitHrPayrollRunForApproval,
  type HrPayrollRunCalculationResult,
} from "@afenda/db";

import { hrPayrollProcessingAuditActions } from "../events/hr.payroll.processing.event";
import { writePayrollProcessingAuditEvent } from "./hr.payroll.processing-audit.server";
import { PAYROLL_WORKFLOW_TRANSITIONS } from "./hr.payroll.processing-workflow.shared";

export { PAYROLL_WORKFLOW_TRANSITIONS };

/** PAY-021 — payroll preview before final approval. */
export async function generatePayrollPreview(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId: string;
}) {
  const result = await previewHrPayrollRun(input);
  await writePayrollProcessingAuditEvent({
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    payrollRunId: input.payrollRunId,
    action: hrPayrollProcessingAuditActions.run.previewed,
    summary: "Payroll preview reviewed.",
  });
  return result;
}

/** PAY-022 — submit payroll for approval workflow. */
export async function submitPayrollForApproval(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId: string;
}) {
  return submitHrPayrollRunForApproval(input);
}

/** PAY-022 — approve payroll run. */
export async function approvePayrollRun(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId: string;
}) {
  return approveHrPayrollRun(input);
}

/** PAY-023 — lock payroll after final approval. */
export async function lockPayrollRun(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId: string;
}) {
  return lockHrPayrollRun(input);
}

/** PAY-020/024 — finalize payroll (blocking validation enforced in DB). */
export async function finalizePayrollRun(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId: string;
}) {
  return finalizeHrPayrollRun(input);
}

export async function calculatePayrollRun(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId: string;
}): Promise<HrPayrollRunCalculationResult> {
  return calculateHrPayrollRun(input);
}

export async function getPayrollRunWorkflowState(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId: string;
}) {
  return getHrPayrollRunSummary(input);
}
