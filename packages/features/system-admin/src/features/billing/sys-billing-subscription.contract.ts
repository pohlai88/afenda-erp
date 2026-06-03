export type OrganizationSubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "suspended"
  | "cancelled";

export type OrganizationSubscription = {
  organizationId: string;
  planKey: string;
  status: OrganizationSubscriptionStatus;
  seatsPurchased: number;
  seatsUsed: number;
  startsAt: string;
  renewsAt?: string;
  providerLinkage: string;
};

export function formatOrganizationSubscriptionStatusLabel(
  status: OrganizationSubscriptionStatus,
) {
  switch (status) {
    case "trial":
      return "Trial";
    case "active":
      return "Active";
    case "past_due":
      return "Past due";
    case "suspended":
      return "Suspended";
    case "cancelled":
      return "Cancelled";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}
