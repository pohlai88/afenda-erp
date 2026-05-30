import { and, desc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { HrBenefitsCommandError } from "./hr-benefits.shared";
import type { HrBenefitPayrollDeductionRefRow } from "./hr-benefits.types";
import {
  hrBenefitDeductionReferences,
  hrBenefitEnrollmentContributions,
  hrBenefitEnrollments,
  hrBenefitPlans,
} from "./schema/hr-benefits";
import { hrEmployees } from "./schema/hr";
import { formatEmployeeLabel } from "./hr-benefits.shared";

const MAX_PAYROLL_EXPORT = 500;

export function buildBenefitDeductionCode(planCode: string): string {
  return `BEN-${planCode.trim().toUpperCase()}`;
}

export async function resolveEmployeeContributionAmountInTx(
  db: AfendaTransaction,
  input: { organizationId: string; enrollmentId: string; planId: string },
): Promise<{
  amount: string;
  frequency: (typeof hrBenefitEnrollmentContributions.$inferSelect)["frequency"];
}> {
  const [contribution] = await db
    .select({
      amount: hrBenefitEnrollmentContributions.amount,
      frequency: hrBenefitEnrollmentContributions.frequency,
    })
    .from(hrBenefitEnrollmentContributions)
    .where(
      and(
        eq(hrBenefitEnrollmentContributions.organizationId, input.organizationId),
        eq(hrBenefitEnrollmentContributions.enrollmentId, input.enrollmentId),
        eq(hrBenefitEnrollmentContributions.payer, "employee"),
      ),
    )
    .limit(1);

  if (contribution?.amount) {
    return {
      amount: contribution.amount,
      frequency: contribution.frequency,
    };
  }

  const [plan] = await db
    .select({ employeeContributionAmount: hrBenefitPlans.employeeContributionAmount })
    .from(hrBenefitPlans)
    .where(
      and(
        eq(hrBenefitPlans.organizationId, input.organizationId),
        eq(hrBenefitPlans.id, input.planId),
      ),
    )
    .limit(1);

  if (!plan?.employeeContributionAmount) {
    throw new HrBenefitsCommandError("employee_contribution_missing");
  }

  return {
    amount: plan.employeeContributionAmount,
    frequency: "per_payroll",
  };
}

/** HRM-BEN-015 / HRM-BEN-017 — recurring payroll deduction reference for employee-paid contributions. */
export async function createHrBenefitDeductionReferenceInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    enrollmentId: string;
    effectiveFrom?: Date;
  },
): Promise<{ deductionReferenceId: string; payrollDeductionReference: string }> {
  const [enrollment] = await db
    .select({
      id: hrBenefitEnrollments.id,
      planId: hrBenefitEnrollments.planId,
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

  if (enrollment.coverageStatus !== "active") {
    throw new HrBenefitsCommandError("enrollment_not_active");
  }

  const [plan] = await db
    .select({
      code: hrBenefitPlans.code,
    })
    .from(hrBenefitPlans)
    .where(
      and(
        eq(hrBenefitPlans.organizationId, input.organizationId),
        eq(hrBenefitPlans.id, enrollment.planId),
      ),
    )
    .limit(1);

  if (!plan) {
    throw new HrBenefitsCommandError("plan_not_found");
  }

  const contribution = await resolveEmployeeContributionAmountInTx(db, {
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId,
    planId: enrollment.planId,
  });

  const [existingActive] = await db
    .select({ id: hrBenefitDeductionReferences.id })
    .from(hrBenefitDeductionReferences)
    .where(
      and(
        eq(hrBenefitDeductionReferences.organizationId, input.organizationId),
        eq(hrBenefitDeductionReferences.enrollmentId, input.enrollmentId),
        eq(hrBenefitDeductionReferences.active, true),
      ),
    )
    .limit(1);

  if (existingActive) {
    const [existingRef] = await db
      .select({
        id: hrBenefitDeductionReferences.id,
        payrollDeductionReference: hrBenefitDeductionReferences.payrollDeductionReference,
      })
      .from(hrBenefitDeductionReferences)
      .where(eq(hrBenefitDeductionReferences.id, existingActive.id))
      .limit(1);

    await db
      .update(hrBenefitDeductionReferences)
      .set({
        amount: contribution.amount,
        frequency: contribution.frequency,
        effectiveFrom: input.effectiveFrom ?? new Date(),
      })
      .where(eq(hrBenefitDeductionReferences.id, existingActive.id));

    return {
      deductionReferenceId: existingRef!.id,
      payrollDeductionReference: existingRef!.payrollDeductionReference,
    };
  }

  const deductionReferenceId = createEntityId("hr_ben_ded");
  const payrollDeductionReference = createEntityId("pay_ded_ref");
  const deductionCode = buildBenefitDeductionCode(plan.code);

  await db.insert(hrBenefitDeductionReferences).values({
    id: deductionReferenceId,
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId,
    payrollDeductionReference,
    deductionCode,
    amount: contribution.amount,
    frequency: contribution.frequency,
    active: true,
    effectiveFrom: input.effectiveFrom ?? new Date(),
  });

  return { deductionReferenceId, payrollDeductionReference };
}

export async function updateHrBenefitDeductionReferenceInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    enrollmentId: string;
    amount?: string;
    frequency?: (typeof hrBenefitDeductionReferences.$inferSelect)["frequency"];
    active?: boolean;
    effectiveTo?: Date | null;
  },
): Promise<{ deductionReferenceId: string }> {
  const [deductionRef] = await db
    .select({ id: hrBenefitDeductionReferences.id })
    .from(hrBenefitDeductionReferences)
    .where(
      and(
        eq(hrBenefitDeductionReferences.organizationId, input.organizationId),
        eq(hrBenefitDeductionReferences.enrollmentId, input.enrollmentId),
        eq(hrBenefitDeductionReferences.active, true),
      ),
    )
    .limit(1);

  if (!deductionRef) {
    throw new HrBenefitsCommandError("deduction_reference_not_found");
  }

  await db
    .update(hrBenefitDeductionReferences)
    .set({
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.frequency !== undefined ? { frequency: input.frequency } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.effectiveTo !== undefined ? { effectiveTo: input.effectiveTo } : {}),
    })
    .where(eq(hrBenefitDeductionReferences.id, deductionRef.id));

  return { deductionReferenceId: deductionRef.id };
}

