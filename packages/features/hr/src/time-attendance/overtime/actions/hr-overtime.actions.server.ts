"use server";

import {
  approveHrOvertimeRequest,
  cancelHrOvertimeRequest,
  HrOvertimeCommandError,
  rejectHrOvertimeRequest,
  submitHrOvertimeRequest,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  actionFailure,
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";
import { hrOvertimeAuditActions } from "../events/hr-overtime.event";
import { requireHrOvertimeWrite } from "../policies/hr-overtime.policy.server";
import {
  hrCancelOvertimeRequestActionSchema,
  hrDecideOvertimeRequestActionSchema,
  hrSubmitOvertimeRequestActionSchema,
} from "../schemas/hr-overtime-mutation.schema";

function revalidateHrOvertime() {
  revalidatePath("/hr/overtime");
}

function mapCommandError(error: unknown): ActionResult<never> {
  if (error instanceof HrOvertimeCommandError) {
    return actionFailure(error.message, undefined, error.code);
  }
  return actionFailure(
    error instanceof Error ? error.message : "HR overtime mutation failed.",
    undefined,
    "unknown",
  );
}

function toUtcDayBoundary(date: Date, endOfDay: boolean): Date {
  const copy = new Date(date);
  if (endOfDay) {
    copy.setUTCHours(23, 59, 59, 999);
  } else {
    copy.setUTCHours(0, 0, 0, 0);
  }
  return copy;
}

export async function submitHrOvertimeRequestAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  const { context } = await requireHrOvertimeWrite();

  const parsed = hrSubmitOvertimeRequestActionSchema.safeParse({
    employeeId: formData.get("employeeId"),
    overtimeType: formData.get("overtimeType"),
    workDate: formData.get("workDate"),
    hours: formData.get("hours"),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await submitHrOvertimeRequest({
      organizationId: context.organizationId,
      employeeId: parsed.data.employeeId,
      overtimeType: parsed.data.overtimeType,
      workDate: toUtcDayBoundary(parsed.data.workDate, false),
      hours: parsed.data.hours,
      reason: parsed.data.reason,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrOvertimeAuditActions.submit,
      targetType: "hr_overtime_request",
      targetId: result.requestId,
      metadata: { employeeId: parsed.data.employeeId },
    });

    revalidateHrOvertime();
    return actionSuccess({ requestId: result.requestId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function approveHrOvertimeRequestAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  const { context } = await requireHrOvertimeWrite();

  const parsed = hrDecideOvertimeRequestActionSchema.safeParse({
    requestId: formData.get("requestId"),
    decisionNote: formData.get("decisionNote") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await approveHrOvertimeRequest({
      organizationId: context.organizationId,
      requestId: parsed.data.requestId,
      decisionNote: parsed.data.decisionNote,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrOvertimeAuditActions.approve,
      targetType: "hr_overtime_request",
      targetId: result.requestId,
    });

    revalidateHrOvertime();
    return actionSuccess({ requestId: result.requestId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function rejectHrOvertimeRequestAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  const { context } = await requireHrOvertimeWrite();

  const parsed = hrDecideOvertimeRequestActionSchema.safeParse({
    requestId: formData.get("requestId"),
    decisionNote: formData.get("decisionNote") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await rejectHrOvertimeRequest({
      organizationId: context.organizationId,
      requestId: parsed.data.requestId,
      decisionNote: parsed.data.decisionNote,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrOvertimeAuditActions.reject,
      targetType: "hr_overtime_request",
      targetId: result.requestId,
    });

    revalidateHrOvertime();
    return actionSuccess({ requestId: result.requestId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function cancelHrOvertimeRequestAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  const { context } = await requireHrOvertimeWrite();

  const parsed = hrCancelOvertimeRequestActionSchema.safeParse({
    requestId: formData.get("requestId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await cancelHrOvertimeRequest({
      organizationId: context.organizationId,
      requestId: parsed.data.requestId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrOvertimeAuditActions.cancel,
      targetType: "hr_overtime_request",
      targetId: result.requestId,
    });

    revalidateHrOvertime();
    return actionSuccess({ requestId: result.requestId });
  } catch (error) {
    return mapCommandError(error);
  }
}
