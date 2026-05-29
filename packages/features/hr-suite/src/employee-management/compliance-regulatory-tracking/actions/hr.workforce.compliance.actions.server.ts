"use server";

import {
  archiveHrComplianceObligationInTx,
  assignHrComplianceCorrectiveActionInTx,
  createHrComplianceExceptionInTx,
  ensureHrWorkEligibilityTrackingInTx,
  HR_COMPLIANCE_LABOR_LAW_REQUIREMENT_KIND,
  resolveHrComplianceExceptionInTx,
  syncHrEmployeeLaborLawRequirementsInTx,
  updateHrComplianceCorrectiveActionProgressInTx,
  updateHrEmployeeLaborLawRequirementStatusInTx,
  updateHrWorkEligibilityStatusInTx,
  upsertHrComplianceObligationInTx,
  waiveHrComplianceExceptionInTx,
} from "@afenda/db";
import { type ActionResult, zodActionFailure } from "@afenda/governed-surface/schemas";

import { hrWorkforceComplianceAuditActions } from "../events/hr.workforce.compliance.event";
import { requireHrComplianceWrite } from "../policies/hr.workforce.compliance-access.policy.server";
import {
  assignHrComplianceCorrectiveActionFormSchema,
  createHrComplianceExceptionFormSchema,
  resolveHrComplianceExceptionFormSchema,
  updateHrComplianceCorrectiveActionProgressFormSchema,
  waiveHrComplianceExceptionFormSchema,
} from "../schemas/hr.workforce.compliance-exception.schema";
import {
  archiveHrComplianceObligationFormSchema,
  upsertHrComplianceObligationFormSchema,
} from "../schemas/hr.workforce.compliance-obligation.schema";
import { updateHrEmployeeLaborLawRequirementFormSchema, syncHrEmployeeLaborLawRequirementsFormSchema } from "../schemas/hr.workforce.compliance-labor-law.schema";
import { updateHrWorkEligibilityFormSchema, ensureHrWorkEligibilityTrackingFormSchema } from "../schemas/hr.workforce.compliance-work-eligibility.schema";
import { readOptionalComplianceFormField } from "../schemas/hr.workforce.compliance-form.shared";
import { finalizeComplianceMutation } from "./hr.workforce.compliance-action.shared.server";

export async function upsertHrComplianceObligationAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = upsertHrComplianceObligationFormSchema.safeParse({
    code: readOptionalComplianceFormField(formData, "code"),
    title: readOptionalComplianceFormField(formData, "title"),
    description: readOptionalComplianceFormField(formData, "description"),
    complianceArea: readOptionalComplianceFormField(formData, "complianceArea"),
    requirementKind: readOptionalComplianceFormField(formData, "requirementKind"),
    countryCode: readOptionalComplianceFormField(formData, "countryCode"),
    legalEntityCode: readOptionalComplianceFormField(formData, "legalEntityCode"),
    departmentId: readOptionalComplianceFormField(formData, "departmentId"),
    workLocationCode: readOptionalComplianceFormField(formData, "workLocationCode"),
    employmentType: readOptionalComplianceFormField(formData, "employmentType"),
    workerCategory: readOptionalComplianceFormField(formData, "workerCategory"),
    dueDate: readOptionalComplianceFormField(formData, "dueDate"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await upsertHrComplianceObligationInTx(db, {
      organizationId: organization.id,
      code: parsed.data.code,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      complianceArea: parsed.data.complianceArea,
      requirementKind: parsed.data.requirementKind,
      departmentId: parsed.data.departmentId ?? null,
      dueDate: parsed.data.dueDate ?? null,
      countryCode: parsed.data.countryCode ?? null,
      legalEntityCode: parsed.data.legalEntityCode ?? null,
      workLocationCode: parsed.data.workLocationCode ?? null,
      employmentType: parsed.data.employmentType ?? null,
      workerCategory: parsed.data.workerCategory ?? null,
    });

    if (parsed.data.requirementKind === HR_COMPLIANCE_LABOR_LAW_REQUIREMENT_KIND) {
      await syncHrEmployeeLaborLawRequirementsInTx(db, {
        organizationId: organization.id,
      });
    }

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.obligation.configured,
      targetId: result.obligationId,
      metadata: {
        code: parsed.data.code,
        countryCode: parsed.data.countryCode ?? null,
        legalEntityCode: parsed.data.legalEntityCode ?? null,
        workLocationCode: parsed.data.workLocationCode ?? null,
        employmentType: parsed.data.employmentType ?? null,
        workerCategory: parsed.data.workerCategory ?? null,
      },
    };
  });
}

export async function archiveHrComplianceObligationAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = archiveHrComplianceObligationFormSchema.safeParse({
    obligationId: readOptionalComplianceFormField(formData, "obligationId"),
    status: readOptionalComplianceFormField(formData, "status") ?? "archived",
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    await archiveHrComplianceObligationInTx(db, {
      organizationId: organization.id,
      obligationId: parsed.data.obligationId,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.obligation.archived,
      targetId: parsed.data.obligationId,
    };
  });
}

export async function createHrComplianceExceptionAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = createHrComplianceExceptionFormSchema.safeParse({
    title: readOptionalComplianceFormField(formData, "title"),
    complianceArea: readOptionalComplianceFormField(formData, "complianceArea"),
    itemType: readOptionalComplianceFormField(formData, "itemType"),
    severity: readOptionalComplianceFormField(formData, "severity"),
    employeeId: readOptionalComplianceFormField(formData, "employeeId"),
    correctiveActionDescription: readOptionalComplianceFormField(
      formData,
      "correctiveActionDescription",
    ),
    correctiveActionDueDate: readOptionalComplianceFormField(
      formData,
      "correctiveActionDueDate",
    ),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await createHrComplianceExceptionInTx(db, {
      organizationId: organization.id,
      title: parsed.data.title,
      complianceArea: parsed.data.complianceArea,
      itemType: parsed.data.itemType,
      severity: parsed.data.severity,
      employeeId: parsed.data.employeeId ?? null,
      correctiveActionDescription:
        parsed.data.correctiveActionDescription ?? null,
      correctiveActionDueDate: parsed.data.correctiveActionDueDate ?? null,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.exception.created,
      targetId: result.exceptionId,
    };
  });
}

export async function assignHrComplianceCorrectiveActionAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = assignHrComplianceCorrectiveActionFormSchema.safeParse({
    exceptionId: readOptionalComplianceFormField(formData, "exceptionId"),
    correctiveActionDescription: readOptionalComplianceFormField(
      formData,
      "correctiveActionDescription",
    ),
    correctiveActionDueDate: readOptionalComplianceFormField(
      formData,
      "correctiveActionDueDate",
    ),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    await assignHrComplianceCorrectiveActionInTx(db, {
      organizationId: organization.id,
      exceptionId: parsed.data.exceptionId,
      correctiveActionDescription: parsed.data.correctiveActionDescription,
      correctiveActionDueDate: parsed.data.correctiveActionDueDate,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action:
        hrWorkforceComplianceAuditActions.exception.correctiveActionAssigned,
      targetId: parsed.data.exceptionId,
    };
  });
}

export async function updateHrComplianceCorrectiveActionProgressAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = updateHrComplianceCorrectiveActionProgressFormSchema.safeParse({
    exceptionId: readOptionalComplianceFormField(formData, "exceptionId"),
    progressNote: readOptionalComplianceFormField(formData, "progressNote"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    await updateHrComplianceCorrectiveActionProgressInTx(db, {
      organizationId: organization.id,
      exceptionId: parsed.data.exceptionId,
      progressNote: parsed.data.progressNote,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.exception.correctiveActionUpdated,
      targetId: parsed.data.exceptionId,
    };
  });
}

export async function resolveHrComplianceExceptionAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = resolveHrComplianceExceptionFormSchema.safeParse({
    exceptionId: readOptionalComplianceFormField(formData, "exceptionId"),
    resolutionNote: readOptionalComplianceFormField(formData, "resolutionNote"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    await resolveHrComplianceExceptionInTx(db, {
      organizationId: organization.id,
      exceptionId: parsed.data.exceptionId,
      resolutionNote: parsed.data.resolutionNote ?? null,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.exception.resolved,
      targetId: parsed.data.exceptionId,
    };
  });
}

export async function waiveHrComplianceExceptionAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = waiveHrComplianceExceptionFormSchema.safeParse({
    exceptionId: readOptionalComplianceFormField(formData, "exceptionId"),
    waiverReason: readOptionalComplianceFormField(formData, "waiverReason"),
    approvalReference: readOptionalComplianceFormField(formData, "approvalReference"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    await waiveHrComplianceExceptionInTx(db, {
      organizationId: organization.id,
      exceptionId: parsed.data.exceptionId,
      waiverReason: parsed.data.waiverReason,
      approvalReference: parsed.data.approvalReference,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.exception.waived,
      targetId: parsed.data.exceptionId,
    };
  });
}

export async function syncHrEmployeeLaborLawRequirementsAction(
  _previous: ActionResult | undefined,
  _formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = syncHrEmployeeLaborLawRequirementsFormSchema.safeParse({});

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await syncHrEmployeeLaborLawRequirementsInTx(db, {
      organizationId: organization.id,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.laborLaw.synced,
      targetId: organization.id,
      metadata: result,
    };
  });
}

export async function updateHrEmployeeLaborLawRequirementAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = updateHrEmployeeLaborLawRequirementFormSchema.safeParse({
    requirementId: readOptionalComplianceFormField(formData, "requirementId"),
    status: readOptionalComplianceFormField(formData, "status"),
    reviewNotes: readOptionalComplianceFormField(formData, "reviewNotes"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await updateHrEmployeeLaborLawRequirementStatusInTx(db, {
      organizationId: organization.id,
      requirementId: parsed.data.requirementId,
      status: parsed.data.status,
      reviewNotes: parsed.data.reviewNotes ?? null,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.laborLaw.statusUpdated,
      targetId: result.requirementId,
      metadata: { status: parsed.data.status },
    };
  });
}

export async function ensureHrWorkEligibilityTrackingAction(
  _previous: ActionResult | undefined,
  _formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = ensureHrWorkEligibilityTrackingFormSchema.safeParse({});

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await ensureHrWorkEligibilityTrackingInTx(db, {
      organizationId: organization.id,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.workEligibility.ensured,
      targetId: organization.id,
      metadata: result,
    };
  });
}

export async function updateHrWorkEligibilityAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = updateHrWorkEligibilityFormSchema.safeParse({
    workEligibilityId: readOptionalComplianceFormField(formData, "workEligibilityId"),
    status: readOptionalComplianceFormField(formData, "status"),
    expiresAt: readOptionalComplianceFormField(formData, "expiresAt"),
    reviewNotes: readOptionalComplianceFormField(formData, "reviewNotes"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await updateHrWorkEligibilityStatusInTx(db, {
      organizationId: organization.id,
      workEligibilityId: parsed.data.workEligibilityId,
      status: parsed.data.status,
      expiresAt: parsed.data.expiresAt ?? null,
      reviewNotes: parsed.data.reviewNotes ?? null,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.workEligibility.statusUpdated,
      targetId: result.workEligibilityId,
      metadata: { status: parsed.data.status },
    };
  });
}
