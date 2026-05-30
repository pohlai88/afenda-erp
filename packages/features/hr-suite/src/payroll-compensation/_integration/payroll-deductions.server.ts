/**
 * Benefits Administration → Payroll Processing bridge (HRM-BEN-016).
 * Reference-only: exposes approved recurring deduction refs; does not own payroll calculation.
 */
import {
  listHrBenefitPayrollDeductionRefs,
  markHrBenefitDeductionRefsSyncedInTx,
  runWithOrganizationContext,
  type HrBenefitPayrollDeductionRefRow,
} from "@afenda/db";

export type HrBenefitPayrollDeductionRef = HrBenefitPayrollDeductionRefRow;

export async function listApprovedBenefitPayrollDeductionRefs(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  limit?: number;
}): Promise<readonly HrBenefitPayrollDeductionRef[]> {
  return listHrBenefitPayrollDeductionRefs(input);
}

export async function acknowledgeBenefitPayrollDeductionSync(input: {
  organizationId: string;
  deductionReferenceIds: readonly string[];
  syncedAt?: Date;
}): Promise<{ syncedCount: number }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    markHrBenefitDeductionRefsSyncedInTx(db, input),
  );
}
