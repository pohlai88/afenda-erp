import "server-only"

import { start } from "workflow/api"

import { runWithNodeOtelSpan } from "@afenda/platform/observability/otel-span.server"

import type { PayrollFinalizePayload } from "./payroll-finalize-payload.shared"
import { payrollFinalizeWorkflow } from "./payroll-finalize.workflow"

export async function enqueuePayrollFinalizeWorkflowRun(
  payload: PayrollFinalizePayload,
): Promise<void> {
  await runWithNodeOtelSpan(
    "execution.workflow.payroll_finalize.enqueue",
    {
      "erp.module": "execution",
      "erp.organization.id": payload.organizationId,
      "erp.workflow": "payroll_finalize",
      "erp.payroll.period.id": payload.periodId,
    },
    () => start(payrollFinalizeWorkflow, [payload]),
  )
}
