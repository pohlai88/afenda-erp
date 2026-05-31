"use server";

import { eq, and } from "drizzle-orm";
import { runWithOrganizationContext } from "@afenda/db";
import { hrCompensationCycles } from "@afenda/db";
import { type ActionResult, zodActionFailure } from "@afenda/governed-surface/schemas";

import {
  buildHrCompensationPlanningReportCsv,
  filterHrCompensationPlanningReportRows,
  listHrCompensationPlanningReportRows,
  type HrCompensationPlanningReportFilter,
} from "../data/hr.payroll.cpm-reports.shared";
import { hrPayrollCpmAuditActions } from "../events/hr.payroll.cpm.event";
import {
  requireHrCpmApprove,
  requireHrCpmRead,
  requireHrCpmWrite,
} from "../policies/hr.payroll.cpm-access.policy.server";
import {
  hrCpmAssignParticipantSchema,
  hrCpmBudgetPoolSchema,
  hrCpmCreateCycleSchema,
  hrCpmCreateRecommendationFormSchema,
  hrCpmEligibilityRuleSchema,
  hrCpmFinalizeApprovalFormSchema,
  hrCpmFinalizeApprovalSchema,
  hrCpmReviewDecisionSchema,
  hrCpmReviewRecommendationFormSchema,
  hrCpmRouteApprovalSchema,
  hrCpmSubmitRecommendationFormSchema,
  mapHrCpmCreateRecommendationFormToMutation,
  parseHrCpmRecommendationInput,
} from "../schemas/hr.payroll.cpm-mutation.schema";
import { finalizeHrCpmMutation } from "./hr.payroll.cpm.mutation.shared.server";

function readCpmFormField(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  if (value == null) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

export async function createCompensationCycleAction(input: unknown) {
  const guard = await requireHrCpmWrite();
  const parsed = hrCpmCreateCycleSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { createHrCompensationCycleInTx } = await import("@afenda/db");
    return createHrCompensationCycleInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      code: parsed.code,
      name: parsed.name,
      cycleType: parsed.cycleType,
      effectiveDate: parsed.effectiveDate,
      currencyCode: parsed.currencyCode,
      approvalRules: parsed.approvalRules,
    });
  });
}

export async function createCompensationBudgetPoolAction(input: unknown) {
  const guard = await requireHrCpmWrite();
  const parsed = hrCpmBudgetPoolSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { upsertHrCompensationBudgetPoolInTx } = await import("@afenda/db");
    return upsertHrCompensationBudgetPoolInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      ...parsed,
    });
  });
}

export async function createCompensationEligibilityRuleAction(input: unknown) {
  const guard = await requireHrCpmWrite();
  const parsed = hrCpmEligibilityRuleSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { upsertHrCompensationEligibilityRuleInTx } = await import("@afenda/db");
    return upsertHrCompensationEligibilityRuleInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      ...parsed,
    });
  });
}

export async function assignCompensationParticipantAction(input: unknown) {
  const guard = await requireHrCpmWrite();
  const parsed = hrCpmAssignParticipantSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { assignHrCompensationParticipantInTx } = await import("@afenda/db");
    return assignHrCompensationParticipantInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      ...parsed,
    });
  });
}

export async function createCompensationRecommendationAction(input: unknown) {
  const guard = await requireHrCpmWrite();
  const parsed = parseHrCpmRecommendationInput(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { upsertHrCompensationRecommendationInTx } = await import("@afenda/db");
    return upsertHrCompensationRecommendationInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      ...parsed,
    });
  });
}

export async function createCompensationRecommendationFormAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = hrCpmCreateRecommendationFormSchema.safeParse({
    cycleId: readCpmFormField(formData, "cycleId"),
    participantId: readCpmFormField(formData, "participantId"),
    employeeId: readCpmFormField(formData, "employeeId"),
    adjustmentType: readCpmFormField(formData, "adjustmentType"),
    currentSalary: readCpmFormField(formData, "currentSalary"),
    increaseMode: readCpmFormField(formData, "increaseMode"),
    increaseAmount: readCpmFormField(formData, "increaseAmount"),
    increasePercent: readCpmFormField(formData, "increasePercent"),
    budgetPoolId: readCpmFormField(formData, "budgetPoolId") ?? null,
    managerComments: readCpmFormField(formData, "managerComments") ?? null,
    justification: readCpmFormField(formData, "justification") ?? null,
    grade: readCpmFormField(formData, "grade") ?? null,
    legalEntityCode: readCpmFormField(formData, "legalEntityCode") ?? null,
    proposedGrade: readCpmFormField(formData, "proposedGrade") ?? null,
    proposedLevel: readCpmFormField(formData, "proposedLevel") ?? null,
    marketReferencePercentile: readCpmFormField(
      formData,
      "marketReferencePercentile",
    ),
    equityGapReference: readCpmFormField(formData, "equityGapReference") ?? null,
    retentionRiskLevel: readCpmFormField(formData, "retentionRiskLevel") ?? null,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrCpmWrite();
  const mutationInput = mapHrCpmCreateRecommendationFormToMutation(parsed.data);

  return finalizeHrCpmMutation(async () => {
    await runWithOrganizationContext(guard.organization.id, async (db) => {
      const { upsertHrCompensationRecommendationInTx } = await import("@afenda/db");
      await upsertHrCompensationRecommendationInTx(db, {
        organizationId: guard.organization.id,
        actorUserId: guard.session.id,
        ...parseHrCpmRecommendationInput(mutationInput),
      });
    });
  });
}

export async function submitCompensationRecommendationAction(input: {
  recommendationId: string;
}) {
  const guard = await requireHrCpmWrite();

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { submitHrCompensationRecommendationInTx } = await import("@afenda/db");
    await submitHrCompensationRecommendationInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      recommendationId: input.recommendationId,
    });
    return { ok: true as const };
  });
}

export async function submitCompensationRecommendationFormAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = hrCpmSubmitRecommendationFormSchema.safeParse({
    recommendationId: readCpmFormField(formData, "recommendationId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrCpmWrite();

  return finalizeHrCpmMutation(async () => {
    await runWithOrganizationContext(guard.organization.id, async (db) => {
      const { submitHrCompensationRecommendationInTx } = await import("@afenda/db");
      await submitHrCompensationRecommendationInTx(db, {
        organizationId: guard.organization.id,
        actorUserId: guard.session.id,
        recommendationId: parsed.data.recommendationId,
      });
    });
  });
}

export async function reviewCompensationRecommendationAction(input: unknown) {
  const guard = await requireHrCpmApprove();
  const parsed = hrCpmReviewDecisionSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { reviewHrCompensationRecommendationInTx } = await import("@afenda/db");
    await reviewHrCompensationRecommendationInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      ...parsed,
    });
    return { ok: true as const };
  });
}

export async function reviewCompensationRecommendationFormAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = hrCpmReviewRecommendationFormSchema.safeParse({
    recommendationId: readCpmFormField(formData, "recommendationId"),
    decision: readCpmFormField(formData, "decision"),
    notes: readCpmFormField(formData, "notes") ?? null,
    proposedSalary: readCpmFormField(formData, "proposedSalary"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrCpmApprove();

  return finalizeHrCpmMutation(async () => {
    await runWithOrganizationContext(guard.organization.id, async (db) => {
      const { reviewHrCompensationRecommendationInTx } = await import("@afenda/db");
      await reviewHrCompensationRecommendationInTx(db, {
        organizationId: guard.organization.id,
        actorUserId: guard.session.id,
        recommendationId: parsed.data.recommendationId,
        decision: parsed.data.decision,
        notes: parsed.data.notes,
        proposedSalary: parsed.data.proposedSalary,
      });
    });
  });
}

export async function routeCompensationApprovalAction(input: unknown) {
  const guard = await requireHrCpmApprove();
  const parsed = hrCpmRouteApprovalSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { routeHrCompensationApprovalInTx } = await import("@afenda/db");
    const [cycle] = await db
      .select({ approvalRules: hrCompensationCycles.approvalRules })
      .from(hrCompensationCycles)
      .where(
        and(
          eq(hrCompensationCycles.organizationId, guard.organization.id),
          eq(hrCompensationCycles.id, parsed.cycleId),
        ),
      )
      .limit(1);

    return routeHrCompensationApprovalInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      recommendationId: parsed.recommendationId,
      approvalRules: cycle?.approvalRules ?? { steps: [] },
    });
  });
}

export async function finalizeCompensationApprovalAction(input: unknown) {
  const guard = await requireHrCpmApprove();
  const parsed = hrCpmFinalizeApprovalSchema.parse(input);

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { finalizeHrCompensationApprovalInTx } = await import("@afenda/db");
    return finalizeHrCompensationApprovalInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      ...parsed,
    });
  });
}

export async function finalizeCompensationApprovalFormAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = hrCpmFinalizeApprovalFormSchema.safeParse({
    recommendationId: readCpmFormField(formData, "recommendationId"),
    effectiveDate: readCpmFormField(formData, "effectiveDate"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrCpmApprove();

  return finalizeHrCpmMutation(async () => {
    await runWithOrganizationContext(guard.organization.id, async (db) => {
      const { finalizeHrCompensationApprovalInTx } = await import("@afenda/db");
      await finalizeHrCompensationApprovalInTx(db, {
        organizationId: guard.organization.id,
        actorUserId: guard.session.id,
        recommendationId: parsed.data.recommendationId,
        effectiveDate: parsed.data.effectiveDate,
      });
    });
  });
}

export async function exportCompensationPlanningReportAction(input: {
  filter?: HrCompensationPlanningReportFilter;
}) {
  const guard = await requireHrCpmRead();
  const filter = input.filter ?? {};

  const rawRows = await listHrCompensationPlanningReportRows({
    organizationId: guard.organization.id,
    cycleId: filter.cycleId ?? undefined,
  });

  const rows = filterHrCompensationPlanningReportRows(rawRows, filter);
  const csv = buildHrCompensationPlanningReportCsv(rows);

  await runWithOrganizationContext(guard.organization.id, async (db) => {
    const { appendHrCompensationAuditEventInTx } = await import("@afenda/db");
    await appendHrCompensationAuditEventInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      action: hrPayrollCpmAuditActions.report.export,
      cycleId: filter.cycleId ?? null,
      summary: `Exported compensation planning report (${rows.length} rows)`,
      metadata: { rowCount: rows.length, filter },
    });
  });

  return { csv, rowCount: rows.length };
}

export async function createCompensationScenarioAction(input: {
  cycleId: string;
  participantId: string;
  label: string;
  snapshot: Record<string, unknown>;
  recommendationId?: string | null;
}) {
  const guard = await requireHrCpmWrite();

  return runWithOrganizationContext(guard.organization.id, async (db) => {
    const { createHrCompensationScenarioInTx } = await import("@afenda/db");
    return createHrCompensationScenarioInTx(db, {
      organizationId: guard.organization.id,
      actorUserId: guard.session.id,
      ...input,
    });
  });
}
