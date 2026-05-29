"use server";

import {
  archiveHrComplianceObligationInTx,
  assignHrComplianceCorrectiveActionInTx,
  createHrComplianceExceptionInTx,
  ensureHrWorkAuthorizationDocumentsInTx,
  ensureHrWorkEligibilityTrackingInTx,
  HrComplianceCommandError,
  HR_COMPLIANCE_FILING_REQUIREMENT_KIND,
  HR_COMPLIANCE_LABOR_LAW_REQUIREMENT_KIND,
  HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND,
  HR_COMPLIANCE_STATUTORY_REQUIREMENT_KIND,
  HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND,
  HR_COMPLIANCE_REPORT_KINDS,
  isSafetyTrainingRequirementKind,
  linkHrComplianceEvidenceInTx,
  unlinkHrComplianceEvidenceInTx,
  updateHrComplianceEvidenceSubmissionStateInTx,
  loadHrComplianceEvidenceLinkAccessScopeInTx,
  loadHrEmployeeDocumentClassificationInTx,
  resolveHrComplianceExceptionInTx,
  syncHrEmployeeLaborLawRequirementsInTx,
  syncHrEmployeePolicyAcknowledgementsInTx,
  syncHrEmployeeStatutoryRequirementsInTx,
  syncHrComplianceFilingsInTx,
  syncHrEmployeeSafetyTrainingRequirementsInTx,
  syncHrEmployeeWorkplaceSafetyRequirementsInTx,
  updateHrComplianceCorrectiveActionProgressInTx,
  updateHrEmployeeLaborLawRequirementStatusInTx,
  updateHrEmployeePolicyAcknowledgementStatusInTx,
  updateHrEmployeeStatutoryRequirementStatusInTx,
  updateHrComplianceFilingInTx,
  updateHrEmployeeSafetyTrainingRequirementStatusInTx,
  updateHrEmployeeWorkplaceSafetyRequirementStatusInTx,
  updateHrWorkAuthorizationDocumentInTx,
  updateHrWorkEligibilityStatusInTx,
  upsertHrComplianceObligationInTx,
  waiveHrComplianceExceptionInTx,
  runWithOrganizationContext,
  type AfendaTransaction,
} from "@afenda/db";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { type ActionResult, actionSuccess, zodActionFailure } from "@afenda/governed-surface/schemas";

