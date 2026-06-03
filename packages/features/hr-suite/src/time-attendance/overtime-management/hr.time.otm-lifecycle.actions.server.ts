"use server";

import {
  approveHrOvertimeRequest,
  cancelHrOvertimeRequest,
  markHrOvertimePaid,
  markHrOvertimePayrollReady,
  rejectHrOvertimeRequest,
  submitHrOvertimeRequest,
} from "@afenda/db";
import {
  type ActionResult,
  actionSuccess,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { emitHrTimeOtmAuditEvent } from "../data/hr.time.otm-audit.server";
import { syncHrTimeOtmLifecycleNotifications } from "../data/hr.time.otm-notification.server";
import { validateHrTimeOtmEligibilityForSubmit } from "../data/hr.time.otm-eligibility.server";
import { HRM_OTM_AUDIT } from "./hr.time.otm.event";
import {
  HrTimeOtmAccessDeniedError,
  requireHrTimeOtmRead,
  requireHrTimeOtmWrite,
} from "./hr.time.otm-access.policy.server";
import {
  HR_TIME_OTM_REVALIDATE_PATH,
  toHrTimeOtmActionFailure,
} from "./hr.time.otm-action-result.shared.server";

const submitHrTimeOtmRequestSchema = z.object({
  employeeId: z.string().min(1),
  overtimeType: z.enum([
    "regular",
    "rest_day",
    "off_day",
    "public_holiday",
    "night",
    "emergency",
  ]),
  workDateIso: z.string().min(1),
  hours: z.coerce.number().positive(),
  reason: z.string().optional(),
  eligibilityExceptionReason: z.string().optional(),
});

const otmRequestIdSchema = z.object({
  requestId: z.string().min(1),
  decisionNote: z.string().optional(),
});

function parseWorkDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function notifyLifecycle(input: {
  guard: Awaited<ReturnType<typeof requireHrTimeOtmRead>>;
  kind: Parameters<typeof syncHrTimeOtmLifecycleNotifications>[0]["kind"];
  requestId: string;
  employeeId: string;
  workDate?: Date;
  detail?: string;
}) {
  await syncHrTimeOtmLifecycleNotifications({
    organizationId: input.guard.organization.id,
    orgSlug: input.guard.organization.slug,
    locale: input.guard.organization.locale,
    kind: input.kind,
    requestId: input.requestId,
    employeeId: input.employeeId,
    workDate: input.workDate,
    detail: input.detail,
  });
}

/** HRM-OTM-001/029 — submit overtime with eligibility validation + audit. */
export async function submitHrTimeOtmRequestAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  let guard: Awaited<ReturnType<typeof requireHrTimeOtmRead>>;
  try {
    guard = await requireHrTimeOtmRead();
  } catch (error) {
    if (error instanceof HrTimeOtmAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = submitHrTimeOtmRequestSchema.safeParse({
    employeeId: formData.get("employeeId"),
    overtimeType: formData.get("overtimeType"),
    workDateIso: formData.get("workDateIso"),
    hours: formData.get("hours"),
    reason: formData.get("reason") ?? undefined,
    eligibilityExceptionReason:
      formData.get("eligibilityExceptionReason") ?? undefined,
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const workDate = parseWorkDate(parsed.data.workDateIso);
  if (!workDate) {
    return { ok: false, error: "invalid_work_date" };
  }

  try {
    await validateHrTimeOtmEligibilityForSubmit({
      organizationId: guard.organization.id,
      employeeId: parsed.data.employeeId,
      overtimeType: parsed.data.overtimeType,
      eligibilityExceptionReason: parsed.data.eligibilityExceptionReason,
    });

    await emitHrTimeOtmAuditEvent({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      action: HRM_OTM_AUDIT.eligibility.validate,
      targetId: parsed.data.employeeId,
      summary: "Overtime eligibility validated on submit",
    });

    const result = await submitHrOvertimeRequest({
      organizationId: guard.organization.id,
      employeeId: parsed.data.employeeId,
      overtimeType: parsed.data.overtimeType,
      workDate,
      hours: parsed.data.hours,
      reason: parsed.data.reason,
    });

    await emitHrTimeOtmAuditEvent({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      action: HRM_OTM_AUDIT.request.submit,
      targetId: result.requestId,
      summary: "Overtime request submitted",
    });

    await notifyLifecycle({
      guard,
      kind: "request_submitted",
      requestId: result.requestId,
      employeeId: parsed.data.employeeId,
      workDate,
    });

    revalidatePath(HR_TIME_OTM_REVALIDATE_PATH);
    return actionSuccess(result);
  } catch (error) {
    return toHrTimeOtmActionFailure<{ requestId: string }>(error);
  }
}

/** HRM-OTM-017/029 — approve overtime request. */
export async function approveHrTimeOtmRequestAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  let guard: Awaited<ReturnType<typeof requireHrTimeOtmWrite>>;
  try {
    guard = await requireHrTimeOtmWrite();
  } catch (error) {
    if (error instanceof HrTimeOtmAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = otmRequestIdSchema.safeParse({
    requestId: formData.get("requestId"),
    decisionNote: formData.get("decisionNote") ?? undefined,
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await approveHrOvertimeRequest({
      organizationId: guard.organization.id,
      requestId: parsed.data.requestId,
      decisionNote: parsed.data.decisionNote,
      actorAuthUserId: guard.session.id,
    });

    await emitHrTimeOtmAuditEvent({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      action: HRM_OTM_AUDIT.request.approve,
      targetId: result.requestId,
      summary: parsed.data.decisionNote ?? "Overtime request approved",
    });

    revalidatePath(HR_TIME_OTM_REVALIDATE_PATH);
    return actionSuccess(result);
  } catch (error) {
    return toHrTimeOtmActionFailure<{ requestId: string }>(error);
  }
}

/** HRM-OTM-017/029 — reject overtime request. */
export async function rejectHrTimeOtmRequestAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  let guard: Awaited<ReturnType<typeof requireHrTimeOtmWrite>>;
  try {
    guard = await requireHrTimeOtmWrite();
  } catch (error) {
    if (error instanceof HrTimeOtmAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = otmRequestIdSchema.safeParse({
    requestId: formData.get("requestId"),
    decisionNote: formData.get("decisionNote") ?? undefined,
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await rejectHrOvertimeRequest({
      organizationId: guard.organization.id,
      requestId: parsed.data.requestId,
      decisionNote: parsed.data.decisionNote,
      actorAuthUserId: guard.session.id,
    });

    await emitHrTimeOtmAuditEvent({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      action: HRM_OTM_AUDIT.request.reject,
      targetId: result.requestId,
      summary: parsed.data.decisionNote ?? "Overtime request rejected",
    });

    revalidatePath(HR_TIME_OTM_REVALIDATE_PATH);
    return actionSuccess(result);
  } catch (error) {
    return toHrTimeOtmActionFailure<{ requestId: string }>(error);
  }
}

/** HRM-OTM-025/029 — cancel overtime request. */
export async function cancelHrTimeOtmRequestAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  let guard: Awaited<ReturnType<typeof requireHrTimeOtmRead>>;
  try {
    guard = await requireHrTimeOtmRead();
  } catch (error) {
    if (error instanceof HrTimeOtmAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = otmRequestIdSchema.safeParse({
    requestId: formData.get("requestId"),
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await cancelHrOvertimeRequest({
      organizationId: guard.organization.id,
      requestId: parsed.data.requestId,
      actorAuthUserId: guard.session.id,
    });

    await emitHrTimeOtmAuditEvent({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      action: HRM_OTM_AUDIT.request.cancel,
      targetId: result.requestId,
      summary: "Overtime request cancelled",
    });

    revalidatePath(HR_TIME_OTM_REVALIDATE_PATH);
    return actionSuccess(result);
  } catch (error) {
    return toHrTimeOtmActionFailure<{ requestId: string }>(error);
  }
}

/** HRM-OTM-023/029 — mark approved overtime payroll ready. */
export async function markHrTimeOtmPayrollReadyAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  let guard: Awaited<ReturnType<typeof requireHrTimeOtmWrite>>;
  try {
    guard = await requireHrTimeOtmWrite();
  } catch (error) {
    if (error instanceof HrTimeOtmAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = otmRequestIdSchema.safeParse({
    requestId: formData.get("requestId"),
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await markHrOvertimePayrollReady({
      organizationId: guard.organization.id,
      requestId: parsed.data.requestId,
      actorAuthUserId: guard.session.id,
    });

    await emitHrTimeOtmAuditEvent({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      action: HRM_OTM_AUDIT.payroll.ready,
      targetId: result.requestId,
      summary: "Overtime marked payroll ready",
    });

    revalidatePath(HR_TIME_OTM_REVALIDATE_PATH);
    return actionSuccess(result);
  } catch (error) {
    return toHrTimeOtmActionFailure<{ requestId: string }>(error);
  }
}

/** HRM-OTM-023/029 — mark payroll-ready overtime paid. */
export async function markHrTimeOtmPaidAction(
  formData: FormData,
): Promise<ActionResult<{ requestId: string }>> {
  let guard: Awaited<ReturnType<typeof requireHrTimeOtmWrite>>;
  try {
    guard = await requireHrTimeOtmWrite();
  } catch (error) {
    if (error instanceof HrTimeOtmAccessDeniedError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }

  const parsed = otmRequestIdSchema.safeParse({
    requestId: formData.get("requestId"),
  });
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await markHrOvertimePaid({
      organizationId: guard.organization.id,
      requestId: parsed.data.requestId,
      actorAuthUserId: guard.session.id,
    });

    await emitHrTimeOtmAuditEvent({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      action: HRM_OTM_AUDIT.payroll.paid,
      targetId: result.requestId,
      summary: "Overtime marked paid",
    });

    revalidatePath(HR_TIME_OTM_REVALIDATE_PATH);
    return actionSuccess(result);
  } catch (error) {
    return toHrTimeOtmActionFailure<{ requestId: string }>(error);
  }
}
