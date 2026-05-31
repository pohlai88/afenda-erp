import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrPayrollAuditEventInTx } from "./hr-payroll-processing-audit";
import { formatPayrollNumeric, parsePayrollNumeric } from "./hr-payroll-processing.shared";
import {
  hrPayrollPaymentBatches,
  hrPayrollPayments,
  hrPayrollRunLines,
  hrPayrollRuns,
} from "./schema/hr-payroll-processing";

function buildBankPaymentCsv(
  lines: Array<{
    employeeId: string;
    amount: string;
    bankAccountRef: string | null;
    currencyCode: string;
  }>,
): string {
  const header = "employee_id,bank_account_ref,amount,currency";
  const body = lines
    .map(
      (line) =>
        `${line.employeeId},${line.bankAccountRef ?? ""},${line.amount},${line.currencyCode}`,
    )
    .join("\n");
  return `${header}\n${body}`;
}

/** PAY-026 — generate payment batch and bank CSV file. */
export async function createHrPayrollPaymentBatchInTx(
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
    throw new Error("Payment batch requires a closed payroll run.");
  }

  const lines = await db
    .select({
      employeeId: hrPayrollRunLines.employeeId,
      netPay: hrPayrollRunLines.netPay,
      currencyCode: hrPayrollRunLines.currencyCode,
    })
    .from(hrPayrollRunLines)
    .where(
      and(
        eq(hrPayrollRunLines.organizationId, input.organizationId),
        eq(hrPayrollRunLines.runId, input.payrollRunId),
      ),
    );

  const batchId = createEntityId("pay_batch");
  const batchNumber = `BATCH-${run.runNumber}`;
  const now = new Date();
  let totalAmount = 0;

  const paymentRows = lines.map((line) => {
    const amount = parsePayrollNumeric(line.netPay);
    totalAmount += amount;
    return {
      id: createEntityId("pay_pay"),
      organizationId: input.organizationId,
      batchId,
      runId: input.payrollRunId,
      cycleId: run.cycleId,
      employeeId: line.employeeId,
      amount: formatPayrollNumeric(amount),
      currencyCode: line.currencyCode,
      paymentStatus: "pending" as const,
      bankAccountRef: null,
    };
  });

  const bankFileContent = buildBankPaymentCsv(
    paymentRows.map((line) => ({
      employeeId: line.employeeId,
      amount: line.amount,
      bankAccountRef: line.bankAccountRef,
      currencyCode: line.currencyCode,
    })),
  );

  await db.insert(hrPayrollPaymentBatches).values({
    id: batchId,
    organizationId: input.organizationId,
    runId: input.payrollRunId,
    cycleId: run.cycleId,
    batchNumber,
    batchStatus: "generated",
    paymentCount: paymentRows.length,
    totalAmount: formatPayrollNumeric(totalAmount),
    currencyCode: paymentRows[0]?.currencyCode ?? "USD",
    bankFileReference: bankFileContent.slice(0, 500),
    generatedAt: now,
    createdByUserId: input.actorUserId,
  });

  if (paymentRows.length > 0) {
    await db.insert(hrPayrollPayments).values(paymentRows);
  }

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    cycleId: run.cycleId,
    runId: input.payrollRunId,
    actorUserId: input.actorUserId,
    action: "hr.payroll.payment.batch_created",
    summary: `Payment batch ${batchNumber} generated.`,
    metadata: { batchId, lineCount: paymentRows.length, totalAmount },
  });

  return {
    batchId,
    batchNumber,
    bankFileContent,
    lineCount: paymentRows.length,
    totalAmount,
  };
}

