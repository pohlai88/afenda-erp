import { HRM_OTM_MINUTES_PER_LEAVE_DAY } from "./hr-otm-calculation.shared";

/** Convert payable OT minutes to compensatory leave days (HRM-OTM-022). */
export function otmPayableMinutesToCompensatoryLeaveDays(
  payableMinutes: number,
  minutesPerLeaveDay = HRM_OTM_MINUTES_PER_LEAVE_DAY,
): number {
  const minutes = Math.max(0, Math.floor(payableMinutes));
  const dayMinutes = Math.max(1, Math.floor(minutesPerLeaveDay));
  if (minutes === 0) {
    return 0;
  }
  return Number((minutes / dayMinutes).toFixed(4));
}
