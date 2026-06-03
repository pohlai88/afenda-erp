/** Read-time probation review posture — never stored (compliance derived-status pattern). */
export type HrLifecycleProbationReviewPosture = "upcoming" | "due" | "overdue";

export function deriveProbationReviewPosture(
  probationEndDate: Date,
  asOf: Date = new Date(),
): HrLifecycleProbationReviewPosture {
  const end = probationEndDate.getTime();
  const now = asOf.getTime();
  if (end < now) {
    return "overdue";
  }
  const daysUntil = (end - now) / (1000 * 60 * 60 * 24);
  if (daysUntil <= 14) {
    return "due";
  }
  return "upcoming";
}
