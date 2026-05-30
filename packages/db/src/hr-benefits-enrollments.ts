import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  buildPaginatedWindow,
  clampPageSize,
  formatEmployeeLabel,
  HrBenefitsCommandError,
} from "./hr-benefits.shared";
import type { HrBenefitEnrollmentWindow } from "./hr-benefits.types";
import { appendHrBenefitAuditEventInTx } from "./hr-benefits-audit";
import {
  createHrBenefitDeductionReferenceInTx,
  updateHrBenefitDeductionReferenceInTx,
} from "./hr-benefits-deductions";
import {
  hrBenefitEnrollmentChanges,
  hrBenefitEnrollmentContributions,
  hrBenefitEnrollmentDependents,
  hrBenefitEnrollments,
  hrBenefitPlans,
} from "./schema/hr-benefits";
import { hrEmployees } from "./schema/hr";

export async function listHrBenefitEnrollmentsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  coverageStatus?: (typeof hrBenefitEnrollments.$inferSelect)["coverageStatus"];
}): Promise<HrBenefitEnrollmentWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrBenefitEnrollments.organizationId, input.organizationId),
    ];

    if (input.coverageStatus) {
      conditions.push(eq(hrBenefitEnrollments.coverageStatus, input.coverageStatus));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrBenefitPlans.name, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrBenefitEnrollments)
      .innerJoin(hrEmployees, eq(hrBenefitEnrollments.employeeId, hrEmployees.id))
      .innerJoin(hrBenefitPlans, eq(hrBenefitEnrollments.planId, hrBenefitPlans.id))
      .where(whereClause);

    const unverifiedDependentCount = sql<number>`(
      select count(*)::int
      from ${hrBenefitEnrollmentDependents}
      where ${hrBenefitEnrollmentDependents.enrollmentId} = ${hrBenefitEnrollments.id}
        and ${hrBenefitEnrollmentDependents.organizationId} = ${input.organizationId}
        and ${hrBenefitEnrollmentDependents.eligibilityVerifiedAt} is null
    )`;

    const employeeContributionAmount = sql<string | null>`(
      select ${hrBenefitEnrollmentContributions.amount}
      from ${hrBenefitEnrollmentContributions}
      where ${hrBenefitEnrollmentContributions.enrollmentId} = ${hrBenefitEnrollments.id}
        and ${hrBenefitEnrollmentContributions.organizationId} = ${input.organizationId}
        and ${hrBenefitEnrollmentContributions.payer} = 'employee'
      order by ${hrBenefitEnrollmentContributions.effectiveFrom} desc
      limit 1
    )`;

    const employerContributionAmount = sql<string | null>`(
      select ${hrBenefitEnrollmentContributions.amount}
      from ${hrBenefitEnrollmentContributions}
      where ${hrBenefitEnrollmentContributions.enrollmentId} = ${hrBenefitEnrollments.id}
        and ${hrBenefitEnrollmentContributions.organizationId} = ${input.organizationId}
        and ${hrBenefitEnrollmentContributions.payer} = 'employer'
      order by ${hrBenefitEnrollmentContributions.effectiveFrom} desc
      limit 1
    )`;

    const rows = await db
      .select({
        id: hrBenefitEnrollments.id,
        employeeId: hrBenefitEnrollments.employeeId,
        planId: hrBenefitEnrollments.planId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        planName: hrBenefitPlans.name,
        allowsDependents: hrBenefitPlans.allowsDependents,
        coverageLevel: hrBenefitEnrollments.coverageLevel,
        coverageStatus: hrBenefitEnrollments.coverageStatus,
        enrollmentChannel: hrBenefitEnrollments.enrollmentChannel,
        coverageStartDate: hrBenefitEnrollments.coverageStartDate,
        coverageEndDate: hrBenefitEnrollments.coverageEndDate,
        unverifiedDependentCount,
        employeeContributionAmount,
        employerContributionAmount,
      })
      .from(hrBenefitEnrollments)
      .innerJoin(hrEmployees, eq(hrBenefitEnrollments.employeeId, hrEmployees.id))
      .innerJoin(hrBenefitPlans, eq(hrBenefitEnrollments.planId, hrBenefitPlans.id))
      .where(whereClause)
      .orderBy(desc(hrBenefitEnrollments.updatedAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        planId: row.planId,
        employeeLabel: formatEmployeeLabel({
          employeeNumber: row.employeeNumber,
          legalName: row.legalName,
          preferredName: row.preferredName,
        }),
        planName: row.planName,
        allowsDependents: row.allowsDependents,
        coverageLevel: row.coverageLevel,
        coverageStatus: row.coverageStatus,
        enrollmentChannel: row.enrollmentChannel,
        coverageStartDate: row.coverageStartDate,
        coverageEndDate: row.coverageEndDate,
        unverifiedDependentCount: Number(row.unverifiedDependentCount ?? 0),
        employeeContributionAmount: row.employeeContributionAmount,
        employerContributionAmount: row.employerContributionAmount,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

async function recordEnrollmentChangeInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    enrollmentId: string;
    changeKind: (typeof hrBenefitEnrollmentChanges.$inferSelect)["changeKind"];
    previousSnapshot: Record<string, unknown> | null;
    newSnapshot: Record<string, unknown>;
    changedByUserId?: string | null;
    notes?: string | null;
    effectiveFrom?: Date;
  },
): Promise<{ changeId: string }> {
  const changeId = createEntityId("hr_ben_chg");
  await db.insert(hrBenefitEnrollmentChanges).values({
    id: changeId,
    organizationId: input.organizationId,
    enrollmentId: input.enrollmentId,
    changeKind: input.changeKind,
    previousSnapshot: input.previousSnapshot
      ? JSON.stringify(input.previousSnapshot)
      : null,
    newSnapshot: JSON.stringify(input.newSnapshot),
    changedByUserId: input.changedByUserId ?? null,
    notes: input.notes?.trim() || null,
    effectiveFrom: input.effectiveFrom ?? new Date(),
  });
  return { changeId };
}

