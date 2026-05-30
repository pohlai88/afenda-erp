"use server";

import {
  approveAttendanceCorrectionRequest,
  enqueueHrLamNotification,
  regenerateAttendanceDayFromEvents,
  rejectAttendanceCorrectionRequest,
} from "@afenda/db";
import { actionSuccess, type ActionResult } from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import { hrTimeAttendanceLamAuditActions } from "../events/hr.time.attendance.lam.event";
import { requireHrLamAttendanceWrite } from "../policies/hr.time.lam-access.policy.server";

const LAM_REVALIDATE_PATH = "/apps/hrm/leave";

export async function regenerateLamAttendanceDayAction(input: {
  employeeId: string;
  workDateIso: string;
}): Promise<ActionResult> {
  const guard = await requireHrLamAttendanceWrite();
  const workDate = new Date(input.workDateIso);
  if (Number.isNaN(workDate.getTime())) {
    return { ok: false, error: "invalid_work_date" };
  }

  try {
    const result = await regenerateAttendanceDayFromEvents({
      organizationId: guard.organization.id,
      employeeId: input.employeeId,
      workDate,
    });

    await Promise.all([
      writeExecutionAuditEvent({
        organizationId: guard.organization.id,
        actorId: guard.session.id,
        actorType: "user",
        action: hrTimeAttendanceLamAuditActions.attendance.dayRegenerated,
        targetType: "hr_lam_attendance_day",
        targetId: result.attendanceDayId,
        summary: `Regenerated attendance day (${result.status})`,
      }),
      writeExecutionAuditEvent({
        organizationId: guard.organization.id,
        actorId: guard.session.id,
        actorType: "user",
        action: hrTimeAttendanceLamAuditActions.attendance.exceptionDetected,
        targetType: "hr_lam_attendance_day",
        targetId: result.attendanceDayId,
      }),
    ]);

    revalidatePath(LAM_REVALIDATE_PATH);
    return actionSuccess();
  } catch {
    return { ok: false, error: "regenerate_failed" };
  }
}

export async function approveLamAttendanceCorrectionAction(input: {
  correctionRequestId: string;
  decisionNote?: string;
}): Promise<ActionResult> {
  const guard = await requireHrLamAttendanceWrite();

  try {
    const result = await approveAttendanceCorrectionRequest({
      organizationId: guard.organization.id,
      correctionRequestId: input.correctionRequestId,
      decisionNote: input.decisionNote,
    });

    await Promise.all([
      writeExecutionAuditEvent({
        organizationId: guard.organization.id,
        actorId: guard.session.id,
        actorType: "user",
        action: hrTimeAttendanceLamAuditActions.attendance.correctionApproved,
        targetType: "hr_lam_attendance_correction",
        targetId: result.correctionRequestId,
        summary: input.decisionNote,
      }),
      enqueueHrLamNotification({
        organizationId: guard.organization.id,
        recipientAuthUserId: guard.session.id,
        kind: "attendance_correction_decided",
        subjectType: "hr_lam_attendance_correction",
        subjectId: result.correctionRequestId,
        title: "Attendance correction approved",
        body:
          input.decisionNote?.trim() ||
          "Your attendance correction was approved.",
      }),
    ]);

    revalidatePath(LAM_REVALIDATE_PATH);
    return actionSuccess();
  } catch {
    return { ok: false, error: "approve_correction_failed" };
  }
}

export async function rejectLamAttendanceCorrectionAction(input: {
  correctionRequestId: string;
  decisionNote?: string;
}): Promise<ActionResult> {
  const guard = await requireHrLamAttendanceWrite();

  try {
    const result = await rejectAttendanceCorrectionRequest({
      organizationId: guard.organization.id,
      correctionRequestId: input.correctionRequestId,
      decisionNote: input.decisionNote,
    });

    await Promise.all([
      writeExecutionAuditEvent({
        organizationId: guard.organization.id,
        actorId: guard.session.id,
        actorType: "user",
        action: hrTimeAttendanceLamAuditActions.attendance.correctionRejected,
        targetType: "hr_lam_attendance_correction",
        targetId: result.correctionRequestId,
        summary: input.decisionNote,
      }),
      enqueueHrLamNotification({
        organizationId: guard.organization.id,
        recipientAuthUserId: guard.session.id,
        kind: "attendance_correction_decided",
        subjectType: "hr_lam_attendance_correction",
        subjectId: result.correctionRequestId,
        title: "Attendance correction rejected",
        body:
          input.decisionNote?.trim() ||
          "Your attendance correction was rejected.",
      }),
    ]);

    revalidatePath(LAM_REVALIDATE_PATH);
    return actionSuccess();
  } catch {
    return { ok: false, error: "reject_correction_failed" };
  }
}
