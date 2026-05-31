/** HRM-EXP-021 — pure expense claim lifecycle (no I/O). */

export const HRM_EXP_ACTIONABLE_STATUSES = [
  "submitted",
  "under_review",
] as const;

export const HRM_EXP_VISIBLE_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "returned",
  "clarification_requested",
  "paid",
  "cancelled",
] as const;

export type HrExpenseClaimStatus = (typeof HRM_EXP_VISIBLE_STATUSES)[number];

export function formatExpClaimStatusLabel(status: HrExpenseClaimStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "submitted":
    case "under_review":
      return "Pending approval";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "returned":
      return "Returned";
    case "clarification_requested":
      return "Clarification requested";
    case "paid":
      return "Paid";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

/** Crash on invalid transitions (HRM-EXP-021 invariant). */
export function assertExpClaimStatusTransition(
  from: HrExpenseClaimStatus,
  to: HrExpenseClaimStatus,
): void {
  if (!canTransitionExpClaimStatus(from, to)) {
    throw new Error(`invalid_exp_claim_status_transition:${from}->${to}`);
  }
}

export function canTransitionExpClaimStatus(
  from: HrExpenseClaimStatus,
  to: HrExpenseClaimStatus,
): boolean {
  const transitions: Record<
    HrExpenseClaimStatus,
    readonly HrExpenseClaimStatus[]
  > = {
    draft: ["submitted", "cancelled"],
    submitted: [
      "under_review",
      "approved",
      "rejected",
      "returned",
      "clarification_requested",
      "cancelled",
    ],
    under_review: [
      "approved",
      "rejected",
      "returned",
      "clarification_requested",
      "cancelled",
    ],
    returned: ["submitted", "cancelled"],
    clarification_requested: ["submitted", "cancelled"],
    approved: ["paid"],
    rejected: [],
    cancelled: [],
    paid: [],
  };
  return transitions[from]?.includes(to) ?? false;
}
