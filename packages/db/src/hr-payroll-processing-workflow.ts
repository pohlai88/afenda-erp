import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrPayrollAuditEventInTx } from "./hr-payroll-processing-audit";
import { buildPaginatedWindow, clampPageSize } from "./hr-benefits.shared";
import {
  computePayrollLineBreakdown,
  computePayrollVariancePercent,
  sumPayrollBreakdownTotals,
} from "./hr-payroll-processing-calculations.shared";
import {
  assertHrPayrollRunStatusTransition,
  formatPayrollNumeric,
  HrPayrollCommandError,
  isHrPayrollRunLocked,
} from "./hr-payroll-processing.shared";
import {
  hasBlockingPayrollValidationFindings,
  type HrPayrollRunCalculationResult,
  validatePayrollReadiness,
} from "./hr-payroll-processing-validation.shared";
import {
  hrPayrollCycles,
  hrPayrollEmployeeAssignments,
  hrPayrollRunLines,
  hrPayrollRuns,
  hrPayrollValidations,
} from "./dbx-hr-payroll-processing";
import { hrEmployees } from "./hr";

const DEFAULT_BASIC_SALARY = 5000;

export async function getHrPayrollRunSummaryInTx(
  db: AfendaTransaction,
  input: { organizationId: string; payrollRunId: string },
) {
  const [run] = await db
    .select()
    .from(hrPayrollRuns)
    .where(
      and(
        eq(hrPayrollRuns.organizationId, input.organizationId),
        eq(hrPayrollRuns.id, input.payrollRunId),
      ),
    )
    .limit(1);

  return run ?? null;
}

async function loadRunOrThrow(
  db: AfendaTransaction,
  organizationId: string,
  payrollRunId: string,
) {
  const run = await getHrPayrollRunSummaryInTx(db, {
    organizationId,
    payrollRunId,
  });
  if (!run) {
    throw new HrPayrollCommandError("run_not_found");
  }
  return run;
}

async function loadCyclePayGroupId(
  db: AfendaTransaction,
  organizationId: string,
  cycleId: string,
) {
  const [cycle] = await db
    .select({ payGroupId: hrPayrollCycles.payGroupId })
    .from(hrPayrollCycles)
    .where(
      and(
        eq(hrPayrollCycles.organizationId, organizationId),
        eq(hrPayrollCycles.id, cycleId),
      ),
    )
    .limit(1);

  if (!cycle) {
    throw new HrPayrollCommandError("cycle_not_found");
  }

  return cycle.payGroupId;
}

async function persistValidationFindingsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    payrollRunId: string;
    cycleId: string;
    findings: ReturnType<typeof validatePayrollReadiness>;
  },
) {
  await db
    .delete(hrPayrollValidations)
    .where(
      and(
        eq(hrPayrollValidations.organizationId, input.organizationId),
        eq(hrPayrollValidations.runId, input.payrollRunId),
      ),
    );

  if (input.findings.length === 0) {
    return;
  }

  await db.insert(hrPayrollValidations).values(
    input.findings.map((finding) => ({
      id: createEntityId("pay_val"),
      organizationId: input.organizationId,
      runId: input.payrollRunId,
      cycleId: input.cycleId,
      employeeId: finding.employeeId ?? null,
      validationKind: finding.severity === "blocking" ? "blocking_error" as const : "readiness" as const,
      severity: finding.severity === "blocking" ? "blocking" as const : finding.severity === "warning" ? "warning" as const : "info" as const,
      code: finding.code,
      message: finding.message,
      isBlocking: finding.severity === "blocking",
    })),
  );
}