import { hrWorkforceComplianceAuditActions } from "../events/hr.workforce.compliance.event";
import { requireHrComplianceRead, requireHrComplianceWrite, requireHrComplianceSensitiveWrite } from "../policies/hr.workforce.compliance-access.policy.server";
import { isHrSensitiveDocumentClassification, isHrComplianceSensitiveRecordKind } from "../data/hr.workforce.compliance-sensitive-access.shared";
import { HrComplianceSensitiveAccessError } from "../data/hr.workforce.compliance-org-scope.shared";
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
import {
  parseUpdateHrComplianceFilingForm,
  syncHrComplianceFilingsFormSchema,
} from "../schemas/hr.workforce.compliance-filing.schema";
import {
  parseUpdateHrEmployeeLaborLawRequirementForm,
  syncHrEmployeeLaborLawRequirementsFormSchema,
} from "../schemas/hr.workforce.compliance-labor-law.schema";
import {
  parseUpdateHrEmployeeStatutoryRequirementForm,
  syncHrEmployeeStatutoryRequirementsFormSchema,
} from "../schemas/hr.workforce.compliance-statutory.schema";
import {
  parseUpdateHrEmployeePolicyAcknowledgementForm,
  syncHrEmployeePolicyAcknowledgementsFormSchema,
} from "../schemas/hr.workforce.compliance-policy-acknowledgement.schema";
import {
  parseUpdateHrEmployeeSafetyTrainingRequirementForm,
  syncHrEmployeeSafetyTrainingRequirementsFormSchema,
} from "../schemas/hr.workforce.compliance-safety-training.schema";
import {
  parseUpdateHrEmployeeWorkplaceSafetyRequirementForm,
  syncHrEmployeeWorkplaceSafetyRequirementsFormSchema,
} from "../schemas/hr.workforce.compliance-workplace-safety.schema";
import {
  ensureHrWorkEligibilityTrackingFormSchema,
  parseUpdateHrWorkEligibilityForm,
} from "../schemas/hr.workforce.compliance-work-eligibility.schema";
import {
  ensureHrWorkAuthorizationDocumentsFormSchema,
  parseUpdateHrWorkAuthorizationDocumentForm,
} from "../schemas/hr.workforce.compliance-work-auth-documents.schema";
import {
  parseLinkHrComplianceEvidenceForm,
  parseUnlinkHrComplianceEvidenceForm,
  parseUpdateHrComplianceEvidenceSubmissionStateForm,
} from "../schemas/hr.workforce.compliance-evidence-link.schema";
import { parseDecideHrComplianceReviewQueueItemForm } from "../schemas/hr.workforce.compliance-review-queue.schema";
import { readOptionalComplianceFormField } from "../schemas/hr.workforce.compliance-form.shared";
import {
  buildRequirementStatusAuditMetadata,
  buildComplianceStatusUpdateAuditMetadata,
  finalizeComplianceMutation,
  resolveCertificationExpiresAtMutationInput,
  resolveFilingDeadlineMutationInput,
  toComplianceActionFailure,
} from "./hr.workforce.compliance.mutation.shared.server";
import { buildHrComplianceReportCsv } from "../data/hr.workforce.compliance.reports.shared.server";
import { z } from "zod";

