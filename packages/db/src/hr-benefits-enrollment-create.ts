import { and, eq } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import {
  computeEmployeeTenureMonths,
  isEmployeeEligibleForBenefitPlan,
  type HrEmployeeBenefitScope,
} from "./hr-benefit-scope.shared";
import { appendHrBenefitAuditEventInTx } from "./hr-benefits-audit";
import {
  assertBenefitCoverageDatesValid,
  assertCoverageLevelAllowedForPlan,
  isDependentEligibilityVerified,
  resolveEnrollmentContributionRows,
  validateEnrollmentDependents,
  type HrBenefitEnrollmentDependentInput,
} from "./hr-benefits-enrollment.shared";
import { loadActiveBenefitEligibilityRulesInTx } from "./hr-benefits-eligibility";
import {
  assertOpenEnrollmentAllowsPlanInTx,
  findActiveOpenEnrollmentWindowForPlanInTx,
} from "./hr-benefits-open-enrollment";
import { HrBenefitsCommandError } from "./hr-benefits.shared";
import {
  hrBenefitEnrollmentContributions,
  hrBenefitEnrollmentDependents,
  hrBenefitEnrollments,
  hrBenefitLifeEvents,
  hrBenefitPlans,
} from "./schema/hr-benefits";
import { hrEmployees } from "./schema/hr";

function mapEnrollmentValidationError(error: unknown): never {
  if (!(error instanceof Error)) {
    throw error;
  }
  const mapped: Record<string, HrBenefitsCommandError["code"]> = {
    coverage_level_not_allowed: "coverage_level_not_allowed",
    coverage_dates_invalid: "coverage_dates_invalid",
    dependents_not_allowed: "dependents_not_allowed",
    dependent_name_required: "dependent_name_required",
    dependent_relationship_not_allowed: "dependent_relationship_not_allowed",
    dependent_date_of_birth_required: "dependent_date_of_birth_required",
  };
  const code = mapped[error.message];
  if (code) {
    throw new HrBenefitsCommandError(code);
  }
  throw error;
}

async function assertEmployeeEligibleForPlanInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    planId: string;
    eligibilityOverrideReference?: string | null;
    asOf?: Date;
  },
): Promise<void> {
  if (input.eligibilityOverrideReference?.trim()) {
    return;
  }

  const [employee] = await db
    .select({
      countryCode: hrEmployees.countryCode,
      legalEntityCode: hrEmployees.legalEntityCode,
      workLocationCode: hrEmployees.workLocationCode,
      employmentType: hrEmployees.employmentType,
      workerCategory: hrEmployees.workerCategory,
      grade: hrEmployees.grade,
      level: hrEmployees.level,
      employmentStartDate: hrEmployees.employmentStartDate,
    })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, input.organizationId),
        eq(hrEmployees.id, input.employeeId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrBenefitsCommandError("employee_not_found");
  }

  const rules = await loadActiveBenefitEligibilityRulesInTx(db, {
    organizationId: input.organizationId,
    planId: input.planId,
  });

  const employeeScope: HrEmployeeBenefitScope = {
    countryCode: employee.countryCode,
    legalEntityCode: employee.legalEntityCode,
    workLocationCode: employee.workLocationCode,
    employmentType: employee.employmentType,
    workerCategory: employee.workerCategory,
    grade: employee.grade,
    level: employee.level,
    tenureMonths: computeEmployeeTenureMonths({
      employmentStartDate: employee.employmentStartDate,
      asOf: input.asOf,
    }),
  };

  if (!isEmployeeEligibleForBenefitPlan({ rules, employee: employeeScope })) {
    throw new HrBenefitsCommandError("employee_ineligible");
  }
}

async function storeEnrollmentContributionsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    enrollmentId: string;
    currencyCode: string;
    employerContributionAmount: string | null;
    employeeContributionAmount: string | null;
    effectiveFrom: Date;
    effectiveTo?: Date | null;
  },
): Promise<void> {
  const rows = resolveEnrollmentContributionRows(input);
  for (const row of rows) {
    await db.insert(hrBenefitEnrollmentContributions).values({
      id: createEntityId("hr_ben_contrib"),
      organizationId: row.organizationId,
      enrollmentId: row.enrollmentId,
      payer: row.payer,
      amount: row.amount,
      currencyCode: row.currencyCode,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
    });
  }
}

async function storeEnrollmentDependentsInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    enrollmentId: string;
    dependents: readonly HrBenefitEnrollmentDependentInput[];
  },
): Promise<void> {
  for (const dependent of input.dependents) {
    await db.insert(hrBenefitEnrollmentDependents).values({
      id: createEntityId("hr_ben_dep"),
      organizationId: input.organizationId,
      enrollmentId: input.enrollmentId,
      dependentName: dependent.dependentName.trim(),
      relationship: dependent.relationship,
      dateOfBirth: dependent.dateOfBirth ?? null,
      dependentReferenceId: dependent.dependentReferenceId?.trim() || null,
      coverageStartDate: dependent.coverageStartDate,
      coverageEndDate: dependent.coverageEndDate ?? null,
      eligibilityVerifiedAt: isDependentEligibilityVerified(dependent)
        ? new Date()
        : null,
    });
  }
}