/** PAY-004..020 — calculate payroll run lines and validations. */
export async function calculateHrPayrollRunInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payrollRunId: string;
  },
): Promise<HrPayrollRunCalculationResult> {
  const run = await loadRunOrThrow(
    db,
    input.organizationId,
    input.payrollRunId,
  );

  if (isHrPayrollRunLocked(run.runStatus, run.lockedAt)) {
    throw new HrPayrollCommandError("run_locked");
  }

  assertHrPayrollRunStatusTransition(run.runStatus, "validation");

  const payGroupId = await loadCyclePayGroupId(
    db,
    input.organizationId,
    run.cycleId,
  );

  const assignments = await db
    .select({
      employeeId: hrPayrollEmployeeAssignments.employeeId,
      employeeNumber: hrEmployees.employeeNumber,
    })
    .from(hrPayrollEmployeeAssignments)
    .innerJoin(
      hrEmployees,
      eq(hrPayrollEmployeeAssignments.employeeId, hrEmployees.id),
    )
    .where(
      and(
        eq(hrPayrollEmployeeAssignments.organizationId, input.organizationId),
        eq(hrPayrollEmployeeAssignments.payGroupId, payGroupId),
        eq(hrPayrollEmployeeAssignments.assignmentStatus, "active"),
      ),
    );

  await db
    .delete(hrPayrollRunLines)
    .where(
      and(
        eq(hrPayrollRunLines.organizationId, input.organizationId),
        eq(hrPayrollRunLines.runId, input.payrollRunId),
      ),
    );

  const breakdowns = [];
  const lineRows: Array<{
    id: string;
    organizationId: string;
    runId: string;
    cycleId: string;
    employeeId: string;
    grossPay: string;
    totalDeductions: string;
    totalTax: string;
    totalStatutoryEmployee: string;
    totalStatutoryEmployer: string;
    totalEmployerCost: string;
    netPay: string;
    currencyCode: string;
    lineSnapshot: ReturnType<typeof computePayrollLineBreakdown>["snapshot"];
    variancePercent: string | null;
    missingDataFlags: string[] | null;
  }> = [];

  for (const assignment of assignments) {
    const basicSalary = DEFAULT_BASIC_SALARY;
    const breakdown = computePayrollLineBreakdown({ basicSalary });
    breakdowns.push(breakdown);
    lineRows.push({
      id: createEntityId("pay_line"),
      organizationId: input.organizationId,
      runId: input.payrollRunId,
      cycleId: run.cycleId,
      employeeId: assignment.employeeId,
      grossPay: formatPayrollNumeric(breakdown.grossPay),
      totalDeductions: formatPayrollNumeric(breakdown.totalDeductions),
      totalTax: formatPayrollNumeric(breakdown.totalTax),
      totalStatutoryEmployee: formatPayrollNumeric(breakdown.totalStatutoryEmployee),
      totalStatutoryEmployer: formatPayrollNumeric(breakdown.totalStatutoryEmployer),
      totalEmployerCost: formatPayrollNumeric(breakdown.totalEmployerCost),
      netPay: formatPayrollNumeric(breakdown.netPay),
      currencyCode: breakdown.snapshot.currencyCode,
      lineSnapshot: breakdown.snapshot,
      variancePercent: null,
      missingDataFlags: basicSalary <= 0 ? ["basic_salary"] : null,
    });
  }

  if (lineRows.length > 0) {
    await db.insert(hrPayrollRunLines).values(lineRows);
  }

  const totals = sumPayrollBreakdownTotals(breakdowns);
  const findings = validatePayrollReadiness({
    employees: assignments.map((row) => ({
      employeeId: row.employeeId,
      basicSalary: DEFAULT_BASIC_SALARY,
      bankAccountRef: null,
      missingFields: DEFAULT_BASIC_SALARY <= 0 ? (["basic_salary"] as const) : [],
    })),
    lines: lineRows.map((row) => ({
      employeeId: row.employeeId,
      netPay: parseFloat(row.netPay),
      variancePercent: computePayrollVariancePercent({
        currentNetPay: parseFloat(row.netPay),
        previousNetPay: null,
      }),
    })),
  });

  await persistValidationFindingsInTx(db, {
    organizationId: input.organizationId,
    payrollRunId: input.payrollRunId,
    cycleId: run.cycleId,
    findings,
  });

  const blockingCount = findings.filter((f) => f.severity === "blocking").length;

  await db
    .update(hrPayrollRuns)
    .set({
      runStatus: "validation",
      totalGrossPay: formatPayrollNumeric(totals.totalGrossPay),
      totalNetPay: formatPayrollNumeric(totals.totalNetPay),
      totalEmployerCost: formatPayrollNumeric(totals.totalEmployerCost),
      employeeCount: lineRows.length,
      blockingErrorCount: blockingCount,
      validationPassed: blockingCount === 0,
    })
    .where(eq(hrPayrollRuns.id, input.payrollRunId));

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    cycleId: run.cycleId,
    runId: input.payrollRunId,
    actorUserId: input.actorUserId,
    action: "hr.payroll.run.calculated",
    summary: "Payroll run calculated.",
    metadata: { lineCount: lineRows.length, findings: findings.length },
  });

  return {
    payrollRunId: input.payrollRunId,
    lineCount: lineRows.length,
    findings,
    hasBlockingFindings: hasBlockingPayrollValidationFindings(findings),
  };
}

