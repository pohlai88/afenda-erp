import {
  assertExpClaimStatusTransition,
  canTransitionExpClaimStatus,
  formatExpClaimStatusLabel,
  HRM_EXP_VISIBLE_STATUSES,
  type HrExpenseClaimStatus,
} from "@afenda/db";

/** HRM-EXP-021 — claim status labels for authorized surfaces. */
export function listHrPayrollExpenseVisibleStatusOptions(): ReadonlyArray<{
  value: HrExpenseClaimStatus;
  label: string;
}> {
  return HRM_EXP_VISIBLE_STATUSES.map((status) => ({
    value: status,
    label: formatExpClaimStatusLabel(status),
  }));
}

export {
  assertExpClaimStatusTransition,
  canTransitionExpClaimStatus,
  formatExpClaimStatusLabel,
  HRM_EXP_VISIBLE_STATUSES,
};
