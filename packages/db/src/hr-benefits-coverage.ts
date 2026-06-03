import { and, eq, inArray } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { appendHrBenefitAuditEventInTx } from "./hr-benefits-audit";
import {
  ADJUSTABLE_COVERAGE_STATUSES_FOR_EMPLOYMENT,
  assertHrBenefitCoverageStatusTransition,
  resolveBenefitCoverageStatusForEmploymentChange,
  type HrBenefitCoverageStatus,
} from "./hr-benefits-coverage.shared";
import { HrBenefitsCommandError } from "./hr-benefits.shared";
import {
  hrBenefitDeductionReferences,
  hrBenefitEnrollments,
} from "./hr-benefits";

/** HRM-BEN-022 — transition coverage status with validation. */
export async function updateHrBenefitCoverageStatusInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    enrollmentId: string;
    toStatus: HrBenefitCoverageStatus;
    actorUserId?: string | null;
    reason?: string | null;
    coverageEndDate?: Date | null;
    auditAction?: string;
  },
): Promise<{ enrollmentId: string; previousStatus: HrBenefitCoverageStatus }> {
  const [enrollment] = await db
    .select({
      id: hrBenefitEnrollments.id,
      planId: hrBenefitEnrollments.planId,
      employeeId: hrBenefitEnrollments.employeeId,
      coverageStatus: hrBenefitEnrollments.coverageStatus,
    })
    .from(hrBenefitEnrollments)
    .where(
      and(
        eq(hrBenefitEnrollments.organizationId, input.organizationId),
        eq(hrBenefitEnrollments.id, input.enrollmentId),
      ),
    )
    .limit(1);

  if (!enrollment) {
    throw new HrBenefitsCommandError("enrollment_not_found");
  }

  const previousStatus = enrollment.coverageStatus as HrBenefitCoverageStatus;
  assertHrBenefitCoverageStatusTransition(previousStatus, input.toStatus);

  const coverageEndDate =
    input.coverageEndDate ??
    (input.toStatus === "terminated" || input.toStatus === "expired"
      ? new Date()
      : undefined);

  await db
    .update(hrBenefitEnrollments)
    .set({
      coverageStatus: input.toStatus,
      ...(coverageEndDate !== undefined ? { coverageEndDate } : {}),
    })
    .where(eq(hrBenefitEnrollments.id, enrollment.id));

  if (input.toStatus === "terminated" || input.toStatus === "expired") {
    await db
      .update(hrBenefitDeductionReferences)
      .set({ active: false, effectiveTo: coverageEndDate ?? new Date() })
      .where(
        and(
          eq(hrBenefitDeductionReferences.organizationId, input.organizationId),
          eq(hrBenefitDeductionReferences.enrollmentId, enrollment.id),
          eq(hrBenefitDeductionReferences.active, true),
        ),
      );
  }

  await appendHrBenefitAuditEventInTx(db, {
    organizationId: input.organizationId,
    enrollmentId: enrollment.id,
    planId: enrollment.planId,
    employeeId: enrollment.employeeId,
    actorUserId: input.actorUserId ?? null,
    action: input.auditAction ?? "hr.benefits.coverage.status.update",
    summary: `Coverage status changed from ${previousStatus} to ${input.toStatus}`,
    metadata: {
      previousStatus,
      toStatus: input.toStatus,
      reason: input.reason ?? null,
    },
  });

  return { enrollmentId: enrollment.id, previousStatus };
}

/** HRM-BEN-023 — callable when employee employment status changes. */
export async function adjustHrBenefitCoverageForEmploymentStatusInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    employmentStatus: string;
    effectiveDate?: Date;
    actorUserId?: string | null;
  },
): Promise<{ adjustedCount: number }> {
  const targetStatus = resolveBenefitCoverageStatusForEmploymentChange(
    input.employmentStatus,
  );
  if (!targetStatus) {
    return { adjustedCount: 0 };
  }

  const enrollments = await db
    .select({
      id: hrBenefitEnrollments.id,
      coverageStatus: hrBenefitEnrollments.coverageStatus,
    })
    .from(hrBenefitEnrollments)
    .where(
      and(
        eq(hrBenefitEnrollments.organizationId, input.organizationId),
        eq(hrBenefitEnrollments.employeeId, input.employeeId),
        inArray(
          hrBenefitEnrollments.coverageStatus,
          [...ADJUSTABLE_COVERAGE_STATUSES_FOR_EMPLOYMENT],
        ),
      ),
    );

  let adjustedCount = 0;
  const effectiveDate = input.effectiveDate ?? new Date();

  for (const enrollment of enrollments) {
    const current = enrollment.coverageStatus as HrBenefitCoverageStatus;
    if (current === targetStatus) {
      continue;
    }
    try {
      await updateHrBenefitCoverageStatusInTx(db, {
        organizationId: input.organizationId,
        enrollmentId: enrollment.id,
        toStatus: targetStatus,
        actorUserId: input.actorUserId ?? null,
        coverageEndDate:
          targetStatus === "terminated" || targetStatus === "expired"
            ? effectiveDate
            : null,
        auditAction: "hr.benefits.coverage.employment_status.adjust",
        reason: `Employment status changed to ${input.employmentStatus}`,
      });
      adjustedCount += 1;
    } catch (error) {
      if (
        error instanceof HrBenefitsCommandError &&
        error.code === "invalid_coverage_transition"
      ) {
        continue;
      }
      throw error;
    }
  }

  return { adjustedCount };
}
