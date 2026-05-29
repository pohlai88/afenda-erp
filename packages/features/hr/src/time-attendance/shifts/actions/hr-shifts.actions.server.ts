"use server";

import {
  archiveHrShiftTemplate,
  cancelHrShiftAssignment,
  createHrShiftTemplate,
  HrShiftCommandError,
  publishHrShiftAssignment,
  scheduleHrShiftAssignment,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  actionFailure,
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";
import { hrShiftsAuditActions } from "../events/hr-shifts.event";
import { requireHrShiftsWrite } from "../policies/hr-shifts.policy.server";
import {
  hrArchiveShiftTemplateActionSchema,
  hrCreateShiftTemplateActionSchema,
  hrScheduleShiftAssignmentActionSchema,
  hrShiftAssignmentIdActionSchema,
} from "../schemas/hr-shifts-mutation.schema";

function revalidateHrShifts() {
  revalidatePath("/hr/shifts");
}

function mapCommandError(error: unknown): ActionResult<never> {
  if (error instanceof HrShiftCommandError) {
    return actionFailure(error.message, undefined, error.code);
  }
  return actionFailure(
    error instanceof Error ? error.message : "HR shifts mutation failed.",
    undefined,
    "unknown",
  );
}

function toUtcDayStart(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

export async function createHrShiftTemplateAction(
  formData: FormData,
): Promise<ActionResult<{ templateId: string }>> {
  const { context } = await requireHrShiftsWrite();

  const parsed = hrCreateShiftTemplateActionSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await createHrShiftTemplate({
      organizationId: context.organizationId,
      ...parsed.data,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrShiftsAuditActions.createTemplate,
      targetType: "hr_shift_template",
      targetId: result.templateId,
    });

    revalidateHrShifts();
    return actionSuccess({ templateId: result.templateId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function archiveHrShiftTemplateAction(
  formData: FormData,
): Promise<ActionResult<{ templateId: string }>> {
  const { context } = await requireHrShiftsWrite();

  const parsed = hrArchiveShiftTemplateActionSchema.safeParse({
    templateId: formData.get("templateId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await archiveHrShiftTemplate({
      organizationId: context.organizationId,
      templateId: parsed.data.templateId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrShiftsAuditActions.archiveTemplate,
      targetType: "hr_shift_template",
      targetId: result.templateId,
    });

    revalidateHrShifts();
    return actionSuccess({ templateId: result.templateId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function scheduleHrShiftAssignmentAction(
  formData: FormData,
): Promise<ActionResult<{ assignmentId: string }>> {
  const { context } = await requireHrShiftsWrite();

  const parsed = hrScheduleShiftAssignmentActionSchema.safeParse({
    employeeId: formData.get("employeeId"),
    templateId: formData.get("templateId"),
    shiftDate: formData.get("shiftDate"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await scheduleHrShiftAssignment({
      organizationId: context.organizationId,
      employeeId: parsed.data.employeeId,
      templateId: parsed.data.templateId,
      shiftDate: toUtcDayStart(parsed.data.shiftDate),
      notes: parsed.data.notes,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrShiftsAuditActions.schedule,
      targetType: "hr_shift_assignment",
      targetId: result.assignmentId,
      metadata: {
        employeeId: parsed.data.employeeId,
        templateId: parsed.data.templateId,
      },
    });

    revalidateHrShifts();
    return actionSuccess({ assignmentId: result.assignmentId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function publishHrShiftAssignmentAction(
  formData: FormData,
): Promise<ActionResult<{ assignmentId: string }>> {
  const { context } = await requireHrShiftsWrite();

  const parsed = hrShiftAssignmentIdActionSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await publishHrShiftAssignment({
      organizationId: context.organizationId,
      assignmentId: parsed.data.assignmentId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrShiftsAuditActions.publish,
      targetType: "hr_shift_assignment",
      targetId: result.assignmentId,
    });

    revalidateHrShifts();
    return actionSuccess({ assignmentId: result.assignmentId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function cancelHrShiftAssignmentAction(
  formData: FormData,
): Promise<ActionResult<{ assignmentId: string }>> {
  const { context } = await requireHrShiftsWrite();

  const parsed = hrShiftAssignmentIdActionSchema.safeParse({
    assignmentId: formData.get("assignmentId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await cancelHrShiftAssignment({
      organizationId: context.organizationId,
      assignmentId: parsed.data.assignmentId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrShiftsAuditActions.cancel,
      targetType: "hr_shift_assignment",
      targetId: result.assignmentId,
    });

    revalidateHrShifts();
    return actionSuccess({ assignmentId: result.assignmentId });
  } catch (error) {
    return mapCommandError(error);
  }
}
