"use server";

import {
  changeHrEmploymentStatus,
  HrLifecycleCommandError,
  recordHrEmployeeMovement,
  recordHrProbationOutcome,
} from "@afenda/db";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  actionFailure,
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";
import { hrLifecycleAuditActions } from "../events/hr-lifecycle.event";
import { requireHrLifecycleWrite } from "../policies/hr-lifecycle.policy.server";
import {
  hrChangeEmploymentStatusActionSchema,
  hrProbationOutcomeActionSchema,
  hrRecordMovementActionSchema,
} from "../schemas/hr-lifecycle-mutation.schema";

function revalidateHrLifecycle() {
  revalidatePath("/hr/lifecycle");
  revalidatePath("/hr/employees");
}

function mapCommandError(error: unknown): ActionResult<never> {
  if (error instanceof HrLifecycleCommandError) {
    return actionFailure(error.message, undefined, error.code);
  }
  return actionFailure(
    error instanceof Error ? error.message : "HR lifecycle mutation failed.",
    undefined,
    "unknown",
  );
}

export async function changeHrEmploymentStatusAction(
  formData: FormData,
): Promise<ActionResult<{ eventId: string }>> {
  const { context } = await requireHrLifecycleWrite();

  const parsed = hrChangeEmploymentStatusActionSchema.safeParse({
    employeeId: formData.get("employeeId"),
    toStatus: formData.get("toStatus"),
    effectiveDate: formData.get("effectiveDate") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await changeHrEmploymentStatus({
      organizationId: context.organizationId,
      employeeId: parsed.data.employeeId,
      toStatus: parsed.data.toStatus,
      effectiveDate: parsed.data.effectiveDate,
      reason: parsed.data.reason,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrLifecycleAuditActions.statusChange,
      targetType: "hr_employee",
      targetId: parsed.data.employeeId,
      metadata: {
        toStatus: parsed.data.toStatus,
        eventId: result.eventId,
      },
    });

    revalidateHrLifecycle();
    return actionSuccess({ eventId: result.eventId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function recordHrProbationOutcomeAction(
  formData: FormData,
): Promise<ActionResult<{ eventId: string }>> {
  const { context } = await requireHrLifecycleWrite();

  const parsed = hrProbationOutcomeActionSchema.safeParse({
    employeeId: formData.get("employeeId"),
    outcome: formData.get("outcome"),
    effectiveDate: formData.get("effectiveDate") || undefined,
    probationEndDate: formData.get("probationEndDate") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await recordHrProbationOutcome({
      organizationId: context.organizationId,
      employeeId: parsed.data.employeeId,
      outcome: parsed.data.outcome,
      effectiveDate: parsed.data.effectiveDate,
      probationEndDate: parsed.data.probationEndDate,
      reason: parsed.data.reason,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrLifecycleAuditActions.probationOutcome,
      targetType: "hr_employee",
      targetId: parsed.data.employeeId,
      metadata: {
        outcome: parsed.data.outcome,
        eventId: result.eventId,
      },
    });

    revalidateHrLifecycle();
    return actionSuccess({ eventId: result.eventId });
  } catch (error) {
    return mapCommandError(error);
  }
}

export async function recordHrEmployeeMovementAction(
  formData: FormData,
): Promise<ActionResult<{ eventId: string }>> {
  const { context } = await requireHrLifecycleWrite();

  const parsed = hrRecordMovementActionSchema.safeParse({
    employeeId: formData.get("employeeId"),
    movementKind: formData.get("movementKind"),
    currentDepartmentId: formData.get("currentDepartmentId") || undefined,
    currentPositionId: formData.get("currentPositionId") || undefined,
    managerEmployeeId: formData.get("managerEmployeeId") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const placement = {
    ...(parsed.data.currentDepartmentId
      ? { currentDepartmentId: parsed.data.currentDepartmentId }
      : {}),
    ...(parsed.data.currentPositionId
      ? { currentPositionId: parsed.data.currentPositionId }
      : {}),
    ...(parsed.data.managerEmployeeId
      ? { managerEmployeeId: parsed.data.managerEmployeeId }
      : {}),
  };

  if (
    !("currentDepartmentId" in placement) &&
    !("currentPositionId" in placement) &&
    !("managerEmployeeId" in placement)
  ) {
    return actionFailure(
      "Select at least one placement field to change.",
      undefined,
      "invalid_placement",
    );
  }

  try {
    const result = await recordHrEmployeeMovement({
      organizationId: context.organizationId,
      employeeId: parsed.data.employeeId,
      movementKind: parsed.data.movementKind,
      placement,
      reason: parsed.data.reason,
    });

    await writeExecutionAuditEvent({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorType: context.actorType,
      action: hrLifecycleAuditActions.movement,
      targetType: "hr_employee",
      targetId: parsed.data.employeeId,
      metadata: {
        movementKind: parsed.data.movementKind,
        eventId: result.eventId,
      },
    });

    revalidateHrLifecycle();
    return actionSuccess({ eventId: result.eventId });
  } catch (error) {
    return mapCommandError(error);
  }
}