/** HRM-BEN-008 … HRM-BEN-014 — enroll employee with coverage, dependents, and contributions. */
export async function createHrBenefitEnrollmentInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    planId: string;
    coverageLevel: (typeof hrBenefitEnrollments.$inferSelect)["coverageLevel"];
    enrollmentChannel: (typeof hrBenefitEnrollments.$inferSelect)["enrollmentChannel"];
    coverageStartDate: Date;
    coverageEndDate?: Date | null;
    openEnrollmentWindowId?: string | null;
    lifeEventId?: string | null;
    eligibilityOverrideReference?: string | null;
    enrolledByUserId?: string | null;
    waiverReason?: string | null;
    coverageStatus?: (typeof hrBenefitEnrollments.$inferSelect)["coverageStatus"];
    dependents?: readonly HrBenefitEnrollmentDependentInput[];
  },
): Promise<{ enrollmentId: string }> {
  const [plan] = await db
    .select({
      id: hrBenefitPlans.id,
      planStatus: hrBenefitPlans.planStatus,
      allowsDependents: hrBenefitPlans.allowsDependents,
      employerContributionAmount: hrBenefitPlans.employerContributionAmount,
      employeeContributionAmount: hrBenefitPlans.employeeContributionAmount,
      currencyCode: hrBenefitPlans.currencyCode,
      requiresApproval: hrBenefitPlans.requiresApproval,
    })
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
  if (plan.planStatus === "archived") {
    throw new HrBenefitsCommandError("plan_archived");
  }

  try {
    assertCoverageLevelAllowedForPlan({
      allowsDependents: plan.allowsDependents,
      coverageLevel: input.coverageLevel,
    });
    assertBenefitCoverageDatesValid({
      coverageStartDate: input.coverageStartDate,
      coverageEndDate: input.coverageEndDate,
    });
    validateEnrollmentDependents({
      coverageLevel: input.coverageLevel,
      dependents: input.dependents ?? [],
    });
  } catch (error) {
    mapEnrollmentValidationError(error);
  }

  if (input.enrollmentChannel === "open_enrollment") {
    let windowId = input.openEnrollmentWindowId?.trim();
    if (!windowId) {
      const active = await findActiveOpenEnrollmentWindowForPlanInTx(db, {
        organizationId: input.organizationId,
        planId: input.planId,
      });
      if (!active) {
        throw new HrBenefitsCommandError("open_enrollment_closed");
      }
      windowId = active.windowId;
    }
    await assertOpenEnrollmentAllowsPlanInTx(db, {
      organizationId: input.organizationId,
      windowId,
      planId: input.planId,
    });
    input = { ...input, openEnrollmentWindowId: windowId };
  }

  if (input.enrollmentChannel === "life_event" && !input.lifeEventId?.trim()) {
    throw new HrBenefitsCommandError("life_event_not_found");
  }

  if (!input.waiverReason?.trim()) {
    await assertEmployeeEligibleForPlanInTx(db, input);
  }

  const enrollmentId = createEntityId("hr_ben_enr");
  const coverageStatus =
    input.coverageStatus ??
    (input.waiverReason?.trim()
      ? "waived"
      : plan.requiresApproval
        ? "pending"
        : "active");

  await db.insert(hrBenefitEnrollments).values({
    id: enrollmentId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    planId: input.planId,
    coverageLevel: input.coverageLevel,
    coverageStatus,
    enrollmentChannel: input.enrollmentChannel,
    openEnrollmentWindowId: input.openEnrollmentWindowId ?? null,
    lifeEventId: input.lifeEventId ?? null,
    coverageStartDate: input.coverageStartDate,
    coverageEndDate: input.coverageEndDate ?? null,
    eligibilityOverrideReference: input.eligibilityOverrideReference?.trim() || null,
    enrolledByUserId: input.enrolledByUserId ?? null,
    waiverReason: input.waiverReason?.trim() || null,
  });

  if (!input.waiverReason?.trim()) {
    await storeEnrollmentContributionsInTx(db, {
      organizationId: input.organizationId,
      enrollmentId,
      currencyCode: plan.currencyCode,
      employerContributionAmount: plan.employerContributionAmount,
      employeeContributionAmount: plan.employeeContributionAmount,
      effectiveFrom: input.coverageStartDate,
      effectiveTo: input.coverageEndDate,
    });
  }

  if (input.dependents?.length) {
    await storeEnrollmentDependentsInTx(db, {
      organizationId: input.organizationId,
      enrollmentId,
      dependents: input.dependents,
    });
  }

  return { enrollmentId };
}