async function assertComplianceEvidenceMutationAuthorized(input: {
  organizationId: string;
  canViewSensitive: boolean;
  db: AfendaTransaction;
  recordKind: string;
  employeeDocumentId?: string;
  evidenceLinkId?: string;
}) {
  let recordKind = input.recordKind;
  let documentClassification = "internal";

  if (input.evidenceLinkId) {
    const scope = await loadHrComplianceEvidenceLinkAccessScopeInTx(input.db, {
      organizationId: input.organizationId,
      evidenceLinkId: input.evidenceLinkId,
    });
    if (!scope) {
      throw new HrComplianceCommandError("evidence_link_not_found");
    }
    recordKind = scope.recordKind;
    documentClassification = scope.documentClassification;
  } else if (input.employeeDocumentId) {
    documentClassification =
      (await loadHrEmployeeDocumentClassificationInTx(input.db, {
        organizationId: input.organizationId,
        employeeDocumentId: input.employeeDocumentId,
      })) ?? "internal";
  }

  if (
    !input.canViewSensitive &&
    (isHrComplianceSensitiveRecordKind(recordKind) ||
      isHrSensitiveDocumentClassification(documentClassification))
  ) {
    throw new HrComplianceSensitiveAccessError();
  }
}

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

    if (parsed.data.requirementKind === HR_COMPLIANCE_STATUTORY_REQUIREMENT_KIND) {
      await syncHrEmployeeStatutoryRequirementsInTx(db, {
        organizationId: organization.id,
      });
    }

    if (
      parsed.data.requirementKind ===
      HR_COMPLIANCE_POLICY_ACKNOWLEDGEMENT_REQUIREMENT_KIND
    ) {
      await syncHrEmployeePolicyAcknowledgementsInTx(db, {
        organizationId: organization.id,
      });
    }

    if (parsed.data.requirementKind === HR_COMPLIANCE_FILING_REQUIREMENT_KIND) {
      await syncHrComplianceFilingsInTx(db, {
        organizationId: organization.id,
      });
    }

    if (
      parsed.data.requirementKind === HR_COMPLIANCE_WORKPLACE_SAFETY_REQUIREMENT_KIND
    ) {
      await syncHrEmployeeWorkplaceSafetyRequirementsInTx(db, {
        organizationId: organization.id,
      });
    }

    if (isSafetyTrainingRequirementKind(parsed.data.requirementKind)) {
      await syncHrEmployeeSafetyTrainingRequirementsInTx(db, {
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

    await Promise.all([
      syncHrComplianceFilingsInTx(db, {
        organizationId: organization.id,
      }),
      syncHrEmployeePolicyAcknowledgementsInTx(db, {
        organizationId: organization.id,
      }),
      syncHrEmployeeLaborLawRequirementsInTx(db, {
        organizationId: organization.id,
      }),
      syncHrEmployeeStatutoryRequirementsInTx(db, {
        organizationId: organization.id,
      }),
      syncHrEmployeeWorkplaceSafetyRequirementsInTx(db, {
        organizationId: organization.id,
      }),
      syncHrEmployeeSafetyTrainingRequirementsInTx(db, {
        organizationId: organization.id,
      }),
    ]);

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
    correctiveActionOwnerEmployeeId: readOptionalComplianceFormField(
      formData,
      "correctiveActionOwnerEmployeeId",
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
      correctiveActionOwnerEmployeeId:
        parsed.data.correctiveActionOwnerEmployeeId ?? null,
      correctiveActionDueDate: parsed.data.correctiveActionDueDate ?? null,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.exception.created,
      targetId: result.exceptionId,
      metadata: {
        title: parsed.data.title,
        complianceArea: parsed.data.complianceArea,
        itemType: parsed.data.itemType,
        severity: parsed.data.severity,
        employeeId: parsed.data.employeeId ?? null,
      },
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
    correctiveActionOwnerEmployeeId: readOptionalComplianceFormField(
      formData,
      "correctiveActionOwnerEmployeeId",
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
      correctiveActionOwnerEmployeeId:
        parsed.data.correctiveActionOwnerEmployeeId,
      correctiveActionDueDate: parsed.data.correctiveActionDueDate,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action:
        hrWorkforceComplianceAuditActions.exception.correctiveActionAssigned,
      targetId: parsed.data.exceptionId,
      metadata: {
        correctiveActionOwnerEmployeeId:
          parsed.data.correctiveActionOwnerEmployeeId,
        correctiveActionDueDate:
          parsed.data.correctiveActionDueDate.toISOString(),
      },
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
      metadata: {
        progressNote: parsed.data.progressNote,
      },
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
      metadata: {
        resolutionNote: parsed.data.resolutionNote ?? null,
      },
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
      reason: parsed.data.waiverReason,
      metadata: {
        waiverReason: parsed.data.waiverReason,
        approvalReference: parsed.data.approvalReference,
      },
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
  const parsed = parseUpdateHrEmployeeLaborLawRequirementForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await updateHrEmployeeLaborLawRequirementStatusInTx(db, {
      organizationId: organization.id,
      requirementId: parsed.data.requirementId,
      status: parsed.data.status,
      reviewNotes: parsed.data.reviewNotes,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.laborLaw.statusUpdated,
      targetId: result.requirementId,
      metadata: buildComplianceStatusUpdateAuditMetadata({
        status: parsed.data.status,
        reviewNotes: parsed.data.reviewNotes,
        includeReviewNotes: formData.has("reviewNotes"),
      }),
    };
  });
}

export async function syncHrEmployeeStatutoryRequirementsAction(
  _previous: ActionResult | undefined,
  _formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = syncHrEmployeeStatutoryRequirementsFormSchema.safeParse({});

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await syncHrEmployeeStatutoryRequirementsInTx(db, {
      organizationId: organization.id,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.statutory.synced,
      targetId: organization.id,
      metadata: result,
    };
  });
}

export async function updateHrEmployeeStatutoryRequirementAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = parseUpdateHrEmployeeStatutoryRequirementForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await updateHrEmployeeStatutoryRequirementStatusInTx(db, {
      organizationId: organization.id,
      requirementId: parsed.data.requirementId,
      status: parsed.data.status,
      reviewNotes: parsed.data.reviewNotes,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.statutory.statusUpdated,
      targetId: result.requirementId,
      metadata: buildComplianceStatusUpdateAuditMetadata({
        status: parsed.data.status,
        reviewNotes: parsed.data.reviewNotes,
        includeReviewNotes: formData.has("reviewNotes"),
      }),
    };
  });
}

