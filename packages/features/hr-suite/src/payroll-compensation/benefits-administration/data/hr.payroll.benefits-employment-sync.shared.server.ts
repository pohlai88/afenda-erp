import {
  adjustHrBenefitCoverageForEmploymentStatusInTx,
  type AfendaTransaction,
} from "@afenda/db";

/** HRM-BEN-023 — invoke from employment / lifecycle mutations after status change. */
export async function syncHrBenefitsCoverageForEmploymentStatusInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    employmentStatus: string;
    effectiveDate?: Date;
    actorUserId?: string | null;
  },
) {
  return adjustHrBenefitCoverageForEmploymentStatusInTx(db, {
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    employmentStatus: input.employmentStatus,
    effectiveDate: input.effectiveDate,
    actorUserId: input.actorUserId,
  });
}