export async function createHrBenefitEnrollment(
  input: Parameters<typeof createHrBenefitEnrollmentInTx>[1],
): Promise<{ enrollmentId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    createHrBenefitEnrollmentInTx(db, input),
  );
}

export async function addHrBenefitEnrollmentDependentInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    enrollmentId: string;
    dependent: HrBenefitEnrollmentDependentInput;
  },
): Promise<{ dependentId: string }> {
  const [enrollment] = await db
    .select({
      id: hrBenefitEnrollments.id,
      coverageLevel: hrBenefitEnrollments.coverageLevel,
      planId: hrBenefitEnrollments.planId,
      employeeId: hrBenefitEnrollments.employeeId,
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

  const [plan] = await db
    .select({ allowsDependents: hrBenefitPlans.allowsDependents })
    .from(hrBenefitPlans)
    .where(eq(hrBenefitPlans.id, enrollment.planId))
    .limit(1);

  if (!plan?.allowsDependents) {
    throw new HrBenefitsCommandError("plan_dependents_not_supported");
  }

  try {
    validateEnrollmentDependents({
      coverageLevel: enrollment.coverageLevel,
      dependents: [input.dependent],
    });
  } catch (error) {
    mapEnrollmentValidationError(error);
  }

  const dependentId = createEntityId("hr_ben_dep");
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
    eligibilityVerifiedAt: isDependentEligibilityVerified(input.dependent)
      ? new Date()
      : null,
  });

  await appendHrBenefitAuditEventInTx(db, {
    organizationId: input.organizationId,
    enrollmentId: enrollment.id,
    planId: enrollment.planId,
    employeeId: enrollment.employeeId,
    action: "hr.benefits.dependent.add",
    summary: `Dependent ${input.dependent.dependentName} added to enrollment`,
  });

  return { dependentId };
}

/** HRM-BEN-010 — mark unverified dependents as eligibility-verified when records are complete. */
export async function verifyHrBenefitEnrollmentDependentsInTx(
  db: AfendaTransaction,
  input: { organizationId: string; enrollmentId: string },
): Promise<{ verifiedCount: number }> {
  const dependents = await db
    .select({
      id: hrBenefitEnrollmentDependents.id,
      dependentName: hrBenefitEnrollmentDependents.dependentName,
      relationship: hrBenefitEnrollmentDependents.relationship,
      dateOfBirth: hrBenefitEnrollmentDependents.dateOfBirth,
      eligibilityVerifiedAt: hrBenefitEnrollmentDependents.eligibilityVerifiedAt,
    })
    .from(hrBenefitEnrollmentDependents)
    .where(
      and(
        eq(hrBenefitEnrollmentDependents.organizationId, input.organizationId),
        eq(hrBenefitEnrollmentDependents.enrollmentId, input.enrollmentId),
      ),
    );

  let verifiedCount = 0;
  const now = new Date();

  for (const dependent of dependents) {
    if (dependent.eligibilityVerifiedAt) {
      continue;
    }
    if (
      !isDependentEligibilityVerified({
        dependentName: dependent.dependentName,
        relationship: dependent.relationship,
        dateOfBirth: dependent.dateOfBirth,
        coverageStartDate: now,
      })
    ) {
      throw new HrBenefitsCommandError("dependent_not_verified");
    }
    await db
      .update(hrBenefitEnrollmentDependents)
      .set({ eligibilityVerifiedAt: now })
      .where(eq(hrBenefitEnrollmentDependents.id, dependent.id));
    verifiedCount += 1;
  }

  if (verifiedCount === 0 && dependents.some((row) => !row.eligibilityVerifiedAt)) {
    throw new HrBenefitsCommandError("dependent_not_verified");
  }

  return { verifiedCount };
}

export async function recordHrBenefitLifeEventInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    employeeId: string;
    kind: (typeof hrBenefitLifeEvents.$inferSelect)["kind"];
    eventDate: Date;
    notes?: string | null;
    approvalReference?: string | null;
  },
): Promise<{ lifeEventId: string }> {
  const [employee] = await db
    .select({ id: hrEmployees.id })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, input.organizationId),
        eq(hrEmployees.id, input.employeeId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrBenefitsCommandError("employee_not_found");
  }

  const lifeEventId = createEntityId("hr_ben_lev");
  await db.insert(hrBenefitLifeEvents).values({
    id: lifeEventId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    kind: input.kind,
    eventDate: input.eventDate,
    notes: input.notes?.trim() || null,
    approvalReference: input.approvalReference?.trim() || null,
  });

  return { lifeEventId };
}

export async function recordHrBenefitLifeEvent(
  input: Parameters<typeof recordHrBenefitLifeEventInTx>[1],
): Promise<{ lifeEventId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    recordHrBenefitLifeEventInTx(db, input),
  );
}
