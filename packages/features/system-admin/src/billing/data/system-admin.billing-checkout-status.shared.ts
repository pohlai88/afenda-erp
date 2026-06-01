export type SystemAdminBillingCheckoutStatus = "success" | "cancelled";

export function parseSystemAdminBillingCheckoutStatus(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): SystemAdminBillingCheckoutStatus | undefined {
  const raw = searchParams?.checkout;
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (value === "success" || value === "cancelled") {
    return value;
  }

  return undefined;
}
