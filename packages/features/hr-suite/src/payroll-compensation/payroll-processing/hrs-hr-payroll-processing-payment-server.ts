import {
  createHrPayrollPaymentBatch,
  listHrPayrollPaymentBatches,
  updateHrPayrollPaymentStatus,
} from "@afenda/db";

/** PAY-026 — create payment batch and bank CSV file. */
export async function createPayrollPaymentBatch(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId: string;
}) {
  return createHrPayrollPaymentBatch(input);
}

/** PAY-027 — track and update payroll payment status. */
export async function updatePayrollPaymentStatus(input: {
  organizationId: string;
  actorUserId: string;
  paymentBatchId: string;
  paymentStatus: "pending" | "processing" | "paid" | "failed" | "reversed";
  employeeId?: string;
}) {
  return updateHrPayrollPaymentStatus(input);
}

export async function listPayrollPaymentBatches(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId?: string;
  limit?: number;
}) {
  return listHrPayrollPaymentBatches(input);
}

/** PAY-026 — format bank payment file as downloadable CSV. */
export function formatPayrollBankPaymentCsv(content: string): string {
  return content.trim().endsWith("\n") ? content : `${content}\n`;
}