/** PAY-021 — generate payroll preview. */
export async function previewHrPayrollRunInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payrollRunId: string;
  },
) {
  const run = await loadRunOrThrow(
    db,
    input.organizationId,
    input.payrollRunId,
  );

  if (run.runStatus === "validation") {
    assertHrPayrollRunStatusTransition(run.runStatus, "preview");
  } else if (run.runStatus !== "preview") {
    throw new HrPayrollCommandError("invalid_status_transition");
  }

  await db
    .update(hrPayrollRuns)
    .set({ runStatus: "preview" })
    .where(eq(hrPayrollRuns.id, input.payrollRunId));

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    cycleId: run.cycleId,
    runId: input.payrollRunId,
    actorUserId: input.actorUserId,
    action: "hr.payroll.run.previewed",
    summary: "Payroll preview generated for review.",
  });

  return { payrollRunId: input.payrollRunId };
}

/** PAY-022 — submit payroll for approval. */
export async function submitHrPayrollRunForApprovalInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payrollRunId: string;
  },
) {
  const run = await loadRunOrThrow(
    db,
    input.organizationId,
    input.payrollRunId,
  );
  assertHrPayrollRunStatusTransition(run.runStatus, "pending_approval");

  await db
    .update(hrPayrollRuns)
    .set({ runStatus: "pending_approval" })
    .where(eq(hrPayrollRuns.id, input.payrollRunId));

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    cycleId: run.cycleId,
    runId: input.payrollRunId,
    actorUserId: input.actorUserId,
    action: "hr.payroll.run.submitted_for_approval",
    summary: "Payroll submitted for approval.",
  });

  return { payrollRunId: input.payrollRunId };
}

/** PAY-022 — approve payroll run. */
export async function approveHrPayrollRunInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payrollRunId: string;
  },
) {
  const run = await loadRunOrThrow(
    db,
    input.organizationId,
    input.payrollRunId,
  );
  assertHrPayrollRunStatusTransition(run.runStatus, "approved");

  await db
    .update(hrPayrollRuns)
    .set({
      runStatus: "approved",
      approvedByUserId: input.actorUserId,
    })
    .where(eq(hrPayrollRuns.id, input.payrollRunId));

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    cycleId: run.cycleId,
    runId: input.payrollRunId,
    actorUserId: input.actorUserId,
    action: "hr.payroll.run.approved",
    summary: "Payroll run approved.",
  });

  return { payrollRunId: input.payrollRunId };
}

/** PAY-023 — lock payroll after final approval. */
export async function lockHrPayrollRunInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payrollRunId: string;
  },
) {
  const run = await loadRunOrThrow(
    db,
    input.organizationId,
    input.payrollRunId,
  );
  assertHrPayrollRunStatusTransition(run.runStatus, "locked");

  const now = new Date();
  await db
    .update(hrPayrollRuns)
    .set({ runStatus: "locked", lockedAt: now })
    .where(eq(hrPayrollRuns.id, input.payrollRunId));

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    cycleId: run.cycleId,
    runId: input.payrollRunId,
    actorUserId: input.actorUserId,
    action: "hr.payroll.run.locked",
    summary: "Payroll run locked from editing.",
  });

  return { payrollRunId: input.payrollRunId, lockedAt: now };
}

