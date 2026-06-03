import { createHrOvertimeApprovalOnSubmit } from "@afenda/db";

/** HRM-OTM-015 — seed pending approval workflow on submit. */
export async function createHrTimeOtmApprovalOnSubmit(
  input: Parameters<typeof createHrOvertimeApprovalOnSubmit>[0],
) {
  return createHrOvertimeApprovalOnSubmit(input);
}

export {
  decideHrOvertimeRequest,
  bulkApproveHrOvertimeRequests,
  decideHrOvertimeException,
  resolveOtmSubmissionApproversForRequest,
} from "@afenda/db";
