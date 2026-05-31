import {
  decideHrShiftScheduleChangeRequest,
  listHrShiftScheduleChangeRequestsWindow,
  submitHrShiftScheduleChangeRequest,
  type HrShiftScheduleChangeRequestWindow,
} from "@afenda/db";

import type {
  HrSftDecideScheduleChangeInput,
  HrSftSubmitScheduleChangeInput,
} from "../schemas/hr.time.sft-schedule-change.schema";

export type { HrShiftScheduleChangeRequestWindow };

/** HRM-SFT-024 — employee or manager schedule change submission. */
export async function submitHrTimeSftScheduleChangeRequest(input: {
  organizationId: string;
  requestingEmployeeId: string;
  actorAuthUserId: string;
  managerInitiated?: boolean;
  payload: HrSftSubmitScheduleChangeInput;
}): Promise<{ scheduleChangeRequestId: string }> {
  return submitHrShiftScheduleChangeRequest({
    organizationId: input.organizationId,
    requestingEmployeeId:
      input.payload.requestingEmployeeId ?? input.requestingEmployeeId,
    assignmentId: input.payload.assignmentId,
    proposedChanges: {
      assignmentId: input.payload.proposedChanges.assignmentId,
      templateId: input.payload.proposedChanges.templateId,
      shiftDate: input.payload.proposedChanges.shiftDate?.toISOString(),
      notes: input.payload.proposedChanges.notes,
    },
    reason: input.payload.reason,
    initiatorAuthUserId: input.actorAuthUserId,
    managerInitiated: input.managerInitiated ?? false,
  });
}

export async function decideHrTimeSftScheduleChangeRequest(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrSftDecideScheduleChangeInput;
}) {
  return decideHrShiftScheduleChangeRequest({
    organizationId: input.organizationId,
    scheduleChangeRequestId: input.payload.scheduleChangeRequestId,
    decision: input.payload.decision,
    actorAuthUserId: input.actorAuthUserId,
    rejectionReason: input.payload.rejectionReason,
    overrideReason: input.payload.overrideReason,
    returnedNote: input.payload.returnedNote,
    decisionNote: input.payload.decisionNote,
  });
}

export async function loadHrTimeSftScheduleChangePendingWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
}): Promise<HrShiftScheduleChangeRequestWindow> {
  return listHrShiftScheduleChangeRequestsWindow({
    organizationId: input.organizationId,
    status: "actionable",
    limit: input.limit,
    offset: input.offset,
  });
}

/** HRM-SFT-024 — employee schedule change history. */
export async function loadHrTimeSftMyScheduleChangesWindow(input: {
  organizationId: string;
  requestingEmployeeId: string;
  limit?: number;
  offset?: number;
}): Promise<HrShiftScheduleChangeRequestWindow> {
  return listHrShiftScheduleChangeRequestsWindow({
    organizationId: input.organizationId,
    requestingEmployeeId: input.requestingEmployeeId,
    limit: input.limit,
    offset: input.offset,
  });
}
