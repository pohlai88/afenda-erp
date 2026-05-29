"use server";

import {
  archiveHrComplianceObligation,
  assignHrComplianceCorrectiveAction,
  createHrComplianceException,
  HrComplianceCommandError,
  resolveHrComplianceException,
  updateHrComplianceCorrectiveActionProgress,
  upsertHrComplianceObligation,
  waiveHrComplianceException,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  actionFailure,
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";
import { hrComplianceAuditActions } from "../events/hr-compliance.event";
import { requireHrComplianceWrite } from "../policies/hr-compliance.policy.server";
import {
  hrArchiveComplianceObligationActionSchema,
  hrAssignComplianceCorrectiveActionActionSchema,
  hrCreateComplianceExceptionActionSchema,
  hrResolveComplianceExceptionActionSchema,
  hrUpdateComplianceCorrectiveActionProgressActionSchema,
  hrUpsertComplianceObligationActionSchema,
  hrWaiveComplianceExceptionActionSchema,
} from "../schemas/hr-compliance-mutation.schema";

function revalidateHrCompliance() {
  revalidatePath("/hr/compliance");
}

function mapCommandError(error: unknown): ActionResult<never> {
  if (error instanceof HrComplianceCommandError) {
    return actionFailure(error.message, undefined, error.code);
  }
  return actionFailure(
    error instanceof Error ? error.message : "HR compliance mutation failed.",
    undefined,
    "unknown",
  );
}

export async function upsertHrComplianceObligationAction(
  formData: FormData,
): Promise<ActionResult<{ obligationId: string }>> {
  const { context } = await requireHrComplianceWrite();

  const parsed = hrUpsertComplianceObligationActionSchema.safeParse({
    code: formData.get("code"),
    title: formData.get("title"),
    complianceArea: formData.get("complianceArea"),
    requirementKind: formData.get("requirementKind"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await upsertHrComplianceObligation({
      organizationId: context.organizationId,
      code: parsed.data.code,
      title: parsed.data.title,
      complianceArea: parsed.data.complianceArea,
      requirementKind: parsed.data.requirementKind,
      description: parsed.data.description,
      dueDate: parsed.data.dueDate,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrComplianceAuditActions.upsertObligation,
      targetType: "hr_compliance_obligation",
      targetId: result.obligationId,
      metadata: { code: parsed.data.code },
    });

    revalidateHrCompliance();
    return actionSuccess({ obligationId: result.obligationId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function archiveHrComplianceObligationAction(
  formData: FormData,
): Promise<ActionResult<{ obligationId: string }>> {
  const { context } = await requireHrComplianceWrite();

  const parsed = hrArchiveComplianceObligationActionSchema.safeParse({
    obligationId: formData.get("obligationId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await archiveHrComplianceObligation({
      organizationId: context.organizationId,
      obligationId: parsed.data.obligationId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrComplianceAuditActions.archiveObligation,
      targetType: "hr_compliance_obligation",
      targetId: result.obligationId,
    });

    revalidateHrCompliance();
    return actionSuccess({ obligationId: result.obligationId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function createHrComplianceExceptionAction(
  formData: FormData,
): Promise<ActionResult<{ exceptionId: string }>> {
  const { context } = await requireHrComplianceWrite();

  const employeeIdRaw = formData.get("employeeId");
  const correctiveDueRaw = formData.get("correctiveActionDueDate");
  const parsed = hrCreateComplianceExceptionActionSchema.safeParse({
    title: formData.get("title"),
    complianceArea: formData.get("complianceArea"),
    itemType: formData.get("itemType"),
    severity: formData.get("severity") || undefined,
    employeeId:
      typeof employeeIdRaw === "string" && employeeIdRaw.length > 0
        ? employeeIdRaw
        : undefined,
    correctiveActionDescription:
      formData.get("correctiveActionDescription") || undefined,
    correctiveActionDueDate:
      typeof correctiveDueRaw === "string" && correctiveDueRaw.length > 0
        ? correctiveDueRaw
        : undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await createHrComplianceException({
      organizationId: context.organizationId,
      title: parsed.data.title,
      complianceArea: parsed.data.complianceArea,
      itemType: parsed.data.itemType,
      severity: parsed.data.severity,
      employeeId: parsed.data.employeeId,
      correctiveActionDescription: parsed.data.correctiveActionDescription,
      correctiveActionDueDate: parsed.data.correctiveActionDueDate,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrComplianceAuditActions.createException,
      targetType: "hr_compliance_exception",
      targetId: result.exceptionId,
    });

    revalidateHrCompliance();
    return actionSuccess({ exceptionId: result.exceptionId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function resolveHrComplianceExceptionAction(
  formData: FormData,
): Promise<ActionResult<{ exceptionId: string }>> {
  const { context } = await requireHrComplianceWrite();

  const parsed = hrResolveComplianceExceptionActionSchema.safeParse({
    exceptionId: formData.get("exceptionId"),
    resolutionNote: formData.get("resolutionNote") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await resolveHrComplianceException({
      organizationId: context.organizationId,
      exceptionId: parsed.data.exceptionId,
      resolutionNote: parsed.data.resolutionNote,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrComplianceAuditActions.resolveException,
      targetType: "hr_compliance_exception",
      targetId: result.exceptionId,
    });

    revalidateHrCompliance();
    return actionSuccess({ exceptionId: result.exceptionId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function assignHrComplianceCorrectiveActionAction(
  formData: FormData,
): Promise<ActionResult<{ exceptionId: string }>> {
  const { context } = await requireHrComplianceWrite();

  const parsed = hrAssignComplianceCorrectiveActionActionSchema.safeParse({
    exceptionId: formData.get("exceptionId"),
    correctiveActionDescription: formData.get("correctiveActionDescription"),
    correctiveActionDueDate: formData.get("correctiveActionDueDate"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await assignHrComplianceCorrectiveAction({
      organizationId: context.organizationId,
      exceptionId: parsed.data.exceptionId,
      correctiveActionDescription: parsed.data.correctiveActionDescription,
      correctiveActionDueDate: parsed.data.correctiveActionDueDate,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrComplianceAuditActions.assignCorrectiveAction,
      targetType: "hr_compliance_exception",
      targetId: result.exceptionId,
    });

    revalidateHrCompliance();
    return actionSuccess({ exceptionId: result.exceptionId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function updateHrComplianceCorrectiveActionProgressAction(
  formData: FormData,
): Promise<ActionResult<{ exceptionId: string }>> {
  const { context } = await requireHrComplianceWrite();

  const parsed =
    hrUpdateComplianceCorrectiveActionProgressActionSchema.safeParse({
      exceptionId: formData.get("exceptionId"),
      progressNote: formData.get("progressNote"),
    });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await updateHrComplianceCorrectiveActionProgress({
      organizationId: context.organizationId,
      exceptionId: parsed.data.exceptionId,
      progressNote: parsed.data.progressNote,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrComplianceAuditActions.updateCorrectiveActionProgress,
      targetType: "hr_compliance_exception",
      targetId: result.exceptionId,
    });

    revalidateHrCompliance();
    return actionSuccess({ exceptionId: result.exceptionId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function waiveHrComplianceExceptionAction(
  formData: FormData,
): Promise<ActionResult<{ exceptionId: string }>> {
  const { context } = await requireHrComplianceWrite();

  const parsed = hrWaiveComplianceExceptionActionSchema.safeParse({
    exceptionId: formData.get("exceptionId"),
    waiverReason: formData.get("waiverReason"),
    approvalReference: formData.get("approvalReference"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await waiveHrComplianceException({
      organizationId: context.organizationId,
      exceptionId: parsed.data.exceptionId,
      waiverReason: parsed.data.waiverReason,
      approvalReference: parsed.data.approvalReference,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrComplianceAuditActions.waiveException,
      targetType: "hr_compliance_exception",
      targetId: result.exceptionId,
      metadata: { approvalReference: parsed.data.approvalReference },
    });

    revalidateHrCompliance();
    return actionSuccess({ exceptionId: result.exceptionId });
  } catch (error) {
    return mapCommandError(error);
  }
}
