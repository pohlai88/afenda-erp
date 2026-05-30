"use server";

import {
  addHrBenefitEnrollmentDependentInTx,
  appendHrBenefitAuditEventInTx,
  applyHrBenefitEnrollmentChangeInTx,
  approveHrBenefitEnrollmentInTx,
  buildHrBenefitReportCsv,
  createHrBenefitEnrollmentInTx,
  linkHrBenefitDocumentInTx,
  markHrBenefitDeductionRefsSyncedInTx,
  unlinkHrBenefitDocumentInTx,
  upsertHrBenefitProviderInTx,
  verifyHrBenefitEnrollmentDependentsInTx,
} from "@afenda/db";
import {
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { z } from "zod";

import { hrPayrollBenefitsAuditActions } from "../events/hr.payroll.benefits.event";
import { HR_BENEFIT_REPORT_KINDS } from "../data/hr.payroll.benefits-reports.shared";
import { requireHrBenefitsRead, requireHrBenefitsWrite } from "../policies/hr.payroll.benefits-access.policy.server";
import {
  parseHrBenefitsAddDependentForm,
  parseHrBenefitsDocumentLinkForm,
  parseHrBenefitsDocumentUnlinkForm,
  parseHrBenefitsEnrollmentApprovalForm,
  parseHrBenefitsEnrollmentChangeForm,
  parseHrBenefitsEnrollmentCreateForm,
  parseHrBenefitsPayrollExportForm,
  parseHrBenefitsProviderForm,
  parseHrBenefitsVerifyDependentsForm,
} from "../schemas/hr.payroll.benefits-form.shared";
import { listApprovedBenefitPayrollDeductionRefs } from "../../_integration/payroll-deductions.server";
import { toBenefitsActionFailure } from "../data/hr.payroll.benefits-action-result.shared";
import { finalizeBenefitsMutation } from "./hr.payroll.benefits.mutation.shared.server";

export async function createHrBenefitEnrollmentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBenefitsWrite();
  const parsed = parseHrBenefitsEnrollmentCreateForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBenefitsMutation(organization.id, async (db) => {
    const created = await createHrBenefitEnrollmentInTx(db, {
      organizationId: organization.id,
      employeeId: parsed.data.employeeId,
      planId: parsed.data.planId,
      coverageLevel: parsed.data.coverageLevel,
      enrollmentChannel: parsed.data.enrollmentChannel,
      coverageStartDate: parsed.data.coverageStartDate,
      coverageEndDate: parsed.data.coverageEndDate,
      openEnrollmentWindowId: parsed.data.openEnrollmentWindowId,
      lifeEventId: parsed.data.lifeEventId,
      eligibilityOverrideReference: parsed.data.eligibilityOverrideReference,
      enrolledByUserId: session.id,
      dependents: parsed.data.dependents,
    });

    await appendHrBenefitAuditEventInTx(db, {
      organizationId: organization.id,
      enrollmentId: created.enrollmentId,
      employeeId: parsed.data.employeeId,
      planId: parsed.data.planId,
      actorUserId: session.id,
      action: hrPayrollBenefitsAuditActions.enrollment.created,
      summary: `Benefit enrollment created (${parsed.data.enrollmentChannel})`,
      metadata: {
        coverageLevel: parsed.data.coverageLevel,
        eligibilityOverrideReference: parsed.data.eligibilityOverrideReference,
      },
    });

    if (parsed.data.eligibilityOverrideReference?.trim()) {
      await appendHrBenefitAuditEventInTx(db, {
        organizationId: organization.id,
        enrollmentId: created.enrollmentId,
        employeeId: parsed.data.employeeId,
        planId: parsed.data.planId,
        actorUserId: session.id,
        action: hrPayrollBenefitsAuditActions.eligibility.overrideApproved,
        summary: "Ineligible enrollment allowed via authorized override",
        metadata: {
          eligibilityOverrideReference: parsed.data.eligibilityOverrideReference,
        },
      });
    }

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBenefitsAuditActions.enrollment.created,
      targetId: created.enrollmentId,
      summary: "Benefit enrollment created",
      metadata: created,
    };
  });
}

export async function addHrBenefitEnrollmentDependentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBenefitsWrite();
  const parsed = parseHrBenefitsAddDependentForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBenefitsMutation(organization.id, async (db) => {
    const result = await addHrBenefitEnrollmentDependentInTx(db, {
      organizationId: organization.id,
      enrollmentId: parsed.data.enrollmentId,
      dependent: {
        dependentName: parsed.data.dependentName,
        relationship: parsed.data.relationship,
        dateOfBirth: parsed.data.dateOfBirth,
        dependentReferenceId: parsed.data.dependentReferenceId,
        coverageStartDate: parsed.data.coverageStartDate,
        coverageEndDate: parsed.data.coverageEndDate,
      },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBenefitsAuditActions.dependent.added,
      targetId: result.dependentId,
      summary: "Benefit dependent added to enrollment",
      metadata: result,
    };
  });
}

