import {
  HR_CPM_LOCKED_STATUSES,
  HR_CPM_EDITABLE_STATUSES,
} from "../schemas/hr.payroll.cpm-constants.shared";

export {
  isHrCompensationRecommendationLocked,
  HR_COMPENSATION_LOCKED_STATUSES,
  HR_COMPENSATION_EDITABLE_STATUSES,
} from "@afenda/db";

export { HR_CPM_LOCKED_STATUSES, HR_CPM_EDITABLE_STATUSES };

export function isHrCpmRecommendationLocked(
  status: string,
  lockedAt: Date | null | undefined,
): boolean {
  return (
    lockedAt != null ||
    (HR_CPM_LOCKED_STATUSES as readonly string[]).includes(status)
  );
}