/** HRM-BEN-019 — pending → active approval path; creates payroll deduction reference when applicable. */
export async function approveHrBenefitEnrollmentInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    enrollmentId: string;
    approvedByUserId: string;
    approvalReference?: string | null;
  },
): Promise<{
  enrollmentId: string;
  deductionReferenceId?: string;
  payrollDeductionReference?: string;
}> {
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

  if (enrollment.coverageStatus !== "pending") {
    throw new HrBenefitsCommandError("enrollment_not_pending");
  }

  const approvedAt = new Date();
  await db
    .update(hrBenefitEnrollments)
    .set({
      coverageStatus: "active",
      approvedAt,
      approvedByUserId: input.approvedByUserId,
      approvalReference: input.approvalReference?.trim() || null,
    })
    .where(eq(hrBenefitEnrollments.id, enrollment.id));

  let deductionReferenceId: string | undefined;
  let payrollDeductionReference: string | undefined;

  try {
    const deduction = await createHrBenefitDeductionReferenceInTx(db, {
      organizationId: input.organizationId,
      enrollmentId: enrollment.id,
      effectiveFrom: approvedAt,
    });
    deductionReferenceId = deduction.deductionReferenceId;
    payrollDeductionReference = deduction.payrollDeductionReference;
  } catch (error) {
    if (
      !(error instanceof HrBenefitsCommandError) ||
      error.code !== "employee_contribution_missing"
    ) {
      throw error;
    }
  }

  return {
    enrollmentId: enrollment.id,
    deductionReferenceId,
    payrollDeductionReference,
  };
}