export async function verifyHrBenefitEnrollmentDependentsAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBenefitsWrite();
  const parsed = parseHrBenefitsVerifyDependentsForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBenefitsMutation(organization.id, async (db) => {
    const result = await verifyHrBenefitEnrollmentDependentsInTx(db, {
      organizationId: organization.id,
      enrollmentId: parsed.data.enrollmentId,
    });

    await appendHrBenefitAuditEventInTx(db, {
      organizationId: organization.id,
      enrollmentId: parsed.data.enrollmentId,
      actorUserId: session.id,
      action: hrPayrollBenefitsAuditActions.dependent.eligibilityVerified,
      summary: `Verified ${result.verifiedCount} dependent(s)`,
      metadata: result,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBenefitsAuditActions.dependent.eligibilityVerified,
      targetId: parsed.data.enrollmentId,
      summary: "Dependent eligibility verified",
      metadata: result,
    };
  });
}

export async function upsertHrBenefitProviderAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBenefitsWrite();
  const parsed = parseHrBenefitsProviderForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBenefitsMutation(organization.id, async (db) => {
    const result = await upsertHrBenefitProviderInTx(db, {
      organizationId: organization.id,
      code: parsed.data.code,
      name: parsed.data.name,
      contactEmail: parsed.data.contactEmail || null,
      contactPhone: parsed.data.contactPhone || null,
      externalReference: parsed.data.externalReference || null,
    });

    await appendHrBenefitAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBenefitsAuditActions.provider.created,
      summary: `Benefit provider ${parsed.data.code} saved`,
      metadata: { providerId: result.providerId },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBenefitsAuditActions.provider.created,
      targetId: result.providerId,
      summary: `Benefit provider ${parsed.data.code} saved`,
      metadata: { providerId: result.providerId },
    };
  });
}

export async function approveHrBenefitEnrollmentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBenefitsWrite();
  const parsed = parseHrBenefitsEnrollmentApprovalForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBenefitsMutation(organization.id, async (db) => {
    const result = await approveHrBenefitEnrollmentInTx(db, {
      organizationId: organization.id,
      enrollmentId: parsed.data.enrollmentId,
      approvedByUserId: session.id,
      approvalReference: parsed.data.approvalReference || null,
    });

    await appendHrBenefitAuditEventInTx(db, {
      organizationId: organization.id,
      enrollmentId: result.enrollmentId,
      actorUserId: session.id,
      action: hrPayrollBenefitsAuditActions.enrollment.approved,
      summary: "Benefit enrollment approved and coverage activated",
      metadata: {
        deductionReferenceId: result.deductionReferenceId,
        payrollDeductionReference: result.payrollDeductionReference,
      },
    });

    if (result.deductionReferenceId) {
      await appendHrBenefitAuditEventInTx(db, {
        organizationId: organization.id,
        enrollmentId: result.enrollmentId,
        actorUserId: session.id,
        action: hrPayrollBenefitsAuditActions.deduction.referenceCreated,
        summary: "Payroll deduction reference created for employee contribution",
        metadata: {
          deductionReferenceId: result.deductionReferenceId,
          payrollDeductionReference: result.payrollDeductionReference,
        },
      });
    }

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBenefitsAuditActions.enrollment.approved,
      targetId: result.enrollmentId,
      summary: "Benefit enrollment approved",
      metadata: result,
    };
  });
}

export async function applyHrBenefitEnrollmentChangeAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBenefitsWrite();
  const parsed = parseHrBenefitsEnrollmentChangeForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBenefitsMutation(organization.id, async (db) => {
    const result = await applyHrBenefitEnrollmentChangeInTx(db, {
      organizationId: organization.id,
      enrollmentId: parsed.data.enrollmentId,
      changeKind: parsed.data.changeKind,
      changedByUserId: session.id,
      notes: parsed.data.notes || null,
      effectiveFrom: parsed.data.effectiveFrom,
      planId: parsed.data.planId,
      coverageLevel: parsed.data.coverageLevel,
      dependent:
        parsed.data.dependentName || parsed.data.dependentId
          ? {
              dependentId: parsed.data.dependentId,
              dependentName: parsed.data.dependentName ?? "",
              relationship: parsed.data.dependentRelationship ?? "other",
              dependentReferenceId: parsed.data.dependentReferenceId ?? null,
              coverageStartDate:
                parsed.data.dependentCoverageStartDate ?? new Date(),
              remove: parsed.data.removeDependent,
            }
          : undefined,
      contribution: parsed.data.contributionAmount
        ? {
            amount: parsed.data.contributionAmount,
            frequency: parsed.data.contributionFrequency,
            payer: "employee",
          }
        : undefined,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBenefitsAuditActions.enrollment.changed,
      targetId: result.enrollmentId,
      summary: `Benefit enrollment ${parsed.data.changeKind.replace(/_/g, " ")} applied`,
      metadata: result,
    };
  });
}

