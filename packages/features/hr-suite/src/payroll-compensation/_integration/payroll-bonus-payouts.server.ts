/**
 * Bonus & Incentive Management → Payroll Processing bridge (HRM-BON-026).
 * Reference-only: exposes locked approved payout refs; does not own payroll calculation.
 */
import {
  listHrBonusPayrollPayoutRefs,
  markHrBonusPayrollPayoutRefsSyncedInTx,
  runWithOrganizationContext,
  type HrBonusPayrollPayoutRefRow,
} from "@afenda/db";

export type HrBonusPayrollPayoutRef = HrBonusPayrollPayoutRefRow;

export async function listApprovedBonusPayrollPayoutRefs(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  limit?: number;
}): Promise<readonly HrBonusPayrollPayoutRef[]> {
  return listHrBonusPayrollPayoutRefs(input);
}

export async function acknowledgeBonusPayrollPayoutSync(input: {
  organizationId: string;
  payoutReferenceIds: readonly string[];
  syncedAt?: Date;
  actorUserId?: string | null;
}): Promise<{ syncedCount: number }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    markHrBonusPayrollPayoutRefsSyncedInTx(db, input),
  );
}
