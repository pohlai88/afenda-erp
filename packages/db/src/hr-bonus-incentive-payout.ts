import { and, eq } from "drizzle-orm";
import type { AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { formatNumeric, HrBonusCommandError } from "./hr-bonus-incentive.shared";
import {
  hrBonusAcceleratorRules,
  hrBonusCommissionTiers,
  hrBonusPayoutFormulas,
} from "./schema/hr-bonus-incentive";

export type UpsertHrBonusPayoutFormulaInput = {
  organizationId: string;
  planId: string;
  formulaKind: (typeof hrBonusPayoutFormulas.$inferSelect)["formulaKind"];
  fixedAmount?: string | null;
  percentageRate?: string | null;
  performanceRatingWeight?: string | null;
  payoutFloor?: string | null;
  payoutCap?: string | null;
  currencyCode?: string | null;
};

export type UpsertHrBonusCommissionTierInput = {
  organizationId: string;
  planId: string;
  tierOrder: number;
  minThreshold: string;
  maxThreshold?: string | null;
  ratePercent: string;
};

export type UpsertHrBonusAcceleratorRuleInput = {
  organizationId: string;
  planId: string;
  thresholdPercent?: string;
  acceleratorRate: string;
};

function assertCapFloorOrder(floor: string | null | undefined, cap: string | null | undefined) {
  const floorNum = floor ? Number(floor) : null;
  const capNum = cap ? Number(cap) : null;
  if (
    floorNum !== null &&
    capNum !== null &&
    Number.isFinite(floorNum) &&
    Number.isFinite(capNum) &&
    floorNum > capNum
  ) {
    throw new HrBonusCommandError(
      "invalid_formula_config",
      "Payout floor cannot exceed payout cap.",
    );
  }
}

/** BON-009 + BON-012 — upsert payout formula with cap/floor. */
export async function upsertHrBonusPayoutFormulaInTx(
  db: AfendaTransaction,
  input: UpsertHrBonusPayoutFormulaInput,
): Promise<{ formulaId: string }> {
  assertCapFloorOrder(input.payoutFloor, input.payoutCap);

  const formulaId = createEntityId("hr_bon_formula");

  await db
    .insert(hrBonusPayoutFormulas)
    .values({
      id: formulaId,
      organizationId: input.organizationId,
      planId: input.planId,
      formulaKind: input.formulaKind,
      fixedAmount: input.fixedAmount ?? null,
      percentageRate: input.percentageRate ?? null,
      performanceRatingWeight: input.performanceRatingWeight ?? null,
      payoutFloor: input.payoutFloor ?? null,
      payoutCap: input.payoutCap ?? null,
      currencyCode: input.currencyCode ?? null,
    })
    .onConflictDoUpdate({
      target: [
        hrBonusPayoutFormulas.organizationId,
        hrBonusPayoutFormulas.planId,
      ],
      set: {
        formulaKind: input.formulaKind,
        fixedAmount: input.fixedAmount ?? null,
        percentageRate: input.percentageRate ?? null,
        performanceRatingWeight: input.performanceRatingWeight ?? null,
        payoutFloor: input.payoutFloor ?? null,
        payoutCap: input.payoutCap ?? null,
        currencyCode: input.currencyCode ?? null,
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrBonusPayoutFormulas.id })
    .from(hrBonusPayoutFormulas)
    .where(
      and(
        eq(hrBonusPayoutFormulas.organizationId, input.organizationId),
        eq(hrBonusPayoutFormulas.planId, input.planId),
      ),
    )
    .limit(1);

  return { formulaId: existing?.id ?? formulaId };
}

/** BON-010 — replace tiered commission rates for a plan. */
export async function replaceHrBonusCommissionTiersInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    planId: string;
    tiers: readonly UpsertHrBonusCommissionTierInput[];
  },
): Promise<{ tierCount: number }> {
  for (const tier of input.tiers) {
    const min = Number(tier.minThreshold);
    const max = tier.maxThreshold ? Number(tier.maxThreshold) : null;
    if (!Number.isFinite(min) || min < 0) {
      throw new HrBonusCommandError("invalid_tier_config");
    }
    if (max !== null && (!Number.isFinite(max) || max <= min)) {
      throw new HrBonusCommandError("invalid_tier_config");
    }
  }

  await db
    .delete(hrBonusCommissionTiers)
    .where(
      and(
        eq(hrBonusCommissionTiers.organizationId, input.organizationId),
        eq(hrBonusCommissionTiers.planId, input.planId),
      ),
    );

  if (input.tiers.length === 0) {
    return { tierCount: 0 };
  }

  await db.insert(hrBonusCommissionTiers).values(
    input.tiers.map((tier) => ({
      id: createEntityId("hr_bon_tier"),
      organizationId: input.organizationId,
      planId: input.planId,
      tierOrder: tier.tierOrder,
      minThreshold: formatNumeric(Number(tier.minThreshold)),
      maxThreshold: tier.maxThreshold
        ? formatNumeric(Number(tier.maxThreshold))
        : null,
      ratePercent: formatNumeric(Number(tier.ratePercent)),
    })),
  );

  return { tierCount: input.tiers.length };
}

/** BON-011 — upsert accelerator rule for overachievement. */
export async function upsertHrBonusAcceleratorRuleInTx(
  db: AfendaTransaction,
  input: UpsertHrBonusAcceleratorRuleInput,
): Promise<{ ruleId: string }> {
  const rate = Number(input.acceleratorRate);
  if (!Number.isFinite(rate) || rate < 0) {
    throw new HrBonusCommandError("invalid_accelerator_config");
  }

  const ruleId = createEntityId("hr_bon_accel");
  const thresholdPercent = input.thresholdPercent ?? "100";

  await db
    .insert(hrBonusAcceleratorRules)
    .values({
      id: ruleId,
      organizationId: input.organizationId,
      planId: input.planId,
      thresholdPercent: formatNumeric(Number(thresholdPercent)),
      acceleratorRate: formatNumeric(rate),
    })
    .onConflictDoUpdate({
      target: [
        hrBonusAcceleratorRules.organizationId,
        hrBonusAcceleratorRules.planId,
      ],
      set: {
        thresholdPercent: formatNumeric(Number(thresholdPercent)),
        acceleratorRate: formatNumeric(rate),
        updatedAt: new Date(),
      },
    });

  const [existing] = await db
    .select({ id: hrBonusAcceleratorRules.id })
    .from(hrBonusAcceleratorRules)
    .where(
      and(
        eq(hrBonusAcceleratorRules.organizationId, input.organizationId),
        eq(hrBonusAcceleratorRules.planId, input.planId),
      ),
    )
    .limit(1);

  return { ruleId: existing?.id ?? ruleId };
}
