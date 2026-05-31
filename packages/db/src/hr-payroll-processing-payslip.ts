import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrPayrollAuditEventInTx } from "./hr-payroll-processing-audit";
import { HrPayrollCommandError } from "./hr-payroll-processing.shared";
import {
  hrPayrollPayslips,
  hrPayrollRunLines,
  hrPayrollRuns,
} from "./schema/hr-payroll-processing";

/** PAY-024 — generate payslips after finalization. */
export async function generateHrPayrollPayslipsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payrollRunId: string;
  },
) {
  const [run] = await db
    .select({
      runStatus: hrPayrollRuns.runStatus,
      cycleId: hrPayrollRuns.cycleId,
      runNumber: hrPayrollRuns.runNumber,
    })
    .from(hrPayrollRuns)
    .where(
      and(
        eq(hrPayrollRuns.organizationId, input.organizationId),
        eq(hrPayrollRuns.id, input.payrollRunId),
      ),
    )
    .limit(1);

  if (!run || run.runStatus !== "closed") {
    throw new HrPayrollCommandError(
      "invalid_status_transition",
      "Payslips can only be generated for closed payroll runs.",
    );
  }

  const lines = await db
    .select({
      id: hrPayrollRunLines.id,
      employeeId: hrPayrollRunLines.employeeId,
      grossPay: hrPayrollRunLines.grossPay,
      netPay: hrPayrollRunLines.netPay,
      currencyCode: hrPayrollRunLines.currencyCode,
      lineSnapshot: hrPayrollRunLines.lineSnapshot,
    })
    .from(hrPayrollRunLines)
    .where(
      and(
        eq(hrPayrollRunLines.organizationId, input.organizationId),
        eq(hrPayrollRunLines.runId, input.payrollRunId),
      ),
    );

  const now = new Date();
  const payslipIds: string[] = [];

  for (const line of lines) {
    const payslipId = createEntityId("pay_psl");
    const payslipNumber = `PS-${run.runNumber}-${line.employeeId.slice(-6)}`;
    const lineItems = line.lineSnapshot.components.map((component) => ({
      code: component.code,
      label: component.label,
      kind: component.kind,
      amount: component.amount,
    }));

    await db.insert(hrPayrollPayslips).values({
      id: payslipId,
      organizationId: input.organizationId,
      runId: input.payrollRunId,
      cycleId: run.cycleId,
      runLineId: line.id,
      employeeId: line.employeeId,
      payslipNumber,
      payslipStatus: "finalized",
      grossPay: line.grossPay,
      netPay: line.netPay,
      currencyCode: line.currencyCode,
      lineItems,
      essAccessible: true,
      essPublishedAt: now,
      finalizedAt: now,
    });
    payslipIds.push(payslipId);
  }

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    cycleId: run.cycleId,
    runId: input.payrollRunId,
    actorUserId: input.actorUserId,
    action: "hr.payroll.payslip.generated",
    summary: `Generated ${payslipIds.length} payslips.`,
    metadata: { payslipCount: payslipIds.length },
  });

  return { payslipIds, count: payslipIds.length };
}

/** PAY-025 — ESS payslip read (employee-scoped). */
export async function listHrPayrollPayslipsForEmployeeInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    limit?: number;
  },
) {
  const limit = input.limit ?? 25;
  const rows = await db
    .select({
      id: hrPayrollPayslips.id,
      payslipNumber: hrPayrollPayslips.payslipNumber,
      runId: hrPayrollPayslips.runId,
      finalizedAt: hrPayrollPayslips.finalizedAt,
      grossPay: hrPayrollPayslips.grossPay,
      netPay: hrPayrollPayslips.netPay,
      lineItems: hrPayrollPayslips.lineItems,
    })
    .from(hrPayrollPayslips)
    .where(
      and(
        eq(hrPayrollPayslips.organizationId, input.organizationId),
        eq(hrPayrollPayslips.employeeId, input.employeeId),
        eq(hrPayrollPayslips.essAccessible, true),
      ),
    )
    .limit(limit);

  return {
    rows,
    pageSize: limit,
    totalCount: rows.length,
    hasNextPage: false,
  };
}

export async function listHrPayrollPayslipsWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    payrollRunId?: string;
    limit?: number;
    search?: string;
  },
) {
  const limit = input.limit ?? 25;
  const conditions = [eq(hrPayrollPayslips.organizationId, input.organizationId)];
  if (input.payrollRunId) {
    conditions.push(eq(hrPayrollPayslips.runId, input.payrollRunId));
  }

  const rows = await db
    .select({
      id: hrPayrollPayslips.id,
      payslipNumber: hrPayrollPayslips.payslipNumber,
      employeeId: hrPayrollPayslips.employeeId,
      runId: hrPayrollPayslips.runId,
      payslipStatus: hrPayrollPayslips.payslipStatus,
      netPay: hrPayrollPayslips.netPay,
      essAccessible: hrPayrollPayslips.essAccessible,
      finalizedAt: hrPayrollPayslips.finalizedAt,
    })
    .from(hrPayrollPayslips)
    .where(and(...conditions))
    .limit(limit);

  const filtered = input.search
    ? rows.filter((row) =>
        row.payslipNumber.toLowerCase().includes(input.search!.toLowerCase()),
      )
    : rows;

  return {
    rows: filtered,
    pageSize: limit,
    totalCount: filtered.length,
    hasNextPage: false,
  };
}

export async function getHrPayrollPayslipForEmployeeInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    payslipId: string;
  },
) {
  const [row] = await db
    .select()
    .from(hrPayrollPayslips)
    .where(
      and(
        eq(hrPayrollPayslips.organizationId, input.organizationId),
        eq(hrPayrollPayslips.id, input.payslipId),
        eq(hrPayrollPayslips.employeeId, input.employeeId),
        eq(hrPayrollPayslips.essAccessible, true),
      ),
    )
    .limit(1);

  return row ?? null;
}
