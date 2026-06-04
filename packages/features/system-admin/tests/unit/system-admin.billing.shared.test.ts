import { describe, expect, it } from "vitest";

import type { BillingPostureSnapshot } from "../../src/features/billing/sys-billing-posture.contract";
import { buildSystemAdminBillingSummaryCsv } from "../../src/features/billing/sys-billing-export.build.server";
import { parseSystemAdminBillingContactsFormData } from "../../src/features/billing/sys-billing-contacts-form.shared";
import { resolveSystemAdminBillingDefaultPlanKey } from "../../src/features/billing/sys-billing-default-plan.shared";
import { parseSystemAdminBillingCheckoutStatus } from "../../src/features/billing/sys-billing-checkout-status.shared";
import { systemAdminBillingAuditActions } from "../../src/features/billing/sys-billing.event";

const snapshotFixture: BillingPostureSnapshot = {
  subscription: {
    organizationId: "org_1",
    planKey: "pro",
    status: "active",
    seatsPurchased: 10,
    seatsUsed: 4,
    startsAt: "2026-01-01",
    providerLinkage: "Stripe",
  },
  entitlements: [{ id: "1", key: "lynx", label: "Lynx", status: "Included", source: "ai" }],
  aiUsageEventCount: 12,
  lynxRunCount: 3,
  gatewaySpendAvailable: true,
  gatewaySpendAuthenticationFailed: false,
  gatewaySpendEntryCount: 2,
  gatewayCostUsd: 1.2345,
  marketplaceLinkage: "Stripe",
  stripeConfigured: true,
  paymentMethodConfigured: true,
  stripeCustomerId: "cus_123",
};

describe("billing shared helpers", () => {
  it("uses hyphenated audit action keys", () => {
    expect(systemAdminBillingAuditActions.export).toBe("system-admin.billing.export");
    expect(systemAdminBillingAuditActions.contactUpdate).toBe(
      "system-admin.billing.contact.update",
    );
  });

  it("builds billing summary csv with data rows", () => {
    const { csv, rowCount } = buildSystemAdminBillingSummaryCsv(snapshotFixture);

    expect(rowCount).toBe(8);
    expect(csv).toContain("subscription,plan,pro");
    expect(csv).toContain("gateway_spend_usd,1.2345");
  });

  it("parses billing contacts with trimmed optional pairs", () => {
    const formData = new FormData();
    formData.set("primaryName", " Primary ");
    formData.set("primaryEmail", " primary@example.com ");
    formData.set("invoiceName", "Invoice");
    formData.set("invoiceEmail", "invoice@example.com");

    const parsed = parseSystemAdminBillingContactsFormData(formData);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.primary.name).toBe("Primary");
      expect(parsed.data.invoice?.email).toBe("invoice@example.com");
    }
  });

  it("rejects incomplete optional contact pairs", () => {
    const formData = new FormData();
    formData.set("primaryName", "Primary");
    formData.set("primaryEmail", "primary@example.com");
    formData.set("invoiceName", "Invoice only");

    const parsed = parseSystemAdminBillingContactsFormData(formData);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.invoice).toBeUndefined();
    }
  });

  it("resolves default plan key from current subscription", () => {
    expect(
      resolveSystemAdminBillingDefaultPlanKey({
        plans: [
          {
            id: "plan_starter",
            key: "starter",
            name: "Starter",
            description: "Starter plan",
            priceLabel: "$10",
            priceId: "price_starter",
          },
        ],
        currentPlanKey: "starter",
      }),
    ).toBe("starter");
  });

  it("parses checkout status search params", () => {
    expect(parseSystemAdminBillingCheckoutStatus({ checkout: "success" })).toBe(
      "success",
    );
    expect(parseSystemAdminBillingCheckoutStatus({ checkout: "invalid" })).toBeUndefined();
  });
});