/** HRM-BEN-018 — plan, coverage, dependent, and contribution changes. */
export async function applyHrBenefitEnrollmentChangeInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    enrollmentId: string;
    changeKind: (typeof hrBenefitEnrollmentChanges.$inferSelect)["changeKind"];
    changedByUserId?: string | null;
    notes?: string | null;
    effectiveFrom?: Date;
    planId?: string;
    coverageLevel?: (typeof hrBenefitEnrollments.$inferSelect)["coverageLevel"];
    dependent?: {
      dependentId?: string;
      dependentName: string;
      relationship: (typeof hrBenefitEnrollmentDependents.$inferSelect)["relationship"];
      dateOfBirth?: Date | null;
      dependentReferenceId?: string | null;
      coverageStartDate: Date;
      coverageEndDate?: Date | null;
      remove?: boolean;
    };
    contribution?: {
      amount: string;
      frequency?: (typeof hrBenefitEnrollmentContributions.$inferSelect)["frequency"];
      payer?: (typeof hrBenefitEnrollmentContributions.$inferSelect)["payer"];
    };
  },
): Promise<{ enrollmentId: string; changeId: string }> {
  const [enrollment] = await db
    .select({
      id: hrBenefitEnrollments.id,
      planId: hrBenefitEnrollments.planId,
      employeeId: hrBenefitEnrollments.employeeId,
      coverageLevel: hrBenefitEnrollments.coverageLevel,
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

  if (enrollment.coverageStatus !== "active" && enrollment.coverageStatus !== "pending") {
    throw new HrBenefitsCommandError("enrollment_not_active");
  }

  let previousSnapshot: Record<string, unknown> | null = null;
  let newSnapshot: Record<string, unknown> = {};

  switch (input.changeKind) {
    case "plan_change": {
      if (!input.planId) {
        throw new HrBenefitsCommandError("invalid_change_kind");
      }
      const [plan] = await db
        .select({ id: hrBenefitPlans.id, code: hrBenefitPlans.code, name: hrBenefitPlans.name })
        .from(hrBenefitPlans)
        .where(
          and(
            eq(hrBenefitPlans.organizationId, input.organizationId),
            eq(hrBenefitPlans.id, input.planId),
          ),
        )
        .limit(1);
      if (!plan) {
        throw new HrBenefitsCommandError("plan_not_found");
      }
      previousSnapshot = { planId: enrollment.planId };
      newSnapshot = { planId: plan.id, planCode: plan.code, planName: plan.name };
      await db
        .update(hrBenefitEnrollments)
        .set({ planId: plan.id })
        .where(eq(hrBenefitEnrollments.id, enrollment.id));
      break;
    }
    case "coverage_change": {
      if (!input.coverageLevel) {
        throw new HrBenefitsCommandError("invalid_change_kind");
      }
      previousSnapshot = { coverageLevel: enrollment.coverageLevel };
      newSnapshot = { coverageLevel: input.coverageLevel };
      await db
        .update(hrBenefitEnrollments)
        .set({ coverageLevel: input.coverageLevel })
        .where(eq(hrBenefitEnrollments.id, enrollment.id));
      break;
    }
    case "dependent_change": {
      if (!input.dependent) {
        throw new HrBenefitsCommandError("invalid_change_kind");
      }
      if (input.dependent.remove && input.dependent.dependentId) {
        previousSnapshot = { dependentId: input.dependent.dependentId };
        newSnapshot = { removed: true };
        await db
          .delete(hrBenefitEnrollmentDependents)
          .where(
            and(
              eq(hrBenefitEnrollmentDependents.organizationId, input.organizationId),
              eq(hrBenefitEnrollmentDependents.id, input.dependent.dependentId),
              eq(hrBenefitEnrollmentDependents.enrollmentId, enrollment.id),
            ),
          );
      } else if (input.dependent.dependentId) {
        const [existing] = await db
          .select({
            dependentName: hrBenefitEnrollmentDependents.dependentName,
            relationship: hrBenefitEnrollmentDependents.relationship,
          })
          .from(hrBenefitEnrollmentDependents)
          .where(
            and(
              eq(hrBenefitEnrollmentDependents.organizationId, input.organizationId),
              eq(hrBenefitEnrollmentDependents.id, input.dependent.dependentId),
            ),
          )
          .limit(1);
        previousSnapshot = existing
          ? {
              dependentName: existing.dependentName,
              relationship: existing.relationship,
            }
          : null;
        newSnapshot = {
          dependentName: input.dependent.dependentName,
          relationship: input.dependent.relationship,
        };
        await db
          .update(hrBenefitEnrollmentDependents)
          .set({
            dependentName: input.dependent.dependentName.trim(),
            relationship: input.dependent.relationship,
            dateOfBirth: input.dependent.dateOfBirth ?? null,
            dependentReferenceId: input.dependent.dependentReferenceId?.trim() || null,
            coverageStartDate: input.dependent.coverageStartDate,
            coverageEndDate: input.dependent.coverageEndDate ?? null,
          })
          .where(
            eq(hrBenefitEnrollmentDependents.id, input.dependent.dependentId),
          );
      } else {
        const dependentId = createEntityId("hr_ben_dep");
        newSnapshot = {
          dependentId,
          dependentName: input.dependent.dependentName,
          relationship: input.dependent.relationship,
        };
        await db.insert(hrBenefitEnrollmentDependents).values({
          id: dependentId,
          organizationId: input.organizationId,
          enrollmentId: enrollment.id,
          dependentName: input.dependent.dependentName.trim(),
          relationship: input.dependent.relationship,
          dateOfBirth: input.dependent.dateOfBirth ?? null,
          dependentReferenceId: input.dependent.dependentReferenceId?.trim() || null,
          coverageStartDate: input.dependent.coverageStartDate,
          coverageEndDate: input.dependent.coverageEndDate ?? null,
        });
      }
      break;
    }
    case "contribution_change": {
      if (!input.contribution?.amount) {
        throw new HrBenefitsCommandError("invalid_change_kind");
      }
      const payer = input.contribution.payer ?? "employee";
      const [existingContribution] = await db
        .select({
          id: hrBenefitEnrollmentContributions.id,
          amount: hrBenefitEnrollmentContributions.amount,
          frequency: hrBenefitEnrollmentContributions.frequency,
          payer: hrBenefitEnrollmentContributions.payer,
        })
        .from(hrBenefitEnrollmentContributions)
        .where(
          and(
            eq(hrBenefitEnrollmentContributions.organizationId, input.organizationId),
            eq(hrBenefitEnrollmentContributions.enrollmentId, enrollment.id),
            eq(hrBenefitEnrollmentContributions.payer, payer),
          ),
        )
        .limit(1);

      previousSnapshot = existingContribution
        ? {
            amount: existingContribution.amount,
            frequency: existingContribution.frequency,
            payer: existingContribution.payer,
          }
        : null;
      newSnapshot = {
        amount: input.contribution.amount,
        frequency: input.contribution.frequency ?? "per_payroll",
        payer,
      };

      if (existingContribution) {
        await db
          .update(hrBenefitEnrollmentContributions)
          .set({
            amount: input.contribution.amount,
            frequency: input.contribution.frequency ?? existingContribution.frequency,
          })
          .where(eq(hrBenefitEnrollmentContributions.id, existingContribution.id));
      } else {
        await db.insert(hrBenefitEnrollmentContributions).values({
          id: createEntityId("hr_ben_contrib"),
          organizationId: input.organizationId,
          enrollmentId: enrollment.id,
          payer,
          amount: input.contribution.amount,
          frequency: input.contribution.frequency ?? "per_payroll",
        });
      }

      if (payer === "employee" && enrollment.coverageStatus === "active") {
        await updateHrBenefitDeductionReferenceInTx(db, {
          organizationId: input.organizationId,
          enrollmentId: enrollment.id,
          amount: input.contribution.amount,
          frequency: input.contribution.frequency,
        }).catch((error) => {
          if (
            error instanceof HrBenefitsCommandError &&
            error.code === "deduction_reference_not_found"
          ) {
            return createHrBenefitDeductionReferenceInTx(db, {
              organizationId: input.organizationId,
              enrollmentId: enrollment.id,
              effectiveFrom: input.effectiveFrom ?? new Date(),
            });
          }
          throw error;
        });
      }
      break;
    }
    default:
      throw new HrBenefitsCommandError("invalid_change_kind");
  }

  const { changeId } = await recordEnrollmentChangeInTx(db, {
    organizationId: input.organizationId,
    enrollmentId: enrollment.id,
    changeKind: input.changeKind,
    previousSnapshot,
    newSnapshot,
    changedByUserId: input.changedByUserId,
    notes: input.notes,
    effectiveFrom: input.effectiveFrom,
  });

  await appendHrBenefitAuditEventInTx(db, {
    organizationId: input.organizationId,
    enrollmentId: enrollment.id,
    planId: enrollment.planId,
    employeeId: enrollment.employeeId,
    actorUserId: input.changedByUserId ?? null,
    action: "hr.benefits.enrollment.change",
    summary: `Benefit enrollment ${input.changeKind.replace(/_/g, " ")} recorded`,
    metadata: { changeId, changeKind: input.changeKind },
  });

  return { enrollmentId: enrollment.id, changeId };
}
