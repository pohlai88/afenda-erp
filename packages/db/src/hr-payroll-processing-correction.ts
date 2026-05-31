import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrPayrollAuditEventInTx } from "./hr-payroll-processing-audit";
import { HrPayrollCommandError } from "./hr-payroll-processing.shared";
import { getHrPayrollRunSummaryInTx } from "./hr-payroll-processing-workflow";
import {
  hrPayrollCorrections,
  hrPayrollRuns,
} from "./schema/hr-payroll-processing";

/** PAY-029 — authorized payroll correction or reversal. */
export async function authorizeHrPayrollCorrectionInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    payrollRunId: string;
    correctionKind: "correction" | "reversal";
    reason: string;
  },
) {
  const run = await getHrPayrollRunSummaryInTx(db, {
    organizationId: input.organizationId,
    payrollRunId: input.payrollRunId,
  });

  if (!run) {
    throw new HrPayrollCommandError("run_not_found");
  }

  if (run.runStatus === "cancelled") {
    throw new HrPayrollCommandError("already_closed");
  }

  const now = new Date();
  const correctionId = createEntityId("pay_corr");
  let correctionRunId: string | null = null;

  if (input.correctionKind === "reversal") {
    correctionRunId = createEntityId("pay_run");
    await db.insert(hrPayrollRuns).values({
      id: correctionRunId,
      organizationId: input.organizationId,
      cycleId: run.cycleId,
      runKind: "final",
      runStatus: "cancelled",
      runNumber: run.runNumber + 1000,
      createdByUserId: input.actorUserId,
    });

    await db
      .update(hrPayrollRuns)
      .set({ runStatus: "cancelled" })
      .where(eq(hrPayrollRuns.id, input.payrollRunId));
  }

  await db.insert(hrPayrollCorrections).values({
    id: correctionId,
    organizationId: input.organizationId,
    sourceRunId: input.payrollRunId,
    correctionRunId,
    cycleId: run.cycleId,
    correctionKind: input.correctionKind,
    correctionStatus: "authorized",
    reason: input.reason,
    requestedByUserId: input.actorUserId,
    authorizedByUserId: input.actorUserId,
    authorizedAt: now,
  });

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    cycleId: run.cycleId,
    runId: input.payrollRunId,
    actorUserId: input.actorUserId,
    action:
      input.correctionKind === "reversal"
        ? "hr.payroll.run.reversed"
        : "hr.payroll.run.corrected",
    summary: `Payroll ${input.correctionKind} authorized: ${input.reason}`,
    metadata: { correctionId, correctionRunId },
  });

  return {
    correctionId,
    correctionKind: input.correctionKind,
    correctionRunId,
    authorizedAt: now,
  };
}

export async function listHrPayrollCorrectionsWindow(
  db: AfendaTransaction,
  input: { organizationId: string; payrollRunId?: string; limit?: number },
) {
  const limit = input.limit ?? 25;
  const conditions = [eq(hrPayrollCorrections.organizationId, input.organizationId)];
  if (input.payrollRunId) {
    conditions.push(eq(hrPayrollCorrections.sourceRunId, input.payrollRunId));
  }

  const rows = await db
    .select({
      id: hrPayrollCorrections.id,
      sourceRunId: hrPayrollCorrections.sourceRunId,
      correctionKind: hrPayrollCorrections.correctionKind,
      correctionStatus: hrPayrollCorrections.correctionStatus,
      reason: hrPayrollCorrections.reason,
      authorizedByUserId: hrPayrollCorrections.authorizedByUserId,
      authorizedAt: hrPayrollCorrections.authorizedAt,
      correctionRunId: hrPayrollCorrections.correctionRunId,
    })
    .from(hrPayrollCorrections)
    .where(and(...conditions))
    .limit(limit);

  return {
    rows,
    pageSize: limit,
    totalCount: rows.length,
    hasNextPage: false,
  };
}
