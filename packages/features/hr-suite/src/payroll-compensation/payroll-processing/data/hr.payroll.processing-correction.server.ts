import { authorizeHrPayrollCorrection } from "@afenda/db";

/** PAY-029 — authorized payroll correction or reversal. */
export async function authorizePayrollCorrection(input: {
  organizationId: string;
  actorUserId: string;
  payrollRunId: string;
  correctionKind: "correction" | "reversal";
  reason: string;
}) {
  return authorizeHrPayrollCorrection(input);
}
