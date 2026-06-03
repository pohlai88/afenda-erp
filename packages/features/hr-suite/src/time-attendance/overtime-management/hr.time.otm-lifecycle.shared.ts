import {
  canTransitionOtmStatus,
  formatOtmStatusLabel,
  HRM_OTM_VISIBLE_STATUSES,
  type HrOvertimeRequestStatus,
} from "@afenda/db";

/** HRM-OTM-025 — full overtime status lifecycle labels for authorized surfaces (AC 22). */
export function listHrTimeOtmVisibleStatusOptions(): ReadonlyArray<{
  value: HrOvertimeRequestStatus;
  label: string;
}> {
  return HRM_OTM_VISIBLE_STATUSES.map((status) => ({
    value: status,
    label: formatOtmStatusLabel(status),
  }));
}

export { canTransitionOtmStatus, formatOtmStatusLabel, HRM_OTM_VISIBLE_STATUSES };
