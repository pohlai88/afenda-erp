"use server";

import {
  actionSuccess,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";

import {
  assignHrSftHolidayShift,
  assignHrSftRestOrOffDay,
  createHrSftEmployeeAvailability,
  deleteHrSftEmployeeAvailability,
  HrSftAvailabilityError,
  updateHrSftEmployeeAvailability,
} from "../data/hr.time.sft-availability.server";
import { upsertHrSftSchedulingPolicy } from "../data/hr.time.sft-policy.server";
import { hrTimeSftAuditActions } from "../events/hr.time.sft.event";
import {
  HrSftAccessDeniedError,
  requireHrSftManage,
} from "../policies/hr.time.sft-access.policy.server";
import {
  hrSftAssignHolidayShiftSchema,
  hrSftAssignRestOrOffDaySchema,
  hrSftCreateAvailabilitySchema,
  hrSftDeleteAvailabilitySchema,
  hrSftUpdateAvailabilitySchema,
} from "../schemas/hr.time.sft-availability.schema";
import { upsertHrSftSchedulingPolicyFormSchema } from "../schemas/hr.time.sft-policy.schema";

function readFormField(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readOptionalBoolean(formData: FormData, key: string): boolean | undefined {
  const value = readFormField(formData, key);
  if (value === undefined) {
    return undefined;
  }
  return value === "true" || value === "1" || value === "on";
}

function readOptionalNumber(formData: FormData, key: string): number | undefined {
  const value = readFormField(formData, key);
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toAvailabilityActionFailure(error: unknown): ActionResult<never> {
  if (error instanceof HrSftAvailabilityError) {
    return { ok: false, error: error.message };
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: "sft_action_failed" };
}

/** HRM-SFT-014/015 — update org scheduling policy. */
export async function updateHrSftSchedulingPolicyAction(
  formData: FormData,
): Promise<ActionResult<{ organizationId: string }>> {
  let guard: Awaited<ReturnType<typeof requireHrSftManage>>;
  try {
    guard = await requireHrSftManage();
  } catch (error) {
    if (error instanceof HrSftAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = upsertHrSftSchedulingPolicyFormSchema.safeParse({
    minRestHoursBetweenShifts: readOptionalNumber(
      formData,
      "minRestHoursBetweenShifts",
    ),
    maxWeeklyScheduledHours: readOptionalNumber(
      formData,
      "maxWeeklyScheduledHours",
    ),
    swapRequestsEnabled: readOptionalBoolean(formData, "swapRequestsEnabled"),
    employeeScheduleChangeEnabled: readOptionalBoolean(
      formData,
      "employeeScheduleChangeEnabled",
    ),
    validateAvailabilityOnAssign: readOptionalBoolean(
      formData,
      "validateAvailabilityOnAssign",
    ),
    validateLeaveConflictOnAssign: readOptionalBoolean(
      formData,
      "validateLeaveConflictOnAssign",
    ),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  await upsertHrSftSchedulingPolicy({
    organizationId: guard.organization.id,
    policy: parsed.data,
    updatedByAuthUserId: guard.session.id,
  });

  await writeExecutionAuditEvent({
    organizationId: guard.organization.id,
    actorId: guard.session.id,
    actorType: "user",
    action: hrTimeSftAuditActions.policy.updated,
    targetType: "hr_shift_scheduling_policy",
    targetId: guard.organization.id,
    metadata: parsed.data,
  });

  return actionSuccess({ organizationId: guard.organization.id });
}

/** HRM-SFT-011 — create employee availability window. */
export async function createHrSftAvailabilityAction(
  formData: FormData,
): Promise<ActionResult<{ availabilityId: string }>> {
  let guard: Awaited<ReturnType<typeof requireHrSftManage>>;
  try {
    guard = await requireHrSftManage();
  } catch (error) {
    if (error instanceof HrSftAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = hrSftCreateAvailabilitySchema.safeParse({
    employeeId: readFormField(formData, "employeeId"),
    availabilityKind: readFormField(formData, "availabilityKind"),
    startDate: readFormField(formData, "startDate"),
    endDate: readFormField(formData, "endDate"),
    preferredTemplateId: readFormField(formData, "preferredTemplateId"),
    reason: readFormField(formData, "reason"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const row = await createHrSftEmployeeAvailability({
      organizationId: guard.organization.id,
      payload: parsed.data,
    });
    return actionSuccess({ availabilityId: row.id });
  } catch (error) {
    return toAvailabilityActionFailure(error);
  }
}

/** HRM-SFT-011 — update employee availability window. */
export async function updateHrSftAvailabilityAction(
  formData: FormData,
): Promise<ActionResult<{ availabilityId: string }>> {
  let guard: Awaited<ReturnType<typeof requireHrSftManage>>;
  try {
    guard = await requireHrSftManage();
  } catch (error) {
    if (error instanceof HrSftAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = hrSftUpdateAvailabilitySchema.safeParse({
    availabilityId: readFormField(formData, "availabilityId"),
    availabilityKind: readFormField(formData, "availabilityKind"),
    startDate: readFormField(formData, "startDate"),
    endDate: readFormField(formData, "endDate"),
    preferredTemplateId: readFormField(formData, "preferredTemplateId"),
    reason: readFormField(formData, "reason"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const row = await updateHrSftEmployeeAvailability({
      organizationId: guard.organization.id,
      payload: parsed.data,
    });
    return actionSuccess({ availabilityId: row.id });
  } catch (error) {
    return toAvailabilityActionFailure(error);
  }
}

/** HRM-SFT-011 — delete employee availability window. */
export async function deleteHrSftAvailabilityAction(
  formData: FormData,
): Promise<ActionResult<{ availabilityId: string }>> {
  let guard: Awaited<ReturnType<typeof requireHrSftManage>>;
  try {
    guard = await requireHrSftManage();
  } catch (error) {
    if (error instanceof HrSftAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = hrSftDeleteAvailabilitySchema.safeParse({
    availabilityId: readFormField(formData, "availabilityId"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await deleteHrSftEmployeeAvailability({
      organizationId: guard.organization.id,
      availabilityId: parsed.data.availabilityId,
    });
    return actionSuccess(result);
  } catch (error) {
    return toAvailabilityActionFailure(error);
  }
}

/** HRM-SFT-009 — assign rest day or off day. */
export async function assignHrSftRestOrOffDayAction(
  formData: FormData,
): Promise<
  ActionResult<{ assignmentId: string; assignmentKind: "rest_day" | "off_day" }>
> {
  let guard: Awaited<ReturnType<typeof requireHrSftManage>>;
  try {
    guard = await requireHrSftManage();
  } catch (error) {
    if (error instanceof HrSftAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = hrSftAssignRestOrOffDaySchema.safeParse({
    employeeId: readFormField(formData, "employeeId"),
    shiftDate: readFormField(formData, "shiftDate"),
    assignmentKind: readFormField(formData, "assignmentKind"),
    templateId: readFormField(formData, "templateId"),
    notes: readFormField(formData, "notes"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await assignHrSftRestOrOffDay({
      organizationId: guard.organization.id,
      payload: parsed.data,
      assignedByAuthUserId: guard.session.id,
    });

    await writeExecutionAuditEvent({
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      actorType: "user",
      action: hrTimeSftAuditActions.assignment.created,
      targetType: "hr_shift_assignment",
      targetId: result.assignmentId,
      metadata: {
        assignmentKind: result.assignmentKind,
        employeeId: parsed.data.employeeId,
        shiftDate: parsed.data.shiftDate.toISOString(),
      },
    });

    return actionSuccess(result);
  } catch (error) {
    return toAvailabilityActionFailure(error);
  }
}

/** HRM-SFT-010 — schedule holiday shift assignment. */
export async function assignHrSftHolidayShiftAction(
  formData: FormData,
): Promise<ActionResult<{ assignmentId: string }>> {
  let guard: Awaited<ReturnType<typeof requireHrSftManage>>;
  try {
    guard = await requireHrSftManage();
  } catch (error) {
    if (error instanceof HrSftAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = hrSftAssignHolidayShiftSchema.safeParse({
    employeeId: readFormField(formData, "employeeId"),
    templateId: readFormField(formData, "templateId"),
    shiftDate: readFormField(formData, "shiftDate"),
    notes: readFormField(formData, "notes"),
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await assignHrSftHolidayShift({
      organizationId: guard.organization.id,
      payload: parsed.data,
      assignedByAuthUserId: guard.session.id,
    });

    await writeExecutionAuditEvent({
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      actorType: "user",
      action: hrTimeSftAuditActions.assignment.created,
      targetType: "hr_shift_assignment",
      targetId: result.assignmentId,
      metadata: {
        assignmentKind: "holiday",
        employeeId: parsed.data.employeeId,
        templateId: parsed.data.templateId,
        shiftDate: parsed.data.shiftDate.toISOString(),
      },
    });

    return actionSuccess(result);
  } catch (error) {
    return toAvailabilityActionFailure(error);
  }
}
