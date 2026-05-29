"use server";

import {
  HrAttendanceCommandError,
  recordHrAttendancePunch,
  voidHrAttendancePunch,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  actionFailure,
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";
import { hrAttendanceAuditActions } from "../events/hr-attendance.event";
import { requireHrAttendanceWrite } from "../policies/hr-attendance.policy.server";
import {
  hrRecordAttendancePunchActionSchema,
  hrVoidAttendancePunchActionSchema,
} from "../schemas/hr-attendance-mutation.schema";

function revalidateHrAttendance() {
  revalidatePath("/hr/attendance");
}

function mapCommandError(error: unknown): ActionResult<never> {
  if (error instanceof HrAttendanceCommandError) {
    return actionFailure(error.message, undefined, error.code);
  }
  return actionFailure(
    error instanceof Error ? error.message : "HR attendance mutation failed.",
    undefined,
    "unknown",
  );
}

export async function recordHrAttendancePunchAction(
  formData: FormData,
): Promise<ActionResult<{ recordId: string; created: boolean }>> {
  const { context } = await requireHrAttendanceWrite();

  const parsed = hrRecordAttendancePunchActionSchema.safeParse({
    employeeId: formData.get("employeeId"),
    punchType: formData.get("punchType"),
    punchedAt: formData.get("punchedAt") || undefined,
    idempotencyKey: formData.get("idempotencyKey") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await recordHrAttendancePunch({
      organizationId: context.organizationId,
      employeeId: parsed.data.employeeId,
      punchType: parsed.data.punchType,
      punchedAt: parsed.data.punchedAt,
      idempotencyKey: parsed.data.idempotencyKey,
      notes: parsed.data.notes,
      source: "manual",
    });

    if (result.created) {
      await writeExecutionAuditEvent({
        organizationId: context.organizationId,
        actorId: context.userId,
        actorType: context.actorType,
        action: hrAttendanceAuditActions.record,
        targetType: "hr_attendance_record",
        targetId: result.recordId,
        metadata: { punchType: parsed.data.punchType },
      });
    }

    revalidateHrAttendance();
    return actionSuccess(result);
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function voidHrAttendancePunchAction(
  formData: FormData,
): Promise<ActionResult<{ recordId: string }>> {
  const { context } = await requireHrAttendanceWrite();

  const parsed = hrVoidAttendancePunchActionSchema.safeParse({
    recordId: formData.get("recordId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await voidHrAttendancePunch({
      organizationId: context.organizationId,
      recordId: parsed.data.recordId,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrAttendanceAuditActions.void,
      targetType: "hr_attendance_record",
      targetId: result.recordId,
    });

    revalidateHrAttendance();
    return actionSuccess({ recordId: result.recordId });
  } catch (error) {
    return mapCommandError(error);
  }
}