/** HRM-BEN-016 — reference-only export for Payroll Processing (does not calculate pay). */
export async function listHrBenefitPayrollDeductionRefs(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  limit?: number;
}): Promise<readonly HrBenefitPayrollDeductionRefRow[]> {
  const pageSize = Math.min(input.limit ?? MAX_PAYROLL_EXPORT, MAX_PAYROLL_EXPORT);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        deductionReferenceId: hrBenefitDeductionReferences.id,
        payrollDeductionReference: hrBenefitDeductionReferences.payrollDeductionReference,
        enrollmentId: hrBenefitEnrollments.id,
        employeeId: hrBenefitEnrollments.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        planCode: hrBenefitPlans.code,
        planName: hrBenefitPlans.name,
        deductionCode: hrBenefitDeductionReferences.deductionCode,
        amount: hrBenefitDeductionReferences.amount,
        frequency: hrBenefitDeductionReferences.frequency,
        effectiveFrom: hrBenefitDeductionReferences.effectiveFrom,
        approvedAt: hrBenefitEnrollments.approvedAt,
      })
      .from(hrBenefitDeductionReferences)
      .innerJoin(
        hrBenefitEnrollments,
        eq(hrBenefitDeductionReferences.enrollmentId, hrBenefitEnrollments.id),
      )
      .innerJoin(hrEmployees, eq(hrBenefitEnrollments.employeeId, hrEmployees.id))
      .innerJoin(hrBenefitPlans, eq(hrBenefitEnrollments.planId, hrBenefitPlans.id))
      .where(
        and(
          eq(hrBenefitDeductionReferences.organizationId, input.organizationId),
          eq(hrBenefitDeductionReferences.active, true),
          eq(hrBenefitEnrollments.coverageStatus, "active"),
          lte(hrBenefitDeductionReferences.effectiveFrom, input.periodEnd),
          or(
            isNull(hrBenefitDeductionReferences.effectiveTo),
            gte(hrBenefitDeductionReferences.effectiveTo, input.periodStart),
          ),
        ),
      )
      .orderBy(desc(hrBenefitEnrollments.approvedAt))
      .limit(pageSize);

    return rows.map((row) => ({
      deductionReferenceId: row.deductionReferenceId,
      payrollDeductionReference: row.payrollDeductionReference,
      enrollmentId: row.enrollmentId,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeDisplayName: formatEmployeeLabel({
        employeeNumber: row.employeeNumber,
        legalName: row.legalName,
        preferredName: row.preferredName,
      }),
      planCode: row.planCode,
      planName: row.planName,
      deductionCode: row.deductionCode,
      amount: row.amount,
      frequency: row.frequency,
      effectiveFrom: row.effectiveFrom,
      approvedAt: row.approvedAt,
    }));
  });
}

export async function markHrBenefitDeductionRefsSyncedInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    deductionReferenceIds: readonly string[];
    syncedAt?: Date;
  },
): Promise<{ syncedCount: number }> {
  if (input.deductionReferenceIds.length === 0) {
    return { syncedCount: 0 };
  }

  const syncedAt = input.syncedAt ?? new Date();
  await db
    .update(hrBenefitDeductionReferences)
    .set({ syncedAt })
    .where(
      and(
        eq(hrBenefitDeductionReferences.organizationId, input.organizationId),
        inArray(hrBenefitDeductionReferences.id, [...input.deductionReferenceIds]),
      ),
    );

  return { syncedCount: input.deductionReferenceIds.length };
}
