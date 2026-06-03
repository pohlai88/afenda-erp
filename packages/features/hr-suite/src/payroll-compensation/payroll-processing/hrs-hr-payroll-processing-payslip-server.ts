import {
  generateHrPayrollPayslips,
  getHrPayrollRunSummary,
  listHrPayrollPayslipsForEmployee,
  listHrPayrollPayslips,
} from "@afenda/db";

import { hrPayrollProcessingAuditActions } from "./hr.payroll.processing.event";
import { writePayrollProcessingAuditEvent } from "./hr.payroll.processing-audit.server";

/** PAY-024 — generate payslips after payroll finalization. */
export async function generatePayrollPayslips(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId: string;
}) {
  const run = await getHrPayrollRunSummary(input);
  if (!run || run.runStatus !== "closed") {
    throw new Error("Payslips require a closed payroll run.");
  }

  return generateHrPayrollPayslips(input);
}

/** PAY-025 — ESS payslip list for authenticated employee. */
export async function listEssPayrollPayslips(input: {
  organizationId: string;
  actorUserId: string;
  employeeId: string;
  limit?: number;
}) {
  const result = await listHrPayrollPayslipsForEmployee(input);
  await writePayrollProcessingAuditEvent({
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    employeeId: input.employeeId,
    action: hrPayrollProcessingAuditActions.payslip.ess_viewed,
    summary: "Employee accessed payslip list via ESS.",
    metadata: { count: result.rows.length },
  });
  return result;
}

export async function listPayrollPayslips(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId?: string;
  limit?: number;
  search?: string;
}) {
  return listHrPayrollPayslips(input);
}