export async function linkHrBenefitDocumentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBenefitsWrite();
  const parsed = parseHrBenefitsDocumentLinkForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBenefitsMutation(organization.id, async (db) => {
    const result = await linkHrBenefitDocumentInTx(db, {
      organizationId: organization.id,
      recordKind: parsed.data.recordKind,
      recordId: parsed.data.recordId,
      employeeDocumentId: parsed.data.employeeDocumentId || null,
      externalReference: parsed.data.externalReference || null,
      documentKind: parsed.data.documentKind,
      notes: parsed.data.notes || null,
    });

    await appendHrBenefitAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBenefitsAuditActions.document.linked,
      summary: `Supporting document linked to benefit ${parsed.data.recordKind}`,
      metadata: {
        documentLinkId: result.documentLinkId,
        recordId: parsed.data.recordId,
      },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBenefitsAuditActions.document.linked,
      targetId: result.documentLinkId,
      summary: "Benefit supporting document linked",
      metadata: {
        recordKind: parsed.data.recordKind,
        recordId: parsed.data.recordId,
      },
    };
  });
}

export async function unlinkHrBenefitDocumentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBenefitsWrite();
  const parsed = parseHrBenefitsDocumentUnlinkForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeBenefitsMutation(organization.id, async (db) => {
    const result = await unlinkHrBenefitDocumentInTx(db, {
      organizationId: organization.id,
      documentLinkId: parsed.data.documentLinkId,
    });

    await appendHrBenefitAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBenefitsAuditActions.document.unlinked,
      summary: "Benefit supporting document unlinked",
      metadata: { documentLinkId: result.documentLinkId },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBenefitsAuditActions.document.unlinked,
      targetId: result.documentLinkId,
      summary: "Benefit supporting document unlinked",
    };
  });
}

const exportHrBenefitReportFormSchema = z.object({
  reportKind: z.enum(HR_BENEFIT_REPORT_KINDS),
});

/** HRM-BEN-024 … BEN-026 — CSV export with sensitive amount masking. */
export async function exportHrBenefitReportAction(
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof buildHrBenefitReportCsv>>>> {
  const { session, organization, canViewSensitive } = await requireHrBenefitsRead();
  const parsed = exportHrBenefitReportFormSchema.safeParse({
    reportKind: formData.get("reportKind"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const exportBody = await buildHrBenefitReportCsv({
      reportKind: parsed.data.reportKind,
      organizationId: organization.id,
      canViewSensitive,
    });

    const mutationResult = await finalizeBenefitsMutation(
      organization.id,
      async (db) => {
        await appendHrBenefitAuditEventInTx(db, {
          organizationId: organization.id,
          actorUserId: session.id,
          action: hrPayrollBenefitsAuditActions.reports.exported,
          summary: `Benefits ${parsed.data.reportKind} report exported`,
          metadata: {
            reportKind: parsed.data.reportKind,
            rowCount: exportBody.rowCount,
          },
        });

        return {
          organizationId: organization.id,
          actorId: session.id,
          action: hrPayrollBenefitsAuditActions.reports.exported,
          targetId: organization.id,
          summary: `Benefits ${parsed.data.reportKind} report exported`,
          metadata: {
            reportKind: parsed.data.reportKind,
            rowCount: exportBody.rowCount,
          },
        };
      },
    );

    if (!mutationResult.ok) {
      return mutationResult as ActionResult<
        Awaited<ReturnType<typeof buildHrBenefitReportCsv>>
      >;
    }

    return actionSuccess(exportBody);
  } catch (error) {
    return toBenefitsActionFailure(error) as ActionResult<
      Awaited<ReturnType<typeof buildHrBenefitReportCsv>>
    >;
  }
}

/** HRM-BEN-016 — export approved recurring deductions to Payroll Processing (reference-only). */
export async function exportHrBenefitPayrollDeductionRefsAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrBenefitsWrite();
  const parsed = parseHrBenefitsPayrollExportForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  const rows = await listApprovedBenefitPayrollDeductionRefs({
    organizationId: organization.id,
    periodStart: parsed.data.periodStart,
    periodEnd: parsed.data.periodEnd,
  });

  return finalizeBenefitsMutation(organization.id, async (db) => {
    const syncResult = await markHrBenefitDeductionRefsSyncedInTx(db, {
      organizationId: organization.id,
      deductionReferenceIds: rows.map((row) => row.deductionReferenceId),
    });
    await appendHrBenefitAuditEventInTx(db, {
      organizationId: organization.id,
      actorUserId: session.id,
      action: hrPayrollBenefitsAuditActions.deduction.payrollIntegrated,
      summary: "Approved benefit payroll deduction references exported",
      metadata: {
        count: rows.length,
        syncedCount: syncResult.syncedCount,
        periodStart: parsed.data.periodStart.toISOString(),
        periodEnd: parsed.data.periodEnd.toISOString(),
        rows,
      },
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrPayrollBenefitsAuditActions.deduction.payrollIntegrated,
      targetId: `${parsed.data.periodStart.toISOString()}_${parsed.data.periodEnd.toISOString()}`,
      summary: "Benefit payroll deduction references exported",
      metadata: { count: rows.length, syncedCount: syncResult.syncedCount, rows },
    };
  });
}
