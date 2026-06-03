"use server";

import {
  submitHrLeaveApplication,
  upsertHrAttendanceDay,
} from "@afenda/db";
import { zodActionFailure, type ActionResult } from "@afenda/governed-surface/schemas";

import { hrTimeLamAuditActions } from "./hr.time.lam.event";
import {
  requireHrLamAttendanceWrite,
  requireHrLamLeaveWrite,
} from "./hr.time.lam-access.policy.server";
import {
  parseHrLamAttendanceDayForm,
  parseHrLamLeaveApplicationForm,
} from "./hr.time.lam-form.schema";
import { finalizeLamMutation } from "./hr.time.lam.mutation.shared.server";

export async function submitHrLamLeaveApplicationAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrLamLeaveWrite();
  const parsed = parseHrLamLeaveApplicationForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeLamMutation(organization.id, async () => {
    const result = await submitHrLeaveApplication({
      organizationId: organization.id,
      employeeId: parsed.data.employeeId,
      leaveType: parsed.data.leaveType,
      startAt: parsed.data.startAt,
      endAt: parsed.data.endAt,
      reason: parsed.data.reason,
      supportingDocumentId: parsed.data.supportingDocumentId,
      policyGroupCode: parsed.data.policyGroupCode,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrTimeLamAuditActions.leaveApplication.submitted,
      targetId: result.requestId,
      summary: "Submitted leave application",
      metadata: {
        leaveType: parsed.data.leaveType,
        employeeId: parsed.data.employeeId,
      },
    };
  });
}

export async function upsertHrLamAttendanceDayAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrLamAttendanceWrite();
  const parsed = parseHrLamAttendanceDayForm(formData);
  if (!parsed.success) return zodActionFailure(parsed.error);

  return finalizeLamMutation(organization.id, async () => {
    const result = await upsertHrAttendanceDay({
      organizationId: organization.id,
      employeeId: parsed.data.employeeId,
      workDate: parsed.data.workDate,
      workCalendarCode: parsed.data.workCalendarCode,
      status: parsed.data.status,
      notes: parsed.data.notes,
    });

    return {
      organizationId: organization.id,
      actorId: session.id,
      action: hrTimeLamAuditActions.attendanceDay.upserted,
      targetId: result.attendanceDayId,
      summary: result.created
        ? "Created attendance day"
        : "Updated attendance day",
      metadata: {
        employeeId: parsed.data.employeeId,
        status: parsed.data.status,
      },
    };
  });
}