/** PAY-027 — update payment status for batch or individual payment. */
export async function updateHrPayrollPaymentStatusInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorUserId: string;
    paymentBatchId: string;
    paymentStatus: "pending" | "processing" | "paid" | "failed" | "reversed";
    employeeId?: string;
  },
) {
  const now = new Date();

  if (input.employeeId) {
    await db
      .update(hrPayrollPayments)
      .set({
        paymentStatus: input.paymentStatus,
        paidAt: input.paymentStatus === "paid" ? now : null,
        failedAt: input.paymentStatus === "failed" ? now : null,
      })
      .where(
        and(
          eq(hrPayrollPayments.organizationId, input.organizationId),
          eq(hrPayrollPayments.batchId, input.paymentBatchId),
          eq(hrPayrollPayments.employeeId, input.employeeId),
        ),
      );
  } else {
    const batchStatus =
      input.paymentStatus === "paid"
        ? "completed"
        : input.paymentStatus === "failed"
          ? "failed"
          : input.paymentStatus === "processing"
            ? "processing"
            : "generated";

    await db
      .update(hrPayrollPaymentBatches)
      .set({
        batchStatus,
        completedAt: input.paymentStatus === "paid" ? now : null,
      })
      .where(
        and(
          eq(hrPayrollPaymentBatches.organizationId, input.organizationId),
          eq(hrPayrollPaymentBatches.id, input.paymentBatchId),
        ),
      );

    await db
      .update(hrPayrollPayments)
      .set({
        paymentStatus: input.paymentStatus,
        paidAt: input.paymentStatus === "paid" ? now : null,
        failedAt: input.paymentStatus === "failed" ? now : null,
      })
      .where(
        and(
          eq(hrPayrollPayments.organizationId, input.organizationId),
          eq(hrPayrollPayments.batchId, input.paymentBatchId),
        ),
      );
  }

  await appendHrPayrollAuditEventInTx(db, {
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    action: "hr.payroll.payment.status_updated",
    summary: `Payment status updated to ${input.paymentStatus}.`,
    metadata: {
      paymentBatchId: input.paymentBatchId,
      employeeId: input.employeeId ?? null,
    },
  });

  return { paymentBatchId: input.paymentBatchId, paymentStatus: input.paymentStatus };
}

export async function listHrPayrollPaymentBatchesWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    payrollRunId?: string;
    limit?: number;
  },
) {
  const limit = input.limit ?? 25;
  const conditions = [
    eq(hrPayrollPaymentBatches.organizationId, input.organizationId),
  ];
  if (input.payrollRunId) {
    conditions.push(eq(hrPayrollPaymentBatches.runId, input.payrollRunId));
  }

  const rows = await db
    .select({
      id: hrPayrollPaymentBatches.id,
      batchNumber: hrPayrollPaymentBatches.batchNumber,
      runId: hrPayrollPaymentBatches.runId,
      batchStatus: hrPayrollPaymentBatches.batchStatus,
      totalAmount: hrPayrollPaymentBatches.totalAmount,
      paymentCount: hrPayrollPaymentBatches.paymentCount,
      generatedAt: hrPayrollPaymentBatches.generatedAt,
      completedAt: hrPayrollPaymentBatches.completedAt,
    })
    .from(hrPayrollPaymentBatches)
    .where(and(...conditions))
    .limit(limit);

  return {
    rows,
    pageSize: limit,
    totalCount: rows.length,
    hasNextPage: false,
  };
}

export async function listHrPayrollPaymentsWindow(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    batchId?: string;
    payrollRunId?: string;
    limit?: number;
  },
) {
  const limit = input.limit ?? 25;
  const conditions = [eq(hrPayrollPayments.organizationId, input.organizationId)];

  if (input.batchId) {
    conditions.push(eq(hrPayrollPayments.batchId, input.batchId));
  }
  if (input.payrollRunId) {
    conditions.push(eq(hrPayrollPayments.runId, input.payrollRunId));
  }

  const rows = await db
    .select({
      id: hrPayrollPayments.id,
      batchId: hrPayrollPayments.batchId,
      runId: hrPayrollPayments.runId,
      employeeId: hrPayrollPayments.employeeId,
      paymentStatus: hrPayrollPayments.paymentStatus,
      amount: hrPayrollPayments.amount,
      paidAt: hrPayrollPayments.paidAt,
    })
    .from(hrPayrollPayments)
    .where(and(...conditions))
    .limit(limit);

  return {
    rows,
    pageSize: limit,
    totalCount: rows.length,
    hasNextPage: false,
  };
}
