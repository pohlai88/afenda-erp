/** Read-time posture for pending transitions — never persisted (compliance derived-status pattern). */
export type HrLifecyclePendingTransitionDuePosture = "scheduled" | "due";

export function derivePendingTransitionDuePosture(
  effectiveDate: Date,
  asOf: Date = new Date(),
): HrLifecyclePendingTransitionDuePosture {
  return effectiveDate <= asOf ? "due" : "scheduled";
}
