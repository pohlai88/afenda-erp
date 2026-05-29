"use server";

import {
  approveHrLeaveRequest,
  cancelHrLeaveRequest,
  HrLeaveCommandError,
  rejectHrLeaveRequest,
  submitHrLeaveRequest,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  actionFailure,
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";
import { hrLeaveAuditActions } from "../events/hr-leave.event";
import { requireHrLeaveWrite } from "../policies/hr-leave.policy.server";
import {
  hrCancelLeaveRequestActionSchema,
  hrDecideLeaveRequestActionSchema,
  hrSubmitLeaveRequestActionSchema,
} from "../schemas/hr-leave-mutation.schema";

function revalidateHrLeave() {
  revalidatePath("/hr/leave");
}

function mapCommandError(error: unknown): ActionResult<never> {
  if (error instanceof HrLeaveCommandError) {
    return actionFailure(error.message, undefined, error.code);
  }
  return actionFailure(
    error instanceof Error ? error.message : "HR leave mutation failed.",
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

export async function submitHrLeaveRequestAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  const { context } = await requireHrLeaveWrite();

  const parsed = hrSubmitLeaveRequestActionSchema.safeParse({
    employeeId: formData.get("employeeId"),
    leaveType: formData.get("leaveType"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await submitHrLeaveRequest({
      organizationId: context.organizationId,
      employeeId: parsed.data.employeeId,
      leaveType: parsed.data.leaveType,
      startAt: toUtcDayBoundary(parsed.data.startAt, false),
      endAt: toUtcDayBoundary(parsed.data.endAt, true),
      reason: parsed.data.reason,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrLeaveAuditActions.submit,
      targetType: "hr_leave_request",
      targetId: result.requestId,
      metadata: { employeeId: parsed.data.employeeId },
    });

    revalidateHrLeave();
    return actionSuccess({ requestId: result.requestId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function approveHrLeaveRequestAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  const { context } = await requireHrLeaveWrite();

  const parsed = hrDecideLeaveRequestActionSchema.safeParse({
    requestId: formData.get("requestId"),
    decisionNote: formData.get("decisionNote") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await approveHrLeaveRequest({
      organizationId: context.organizationId,
      requestId: parsed.data.requestId,
      decisionNote: parsed.data.decisionNote,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrLeaveAuditActions.approve,
      targetType: "hr_leave_request",
      targetId: result.requestId,
    });

    revalidateHrLeave();
    return actionSuccess({ requestId: result.requestId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function rejectHrLeaveRequestAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  const { context } = await requireHrLeaveWrite();

  const parsed = hrDecideLeaveRequestActionSchema.safeParse({
    requestId: formData.get("requestId"),
    decisionNote: formData.get("decisionNote") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await rejectHrLeaveRequest({
      organizationId: context.organizationId,
      requestId: parsed.data.requestId,
      decisionNote: parsed.data.decisionNote,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrLeaveAuditActions.reject,
      targetType: "hr_leave_request",
      targetId: result.requestId,
    });

    revalidateHrLeave();
    return actionSuccess({ requestId: result.requestId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function cancelHrLeaveRequestAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  const { context } = await requireHrLeaveWrite();

  const parsed = hrCancelLeaveRequestActionSchema.safeParse({
    requestId: formData.get("requestId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await cancelHrLeaveRequest({
      organizationId: context.organizationId,
      requestId: parsed.data.requestId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrLeaveAuditActions.cancel,
      targetType: "hr_leave_request",
      targetId: result.requestId,
    });

    revalidateHrLeave();
    return actionSuccess({ requestId: result.requestId });
  } catch (error) {
    return mapCommandError(error);
  }
}