export async function syncHrEmployeePolicyAcknowledgementsAction(
  _previous: ActionResult | undefined,
  _formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = syncHrEmployeePolicyAcknowledgementsFormSchema.safeParse({});

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await syncHrEmployeePolicyAcknowledgementsInTx(db, {
      organizationId: organization.id,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.policyAcknowledgement.synced,
      targetId: organization.id,
      metadata: result,
    };
  });
}

export async function updateHrEmployeePolicyAcknowledgementAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = parseUpdateHrEmployeePolicyAcknowledgementForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await updateHrEmployeePolicyAcknowledgementStatusInTx(db, {
      organizationId: organization.id,
      requirementId: parsed.data.requirementId,
      status: parsed.data.status,
      reviewNotes: parsed.data.reviewNotes,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.policyAcknowledgement.statusUpdated,
      targetId: result.requirementId,
      metadata: buildComplianceStatusUpdateAuditMetadata({
        status: parsed.data.status,
        reviewNotes: parsed.data.reviewNotes,
        includeReviewNotes: formData.has("reviewNotes"),
      }),
    };
  });
}

export async function syncHrEmployeeWorkplaceSafetyRequirementsAction(
  _previous: ActionResult | undefined,
  _formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = syncHrEmployeeWorkplaceSafetyRequirementsFormSchema.safeParse({});

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await syncHrEmployeeWorkplaceSafetyRequirementsInTx(db, {
      organizationId: organization.id,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.workplaceSafety.synced,
      targetId: organization.id,
      metadata: result,
    };
  });
}

export async function updateHrEmployeeWorkplaceSafetyRequirementAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = parseUpdateHrEmployeeWorkplaceSafetyRequirementForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const certificationExpiresAt = resolveCertificationExpiresAtMutationInput(
      formData,
      parsed.data.certificationExpiresAt,
    );

    const result = await updateHrEmployeeWorkplaceSafetyRequirementStatusInTx(db, {
      organizationId: organization.id,
      requirementId: parsed.data.requirementId,
      status: parsed.data.status,
      reviewNotes: parsed.data.reviewNotes,
      ...(certificationExpiresAt !== undefined ? { certificationExpiresAt } : {}),
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.workplaceSafety.statusUpdated,
      targetId: result.requirementId,
      metadata: buildRequirementStatusAuditMetadata({
        status: parsed.data.status,
        certificationExpiresAt: parsed.data.certificationExpiresAt,
        includeCertificationExpiry: formData.has("certificationExpiresAt"),
        reviewNotes: parsed.data.reviewNotes,
        includeReviewNotes: formData.has("reviewNotes"),
      }),
    };
  });
}

export async function syncHrEmployeeSafetyTrainingRequirementsAction(
  _previous: ActionResult | undefined,
  _formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = syncHrEmployeeSafetyTrainingRequirementsFormSchema.safeParse({});

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await syncHrEmployeeSafetyTrainingRequirementsInTx(db, {
      organizationId: organization.id,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.safetyTraining.synced,
      targetId: organization.id,
      metadata: result,
    };
  });
}

