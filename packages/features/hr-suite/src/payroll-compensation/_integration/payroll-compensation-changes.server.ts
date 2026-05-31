/**
 * Compensation Planning & Modeling → Payroll Processing bridge (HRM-CPM-027).
 *
 * Reference-only: exposes pending approved salary-change payroll refs for a pay period.
 * Payroll Processing consumes refs, applies base-pay updates in its own calculation engine,
 * then acknowledges sync via `acknowledgeCompensationPayrollSync`.
 *
 * Idempotency:
 * - Finalize (`finalizeHrCompensationApprovalInTx`) returns existing salary/payroll/history ids when re-run.
 * - `hr_compensation_payroll_refs` is unique per `(organization_id, salary_change_id)`.
 * - Acknowledge updates only the requested ref ids; safe to retry with the same ids.
 */
import {
  listHrCompensationPayrollRefs,
  markHrCompensationPayrollRefsSyncedInTx,
  runWithOrganizationContext,
  type HrCompensationPayrollRefRow,
} from "@afenda/db";

/** Pending payroll handoff row for an approved compensation salary change. */
export type HrCpmPayrollRef = HrCompensationPayrollRefRow;

/**
 * Lists pending compensation payroll refs effective within `[periodStart, periodEnd]`.
 * Payroll Processing should filter further by employee/run as needed.
 */
export async function listApprovedCompensationPayrollRefs(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  limit?: number;
}): Promise<readonly HrCpmPayrollRef[]> {
  return listHrCompensationPayrollRefs(input);
}

/**
 * Marks compensation payroll refs as synced after Payroll Processing applied the change.
 * Emits `hr.cpm.payroll.synced` audit events when `actorUserId` is provided.
 */
export async function acknowledgeCompensationPayrollSync(input: {
  organizationId: string;
  payrollReferenceIds: readonly string[];
  syncedAt?: Date;
  actorUserId?: string | null;
}): Promise<{ syncedCount: number }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    markHrCompensationPayrollRefsSyncedInTx(db, input),
  );
}
