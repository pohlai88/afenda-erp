import type { BillingPostureSnapshot } from "../contracts/system-admin.billing-posture.contract";
import { SYSTEM_ADMIN_BILLING_SUMMARY_EXPORT_HEADER_ROW_COUNT } from "../contracts/system-admin.billing.limits.shared";

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function buildSystemAdminBillingSummaryCsv(
  snapshot: BillingPostureSnapshot,
) {
  const rows = [
    ["area", "signal", "value"],
    ["subscription", "plan", snapshot.subscription.planKey],
    ["subscription", "status", snapshot.subscription.status],
    [
      "subscription",
      "seats",
      `${snapshot.subscription.seatsUsed}/${snapshot.subscription.seatsPurchased}`,
    ],
    ["usage", "machine_events", String(snapshot.aiUsageEventCount)],
    ["usage", "lynx_runs", String(snapshot.lynxRunCount)],
    [
      "usage",
      "gateway_spend_usd",
      snapshot.gatewaySpendAvailable
        ? snapshot.gatewayCostUsd.toFixed(4)
        : "unavailable",
    ],
    ["entitlements", "count", String(snapshot.entitlements.length)],
    ["marketplace", "linkage", snapshot.marketplaceLinkage],
  ];

  return {
    csv: rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(",")).join("\n"),
    rowCount: rows.length - SYSTEM_ADMIN_BILLING_SUMMARY_EXPORT_HEADER_ROW_COUNT,
  };
}
