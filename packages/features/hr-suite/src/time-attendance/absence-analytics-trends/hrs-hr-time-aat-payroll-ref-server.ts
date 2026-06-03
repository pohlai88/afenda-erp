
import { listHrLamPayrollReferencesForPeriod } from "@afenda/db";

import {
  hrAatPayrollReferencesResultSchema,
  type HrAatPayrollReferenceRow,
  type HrAatPayrollReferencesResult,
} from "./hr.time.aat-risk.schema";

/** HRM-AAT-022 — unpaid absence and deduction refs via LAM payroll boundary. */
export async function listHrAatPayrollReferencesForPeriod(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  employeeId?: string;
  visibleEmployeeIds: readonly string[] | null;
}): Promise<HrAatPayrollReferencesResult> {
  const lamRows = await listHrLamPayrollReferencesForPeriod({
    organizationId: input.organizationId,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    employeeId: input.employeeId,
  });

  const visibleSet = input.visibleEmployeeIds
    ? new Set(input.visibleEmployeeIds)
    : null;

  const references: HrAatPayrollReferenceRow[] = lamRows
    .filter((row) => !visibleSet || visibleSet.has(row.employeeId))
    .map((row) => ({
      referenceId: row.referenceId,
      source: row.source,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: row.employeeDisplayName,
      kind: row.kind,
      amountLabel: row.amountLabel,
      workDate: row.workDate,
      readyForPayroll: row.readyForPayroll,
      lamBoundary: "leave_attendance_management" as const,
    }));

  const result = {
    requirementCodes: ["HRM-AAT-022"] as const,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    references,
  };

  return hrAatPayrollReferencesResultSchema.parse(result);
}
