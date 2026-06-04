import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrPayrollAuditEventInTx } from "./hr-payroll-processing-audit";
import { formatPayrollNumeric, parsePayrollNumeric } from "./hr-payroll-processing.shared";
import {
  hrPayrollJournalRefs,
  hrPayrollRunLines,
  hrPayrollRuns,
} from "./dbx-hr-payroll-processing";

/** PAY-028 — generate payroll journal / finance posting reference. */
export async function generateHrPayrollJournalRefInTx(
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
      totalEmployerCost: hrPayrollRuns.totalEmployerCost,
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
    throw new Error("Journal reference requires a closed payroll run.");
  }

  const lines = await db
    .select({
      netPay: hrPayrollRunLines.netPay,
      totalEmployerCost: hrPayrollRunLines.totalEmployerCost,
      totalStatutoryEmployer: hrPayrollRunLines.totalStatutoryEmployer,
    })
    .from(hrPayrollRunLines)
    .where(
      and(
        eq(hrPayrollRunLines.organizationId, input.organizationId),
        eq(hrPayrollRunLines.runId, input.payrollRunId),
      ),
    );

  const totalNetPay = lines.reduce(
    (sum, line) => sum + parsePayrollNumeric(line.netPay),
    0,
  );
  const totalEmployerCost =
    parsePayrollNumeric(run.totalEmployerCost) ||
    lines.reduce(
      (sum, line) => sum + parsePayrollNumeric(line.totalEmployerCost),
      0,
    );

  const journalReference = `JE-RUN-${run.runNumber}`;
  const now = new Date();
  const journalId = createEntityId("pay_je");

  await db.insert(hrPayrollJournalRefs).values({
    id: journalId,
    organizationId: input.organizationId,
    runId: input.payrollRunId,
    cycleId: run.cycleId,
    journalReference,
    costCenterCode: "CC-DEFAULT",
    totalDebit: formatPayrollNumeric(totalEmployerCost),
    totalCredit: formatPayrollNumeric(totalEmployerCost),
    postedAt: now,
    metadata: {
      totalNetPay,
      lineCount: lines.length,
    },
  });

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    cycleId: run.cycleId,
    runId: input.payrollRunId,
    actorUserId: input.actorUserId,
    action: "hr.payroll.journal.generated",
    summary: `Journal reference ${journalReference} generated.`,
    metadata: { journalId, journalReference },
  });

  return {
    journalId,
    journalReference,
    totalDebit: totalEmployerCost,
    totalCredit: totalEmployerCost,
    postedAt: now,
  };
}

export async function getHrPayrollJournalRefInTx(
  db: AfendaTransaction,
  input: { organizationId: string; payrollRunId: string },
) {
  const [row] = await db
    .select()
    .from(hrPayrollJournalRefs)
    .where(
      and(
        eq(hrPayrollJournalRefs.organizationId, input.organizationId),
        eq(hrPayrollJournalRefs.runId, input.payrollRunId),
      ),
    )
    .limit(1);

  return row ?? null;
}