/** PAY-020/024 — finalize locked payroll. */
export async function finalizeHrPayrollRunInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payrollRunId: string;
  },
) {
  const run = await loadRunOrThrow(
    db,
    input.organizationId,
    input.payrollRunId,
  );

  if (run.runStatus === "closed") {
    throw new HrPayrollCommandError("already_finalized");
  }

  assertHrPayrollRunStatusTransition(run.runStatus, "closed");

  const validations = await db
    .select({ severity: hrPayrollValidations.severity })
    .from(hrPayrollValidations)
    .where(
      and(
        eq(hrPayrollValidations.organizationId, input.organizationId),
        eq(hrPayrollValidations.runId, input.payrollRunId),
        eq(hrPayrollValidations.isBlocking, true),
      ),
    )
    .limit(1);

  if (validations.length > 0) {
    throw new HrPayrollCommandError("blocking_validation_errors");
  }

  const now = new Date();
  await db
    .update(hrPayrollRuns)
    .set({ runStatus: "closed", finalizedAt: now, runKind: "final" })
    .where(eq(hrPayrollRuns.id, input.payrollRunId));

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    cycleId: run.cycleId,
    runId: input.payrollRunId,
    actorUserId: input.actorUserId,
    action: "hr.payroll.run.finalized",
    summary: "Payroll run finalized.",
  });

  return { payrollRunId: input.payrollRunId, finalizedAt: now };
}

export async function listHrPayrollRunsWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    cycleId?: string;
    limit?: number;
    offset?: number;
    search?: string;
  },
) {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const conditions = [eq(hrPayrollRuns.organizationId, input.organizationId)];

  if (input.cycleId) {
    conditions.push(eq(hrPayrollRuns.cycleId, input.cycleId));
  }

  const whereClause = and(...conditions);
  const rows = await db
    .select({
      id: hrPayrollRuns.id,
      cycleId: hrPayrollRuns.cycleId,
      runKind: hrPayrollRuns.runKind,
      runStatus: hrPayrollRuns.runStatus,
      runNumber: hrPayrollRuns.runNumber,
      employeeCount: hrPayrollRuns.employeeCount,
      totalNetPay: hrPayrollRuns.totalNetPay,
      totalGrossPay: hrPayrollRuns.totalGrossPay,
      currencyCode: hrPayrollRuns.currencyCode,
      finalizedAt: hrPayrollRuns.finalizedAt,
    })
    .from(hrPayrollRuns)
    .where(whereClause)
    .limit(pageSize)
    .offset(offset);

  const filtered = input.search
    ? rows.filter((row) => {
        const q = input.search!.toLowerCase();
        return (
          String(row.runNumber).includes(q) ||
          row.runStatus.toLowerCase().includes(q) ||
          row.runKind.toLowerCase().includes(q)
        );
      })
    : rows;

  return buildPaginatedWindow({
    rows: filtered,
    pageSize,
    offset,
    totalCount: filtered.length,
  });
}

export async function listHrPayrollRunValidationsWindow(
  db: AfendaTransaction,
  input: { organizationId: string; payrollRunId: string; limit?: number },
) {
  const limit = input.limit ?? 25;
  const rows = await db
    .select({
      id: hrPayrollValidations.id,
      code: hrPayrollValidations.code,
      message: hrPayrollValidations.message,
      severity: hrPayrollValidations.severity,
      employeeId: hrPayrollValidations.employeeId,
      isBlocking: hrPayrollValidations.isBlocking,
    })
    .from(hrPayrollValidations)
    .where(
      and(
        eq(hrPayrollValidations.organizationId, input.organizationId),
        eq(hrPayrollValidations.runId, input.payrollRunId),
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

