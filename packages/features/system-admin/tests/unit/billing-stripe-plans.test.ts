import { afterEach, describe, expect, it } from "vitest";
import {
  listStripeBillingPlans,
  resolveStripeBillingPlanKeyFromPriceId,
  resolveStripeBillingPlanPriceId,
} from "@afenda/billing";

describe("stripe billing plans", () => {
  const previousEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...previousEnv };
  });

  it("resolves configured plan keys from price ids", () => {
    process.env.STRIPE_PRICE_PRO = "price_pro_test";
    process.env.STRIPE_PRICE_TEAM = "price_team_test";
    process.env.STRIPE_DEFAULT_PLAN_KEY = "pro";

    expect(resolveStripeBillingPlanKeyFromPriceId("price_pro_test")).toBe("pro");
    expect(resolveStripeBillingPlanKeyFromPriceId("price_team_test")).toBe("team");
    expect(resolveStripeBillingPlanPriceId("pro")).toBe("price_pro_test");
  });

  it("falls back to STRIPE_PRICE_ID for default plan", () => {
    process.env.STRIPE_PRICE_ID = "price_legacy";
    process.env.STRIPE_DEFAULT_PLAN_KEY = "pro";

    const plans = listStripeBillingPlans();
    expect(plans.some((plan) => plan.key === "pro" && plan.priceId === "price_legacy")).toBe(
      true,
    );
  });
});
