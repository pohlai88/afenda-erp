"use server";

import {
  approveHrOvertimeRequest,
  cancelHrOvertimeRequest,
  markHrOvertimePaid,
  markHrOvertimePayrollReady,
  saveHrOvertimeDraft,
  submitHrOvertimeDraft,
  type ExecuteHrOvertimeApprovalInput,
} from "@afenda/db";

/** HRM-OTM-025 — draft save. */
export async function saveHrTimeOtmDraftAction(
  input: Parameters<typeof saveHrOvertimeDraft>[0],
) {
  return saveHrOvertimeDraft(input);
}

/** HRM-OTM-025 — draft → submitted. */
export async function submitHrTimeOtmDraftAction(
  input: Parameters<typeof submitHrOvertimeDraft>[0],
) {
  return submitHrOvertimeDraft(input);
}

export async function cancelHrTimeOtmRequestAction(
  input: Parameters<typeof cancelHrOvertimeRequest>[0],
) {
  return cancelHrOvertimeRequest(input);
}

/** HRM-OTM-020–022 — approve with calculation snapshot + optional compensatory credit. */
export async function approveHrTimeOtmRequestAction(
  input: ExecuteHrOvertimeApprovalInput,
) {
  return approveHrOvertimeRequest(input);
}

/** HRM-OTM-025 — approved → payroll_ready. */
export async function markHrTimeOtmPayrollReadyAction(
  input: Parameters<typeof markHrOvertimePayrollReady>[0],
) {
  return markHrOvertimePayrollReady(input);
}

/** HRM-OTM-023 / 025 — payroll_ready → paid (period lock). */
export async function markHrTimeOtmPaidAction(
  input: Parameters<typeof markHrOvertimePaid>[0],
) {
  return markHrOvertimePaid(input);
}
