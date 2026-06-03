import { writeExecutionAuditEvent } from "@afenda/kernel/execution";

/** PAY-030 — execution audit for payroll lifecycle events. */
export async function writePayrollProcessingAuditEvent(input: {
  organizationId: string;
  actorUserId: string;
  action: string;
  summary: string;
  payrollRunId?: string | null;
  employeeId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorUserId,
    actorType: "user",
    action: input.action,
    targetType: "hr_payroll_run",
    targetId: input.payrollRunId ?? input.employeeId ?? "payroll",
    summary: input.summary,
    metadata: {
      payrollRunId: input.payrollRunId ?? null,
      employeeId: input.employeeId ?? null,
      ...input.metadata,
    },
  });
}

export { listHrPayrollAuditTrail } from "@afenda/db";
