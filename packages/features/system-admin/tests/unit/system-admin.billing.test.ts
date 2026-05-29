import { describe, expect, it } from "vitest";
import { evaluateBillingReadiness } from "../../src/billing/data/system-admin.billing.readiness.server";

describe("evaluateBillingReadiness", () => {
  const baseSubscription = {
    organizationId: "org-1",
    planKey: "staged",
    status: "active" as const,
    seatsPurchased: 5,
    seatsUsed: 3,
    startsAt: "2026-01-01",
    providerLinkage: "Vercel",
  };

  it("returns ready when subscription and payment signals are healthy", () => {
    const report = evaluateBillingReadiness({
      subscription: baseSubscription,
      gatewaySpendAvailable: true,
      gatewaySpendAuthenticationFailed: false,
      entitlements: [{ id: "lynx", key: "lynx", label: "Lynx", status: "Included", source: "ai" }],
      invoiceCount: 1,
      paymentMethodConfigured: true,
    });

    expect(report.verdict).toBe("ready");
    expect(report.issues).toHaveLength(0);
  });

  it("returns blocked when subscription is suspended", () => {
    const report = evaluateBillingReadiness({
      subscription: { ...baseSubscription, status: "suspended" },
      gatewaySpendAvailable: false,
      gatewaySpendAuthenticationFailed: false,
      entitlements: [],
      invoiceCount: 0,
      paymentMethodConfigured: false,
    });

    expect(report.verdict).toBe("blocked");
    expect(report.issues.some((issue) => issue.id === "blocked:subscription")).toBe(
      true,
    );
  });
});
