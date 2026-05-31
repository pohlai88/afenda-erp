import { listShiftPayrollReferencesForPeriod } from "@afenda/db";
import { z } from "zod";

export const hrSftPayrollReferenceRowSchema = z.object({
  referenceId: z.string(),
  kind: z.enum([
    "planned_overtime",
    "shift_premium",
    "rest_day_work",
    "holiday_work",
  ]),
  employeeId: z.string(),
  employeeNumber: z.string(),
  employeeDisplayName: z.string(),
  shiftDate: z.date(),
  templateCode: z.string(),
  templateName: z.string(),
  assignmentKind: z.string(),
  shiftCategory: z.string(),
  readyForPayroll: z.boolean(),
});

export const hrSftPayrollReferencesResultSchema = z.object({
  requirementCode: z.literal("HRM-SFT-027"),
  periodStart: z.date(),
  periodEnd: z.date(),
  references: z.array(hrSftPayrollReferenceRowSchema),
});

export type HrSftPayrollReferenceRow = z.infer<
  typeof hrSftPayrollReferenceRowSchema
>;
export type HrSftPayrollReferencesResult = z.infer<
  typeof hrSftPayrollReferencesResultSchema
>;

/** HRM-SFT-027 — planned OT, shift premium, rest day, holiday work refs for Payroll. */
export async function listHrSftPayrollReferencesForPeriod(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  employeeId?: string;
  visibleEmployeeIds?: readonly string[] | null;
}): Promise<HrSftPayrollReferencesResult> {
  const references = await listShiftPayrollReferencesForPeriod(input);

  return hrSftPayrollReferencesResultSchema.parse({
    requirementCode: "HRM-SFT-027",
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    references,
  });
}