export async function updateHrEmployeeSafetyTrainingRequirementAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = parseUpdateHrEmployeeSafetyTrainingRequirementForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const certificationExpiresAt = resolveCertificationExpiresAtMutationInput(
      formData,
      parsed.data.certificationExpiresAt,
    );

    const result = await updateHrEmployeeSafetyTrainingRequirementStatusInTx(db, {
      organizationId: organization.id,
      requirementId: parsed.data.requirementId,
      status: parsed.data.status,
      reviewNotes: parsed.data.reviewNotes,
      ...(certificationExpiresAt !== undefined ? { certificationExpiresAt } : {}),
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.safetyTraining.statusUpdated,
      targetId: result.requirementId,
      metadata: buildRequirementStatusAuditMetadata({
        status: parsed.data.status,
        certificationExpiresAt: parsed.data.certificationExpiresAt,
        includeCertificationExpiry: formData.has("certificationExpiresAt"),
        reviewNotes: parsed.data.reviewNotes,
        includeReviewNotes: formData.has("reviewNotes"),
      }),
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
  const { session, organization } = await requireHrComplianceSensitiveWrite();
  const parsed = parseUpdateHrWorkEligibilityForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await updateHrWorkEligibilityStatusInTx(db, {
      organizationId: organization.id,
      workEligibilityId: parsed.data.workEligibilityId,
      status: parsed.data.status,
      expiresAt: parsed.data.expiresAt,
      reviewNotes: parsed.data.reviewNotes,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.workEligibility.statusUpdated,
      targetId: result.workEligibilityId,
      metadata: buildComplianceStatusUpdateAuditMetadata({
        status: parsed.data.status,
        reviewNotes: parsed.data.reviewNotes,
        includeReviewNotes: formData.has("reviewNotes"),
      }),
    };
  });
}

export async function ensureHrWorkAuthorizationDocumentsAction(
  _previous: ActionResult | undefined,
  _formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = ensureHrWorkAuthorizationDocumentsFormSchema.safeParse({});

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await ensureHrWorkAuthorizationDocumentsInTx(db, {
      organizationId: organization.id,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.workAuthDocuments.ensured,
      targetId: organization.id,
      metadata: result,
    };
  });
}

export async function updateHrWorkAuthorizationDocumentAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceSensitiveWrite();
  const parsed = parseUpdateHrWorkAuthorizationDocumentForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await updateHrWorkAuthorizationDocumentInTx(db, {
      organizationId: organization.id,
      workAuthDocumentId: parsed.data.workAuthDocumentId,
      status: parsed.data.status,
      documentNumber: parsed.data.documentNumber,
      issuedAt: parsed.data.issuedAt,
      expiresAt: parsed.data.expiresAt,
      reviewNotes: parsed.data.reviewNotes,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.workAuthDocuments.statusUpdated,
      targetId: result.workAuthDocumentId,
      metadata: buildComplianceStatusUpdateAuditMetadata({
        status: result.status,
        reviewNotes: parsed.data.reviewNotes,
        includeReviewNotes: formData.has("reviewNotes"),
      }),
    };
  });
}

export async function syncHrComplianceFilingsAction(
  _previous: ActionResult | undefined,
  _formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = syncHrComplianceFilingsFormSchema.safeParse({});

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await syncHrComplianceFilingsInTx(db, {
      organizationId: organization.id,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.filing.synced,
      targetId: organization.id,
      metadata: result,
    };
  });
}

export async function updateHrComplianceFilingAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrComplianceWrite();
  const parsed = parseUpdateHrComplianceFilingForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  return finalizeComplianceMutation(organization.id, async (db) => {
    const filingDeadline = resolveFilingDeadlineMutationInput(
      formData,
      parsed.data.filingDeadline,
    );

    const result = await updateHrComplianceFilingInTx(db, {
      organizationId: organization.id,
      filingId: parsed.data.filingId,
      status: parsed.data.status,
      reviewNotes: parsed.data.reviewNotes,
      ...(filingDeadline !== undefined ? { filingDeadline } : {}),
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.filing.statusUpdated,
      targetId: result.filingId,
      metadata: buildComplianceStatusUpdateAuditMetadata({
        status: parsed.data.status,
        reviewNotes: parsed.data.reviewNotes,
        includeReviewNotes: formData.has("reviewNotes"),
        filingDeadline,
        includeFilingDeadline: filingDeadline !== undefined,
      }),
    };
  });
}

export async function linkHrComplianceEvidenceAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrComplianceWrite();
  const parsed = parseLinkHrComplianceEvidenceForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    await runWithOrganizationContext(guard.organization.id, async (db) => {
      await assertComplianceEvidenceMutationAuthorized({
        organizationId: guard.organization.id,
        canViewSensitive: guard.canViewSensitive,
        db,
        recordKind: parsed.data.recordKind,
        employeeDocumentId: parsed.data.employeeDocumentId,
      });
    });
  } catch (error) {
    return toComplianceActionFailure(error);
  }

  const { session, organization } = guard;

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await linkHrComplianceEvidenceInTx(db, {
      organizationId: organization.id,
      recordKind: parsed.data.recordKind,
      recordId: parsed.data.recordId,
      employeeDocumentId: parsed.data.employeeDocumentId,
      notes: parsed.data.notes,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.evidence.linked,
      targetId: result.evidenceLinkId,
      metadata: {
        recordKind: parsed.data.recordKind,
        recordId: parsed.data.recordId,
        employeeDocumentId: parsed.data.employeeDocumentId,
      },
    };
  });
}

export async function unlinkHrComplianceEvidenceAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrComplianceWrite();
  const parsed = parseUnlinkHrComplianceEvidenceForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    await runWithOrganizationContext(guard.organization.id, async (db) => {
      await assertComplianceEvidenceMutationAuthorized({
        organizationId: guard.organization.id,
        canViewSensitive: guard.canViewSensitive,
        db,
        recordKind: "filing",
        evidenceLinkId: parsed.data.evidenceLinkId,
      });
    });
  } catch (error) {
    return toComplianceActionFailure(error);
  }

  const { session, organization } = guard;

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await unlinkHrComplianceEvidenceInTx(db, {
      organizationId: organization.id,
      evidenceLinkId: parsed.data.evidenceLinkId,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.evidence.unlinked,
      targetId: result.evidenceLinkId,
    };
  });
}

export async function updateHrComplianceEvidenceSubmissionStateAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await requireHrComplianceWrite();
  const parsed = parseUpdateHrComplianceEvidenceSubmissionStateForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    await runWithOrganizationContext(guard.organization.id, async (db) => {
      await assertComplianceEvidenceMutationAuthorized({
        organizationId: guard.organization.id,
        canViewSensitive: guard.canViewSensitive,
        db,
        recordKind: "filing",
        evidenceLinkId: parsed.data.evidenceLinkId,
      });
    });
  } catch (error) {
    return toComplianceActionFailure(error);
  }

  const { session, organization } = guard;

  return finalizeComplianceMutation(organization.id, async (db) => {
    const result = await updateHrComplianceEvidenceSubmissionStateInTx(db, {
      organizationId: organization.id,
      evidenceLinkId: parsed.data.evidenceLinkId,
      submissionState: parsed.data.submissionState,
      notes: parsed.data.notes,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrWorkforceComplianceAuditActions.evidence.submissionUpdated,
      targetId: result.evidenceLinkId,
      metadata: { submissionState: parsed.data.submissionState },
    };
  });
}

export async function decideHrComplianceReviewQueueItemAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseDecideHrComplianceReviewQueueItemForm(formData);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const { entryKind, sourceRecordId, decision, reviewNotes } = parsed.data;
  const guard =
    entryKind === "filing_confirmation"
      ? await requireHrComplianceWrite()
      : entryKind === "evidence_acknowledgment"
        ? await requireHrComplianceWrite()
        : await requireHrComplianceSensitiveWrite();

  if (entryKind === "evidence_acknowledgment") {
    try {
      await runWithOrganizationContext(guard.organization.id, async (db) => {
        await assertComplianceEvidenceMutationAuthorized({
          organizationId: guard.organization.id,
          canViewSensitive: guard.canViewSensitive,
          db,
          recordKind: "filing",
          evidenceLinkId: sourceRecordId,
        });
      });
    } catch (error) {
      return toComplianceActionFailure(error);
    }
  }

  const { session, organization } = guard;

  return finalizeComplianceMutation(organization.id, async (db) => {
    if (entryKind === "evidence_acknowledgment") {
      await assertComplianceEvidenceMutationAuthorized({
        organizationId: organization.id,
        canViewSensitive: guard.canViewSensitive,
        db,
        recordKind: "filing",
        evidenceLinkId: sourceRecordId,
      });
    }

    let targetId = sourceRecordId;
    let resultingStatus: string = decision;

    switch (entryKind) {
      case "filing_confirmation": {
        const status = decision === "approve" ? "confirmed" : "pending";
        const result = await updateHrComplianceFilingInTx(db, {
          organizationId: organization.id,
          filingId: sourceRecordId,
          status,
          reviewNotes,
        });
        targetId = result.filingId;
        resultingStatus = status;
        break;
      }
      case "work_eligibility_verification": {
        const status = decision === "approve" ? "eligible" : "ineligible";
        const result = await updateHrWorkEligibilityStatusInTx(db, {
          organizationId: organization.id,
          workEligibilityId: sourceRecordId,
          status,
          reviewNotes,
        });
        targetId = result.workEligibilityId;
        resultingStatus = status;
        break;
      }
      case "work_auth_verification": {
        const status = decision === "approve" ? "verified" : "rejected";
        const result = await updateHrWorkAuthorizationDocumentInTx(db, {
          organizationId: organization.id,
          workAuthDocumentId: sourceRecordId,
          status,
          reviewNotes,
        });
        targetId = result.workAuthDocumentId;
        resultingStatus = result.status;
        break;
      }
      case "evidence_acknowledgment": {
        const submissionState = decision === "approve" ? "acknowledged" : "draft";
        const result = await updateHrComplianceEvidenceSubmissionStateInTx(db, {
          organizationId: organization.id,
          evidenceLinkId: sourceRecordId,
          submissionState,
          notes: reviewNotes,
        });
        targetId = result.evidenceLinkId;
        resultingStatus = submissionState;
        break;
      }
      default:
        throw new HrComplianceCommandError("evidence_source_not_found");
    }

    return {
      organizationId: organization.id,
      actorId: session.id,
      action:
        decision === "approve"
          ? hrWorkforceComplianceAuditActions.reviewQueue.approved
          : hrWorkforceComplianceAuditActions.reviewQueue.rejected,
      targetId,
      summary: `${entryKind} ${decision}`,
      metadata: buildComplianceStatusUpdateAuditMetadata({
        status: resultingStatus,
        reviewNotes,
        includeReviewNotes: reviewNotes !== undefined,
      }),
    };
  });
}

const exportHrComplianceReportFormSchema = z.object({
  reportKind: z.enum(HR_COMPLIANCE_REPORT_KINDS),
});

export async function exportHrComplianceReportAction(
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof buildHrComplianceReportCsv>>>> {
  const { session, organization, canViewSensitive } = await requireHrComplianceRead();
  const parsed = exportHrComplianceReportFormSchema.safeParse({
    reportKind: readOptionalComplianceFormField(formData, "reportKind"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const exportBody = await buildHrComplianceReportCsv({
      reportKind: parsed.data.reportKind,
      organizationId: organization.id,
      canViewSensitive,
    });

    await runWithOrganizationContext(organization.id, async (db) => {
      await writeExecutionAuditEventInTransaction(db, {
        organizationId: organization.id,
        actorId: session.id,
        actorType: "user",
        action: hrWorkforceComplianceAuditActions.reports.exported,
        targetType: "hr_compliance",
        targetId: organization.id,
        metadata: {
          reportKind: parsed.data.reportKind,
          rowCount: exportBody.rowCount,
        },
      });
    });

    return actionSuccess(exportBody);
  } catch (error) {
    return toComplianceActionFailure(error) as ActionResult<
      Awaited<ReturnType<typeof buildHrComplianceReportCsv>>
    >;
  }
}
