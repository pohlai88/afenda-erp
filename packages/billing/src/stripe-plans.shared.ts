import { z } from "zod";

export type StripeBillingPlanKey = "hobby" | "team" | "pro" | "business";

export type StripeBillingPlan = {
  key: StripeBillingPlanKey;
  name: string;
  description: string;
  priceId: string;
  unitAmountMinor: number;
  currency: string;
  interval: "month";
};

const planKeySchema = z.enum(["hobby", "team", "pro", "business"]);

const catalog: ReadonlyArray<{
  key: StripeBillingPlanKey;
  name: string;
  description: string;
  envKey: string;
  unitAmountMinor: number;
  currency: string;
}> = [
  {
    key: "hobby",
    name: "Hobby",
    description: "Individual operators exploring Afenda.",
    envKey: "STRIPE_PRICE_HOBBY",
    unitAmountMinor: 0,
    currency: "myr",
  },
  {
    key: "team",
    name: "Team",
    description: "Growing teams with core ERP modules.",
    envKey: "STRIPE_PRICE_TEAM",
    unitAmountMinor: 1500,
    currency: "myr",
  },
  {
    key: "pro",
    name: "Pro",
    description: "Professional orgs with Lynx and advanced governance.",
    envKey: "STRIPE_PRICE_PRO",
    unitAmountMinor: 9900,
    currency: "myr",
  },
  {
    key: "business",
    name: "Business",
    description: "Enterprise controls, audit, and scale.",
    envKey: "STRIPE_PRICE_BUSINESS",
    unitAmountMinor: 29900,
    currency: "myr",
  },
];

export function listStripeBillingPlans(): readonly StripeBillingPlan[] {
  const fallbackPriceId = process.env.STRIPE_PRICE_ID?.trim();
  const defaultKey = planKeySchema.safeParse(
    process.env.STRIPE_DEFAULT_PLAN_KEY?.trim(),
  ).success
    ? (process.env.STRIPE_DEFAULT_PLAN_KEY?.trim() as StripeBillingPlanKey)
    : "pro";

  return catalog.flatMap((entry) => {
    const priceId =
      process.env[entry.envKey]?.trim() ||
      (entry.key === defaultKey ? fallbackPriceId : undefined);

    if (!priceId) {
      return [];
    }

    return [
      {
        key: entry.key,
        name: entry.name,
        description: entry.description,
        priceId,
        unitAmountMinor: entry.unitAmountMinor,
        currency: entry.currency,
        interval: "month" as const,
      },
    ];
  });
}

export function resolveStripeBillingPlanKeyFromPriceId(priceId: string) {
  const plan = listStripeBillingPlans().find((entry) => entry.priceId === priceId);
  return plan?.key ?? priceId;
}

export function resolveStripeBillingPlanPriceId(planKey: string) {
  const parsed = planKeySchema.safeParse(planKey);
  if (!parsed.success) {
    throw new Error(`Unknown billing plan key: ${planKey}`);
  }

  const plan = listStripeBillingPlans().find((entry) => entry.key === parsed.data);
  if (!plan) {
    throw new Error(`Billing plan ${planKey} is not configured in the environment.`);
  }

  return plan.priceId;
}

export function formatStripePlanPrice(plan: StripeBillingPlan) {
  if (plan.unitAmountMinor === 0) {
    return `Free / ${plan.interval}`;
  }

  const amount = (plan.unitAmountMinor / 100).toFixed(2);
  return `${amount.toUpperCase()} ${plan.currency.toUpperCase()} / ${plan.interval}`;
}
