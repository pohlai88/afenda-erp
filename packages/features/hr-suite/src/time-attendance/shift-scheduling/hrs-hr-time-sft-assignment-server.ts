import {
  bulkScheduleHrShiftAssignments,
  scheduleHrShiftAssignment,
  type HrShiftBulkScheduleResult,
} from "@afenda/db";

import type {
  HrSftAssignShiftInput,
  HrSftBulkAssignShiftInput,
} from "./hr.time.sft-assignment.schema";
import { emitHrSftAuditEvent } from "./hr.time.sft-audit.server";
import { assertShiftAssignmentConflictsClear } from "./hr.time.sft-conflict.server";
import { hrTimeSftAuditActions } from "./hr.time.sft.event";

export type { HrShiftBulkScheduleResult };

/** HRM-SFT-005 — assign one employee to a shift on a date. */
export async function assignHrTimeSftShift(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrSftAssignShiftInput;
}): Promise<{ assignmentId: string }> {
  await assertShiftAssignmentConflictsClear({
    organizationId: input.organizationId,
    employeeId: input.payload.employeeId,
    templateId: input.payload.templateId,
    shiftDate: input.payload.shiftDate,
    assignmentKind: "shift",
  });

  const result = await scheduleHrShiftAssignment({
    organizationId: input.organizationId,
    employeeId: input.payload.employeeId,
    templateId: input.payload.templateId,
    shiftDate: input.payload.shiftDate,
    notes: input.payload.notes,
    assignedByAuthUserId: input.actorAuthUserId,
  });

  await emitHrSftAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeSftAuditActions.assignment.created,
    targetType: "hr_shift_assignment",
    targetId: result.assignmentId,
    summary: `Shift assigned for employee ${input.payload.employeeId}.`,
    metadata: {
      employeeId: input.payload.employeeId,
      templateId: input.payload.templateId,
      shiftDate: input.payload.shiftDate.toISOString(),
    },
  });

  return result;
}

/** HRM-SFT-006 — bulk shift assignment for the same template. */
export async function bulkAssignHrTimeSftShifts(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrSftBulkAssignShiftInput;
}): Promise<HrShiftBulkScheduleResult> {
  const result = await bulkScheduleHrShiftAssignments({
    organizationId: input.organizationId,
    templateId: input.payload.templateId,
    entries: input.payload.entries,
    assignedByAuthUserId: input.actorAuthUserId,
  });

  await emitHrSftAuditEvent({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    action: hrTimeSftAuditActions.assignment.bulkCreated,
    targetType: "hr_shift_template",
    targetId: input.payload.templateId,
    summary: `Bulk shift assignment created ${result.createdAssignmentIds.length} row(s).`,
    metadata: {
      createdCount: result.createdAssignmentIds.length,
      skippedCount: result.skippedDates.length,
      assignmentIds: result.createdAssignmentIds,
    },
  });

  return result;
}
