import { desc, eq } from "drizzle-orm";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  organizationBilling,
  organizationBillingInvoices,
  type organizationSubscriptionStatusEnum,
} from "./schema";

export type OrganizationBillingRecord = {
  organizationId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  planKey: string;
  status: (typeof organizationSubscriptionStatusEnum.enumValues)[number];
  seatsPurchased: number;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  updatedAt: Date;
};

export type OrganizationBillingInvoiceRecord = {
  id: string;
  organizationId: string;
  stripeInvoiceId: string;
  status: string;
  amountDueCents: number;
  currency: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  hostedInvoiceUrl: string | null;
};

export async function getOrganizationBillingByOrganizationId(input: {
  organizationId: string;
}): Promise<OrganizationBillingRecord | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const row = await db.query.organizationBilling.findFirst({
      where: eq(organizationBilling.organizationId, input.organizationId),
    });

    if (!row) {
      return null;
    }

    return {
      organizationId: row.organizationId,
      stripeCustomerId: row.stripeCustomerId,
      stripeSubscriptionId: row.stripeSubscriptionId,
      planKey: row.planKey,
      status: row.status,
      seatsPurchased: row.seatsPurchased,
      currentPeriodStart: row.currentPeriodStart,
      currentPeriodEnd: row.currentPeriodEnd,
      updatedAt: row.updatedAt,
    };
  });
}

export async function getOrganizationBillingByStripeCustomerId(input: {
  stripeCustomerId: string;
}): Promise<OrganizationBillingRecord | null> {
  const { getDb } = await import("./client");
  const db = getDb();
  const row = await db.query.organizationBilling.findFirst({
    where: eq(organizationBilling.stripeCustomerId, input.stripeCustomerId),
  });

  if (!row) {
    return null;
  }

  return {
    organizationId: row.organizationId,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    planKey: row.planKey,
    status: row.status,
    seatsPurchased: row.seatsPurchased,
    currentPeriodStart: row.currentPeriodStart,
    currentPeriodEnd: row.currentPeriodEnd,
    updatedAt: row.updatedAt,
  };
}

export async function insertOrganizationBilling(input: {
  organizationId: string;
  stripeCustomerId: string;
  planKey?: string;
  status?: OrganizationBillingRecord["status"];
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(organizationBilling).values({
      organizationId: input.organizationId,
      stripeCustomerId: input.stripeCustomerId,
      planKey: input.planKey ?? "trial",
      status: input.status ?? "trial",
      seatsPurchased: 0,
    });
  });
}

export async function upsertOrganizationBillingFromStripe(input: {
  organizationId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  planKey: string;
  status: OrganizationBillingRecord["status"];
  seatsPurchased: number;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(organizationBilling)
      .values({
        organizationId: input.organizationId,
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        planKey: input.planKey,
        status: input.status,
        seatsPurchased: input.seatsPurchased,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
      })
      .onConflictDoUpdate({
        target: organizationBilling.organizationId,
        set: {
          stripeCustomerId: input.stripeCustomerId,
          stripeSubscriptionId: input.stripeSubscriptionId,
          planKey: input.planKey,
          status: input.status,
          seatsPurchased: input.seatsPurchased,
          currentPeriodStart: input.currentPeriodStart,
          currentPeriodEnd: input.currentPeriodEnd,
          updatedAt: new Date(),
        },
      });
  });
}

export async function listOrganizationBillingInvoices(input: {
  organizationId: string;
  limit?: number;
}): Promise<OrganizationBillingInvoiceRecord[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select()
      .from(organizationBillingInvoices)
      .where(eq(organizationBillingInvoices.organizationId, input.organizationId))
      .orderBy(desc(organizationBillingInvoices.periodEnd))
      .limit(input.limit ?? 24);

    return rows.map((row) => ({
      id: row.id,
      organizationId: row.organizationId,
      stripeInvoiceId: row.stripeInvoiceId,
      status: row.status,
      amountDueCents: row.amountDueCents,
      currency: row.currency,
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      hostedInvoiceUrl: row.hostedInvoiceUrl,
    }));
  });
}

export async function upsertOrganizationBillingInvoice(input: {
  organizationId: string;
  stripeInvoiceId: string;
  status: OrganizationBillingInvoiceRecord["status"];
  amountDueCents: number;
  currency: string;
  periodStart: Date | null;
  periodEnd: Date | null;
  hostedInvoiceUrl: string | null;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const id = createEntityId("inv");
    await db
      .insert(organizationBillingInvoices)
      .values({
        id,
        organizationId: input.organizationId,
        stripeInvoiceId: input.stripeInvoiceId,
        status: input.status as (typeof organizationBillingInvoices.$inferInsert)["status"],
        amountDueCents: input.amountDueCents,
        currency: input.currency,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        hostedInvoiceUrl: input.hostedInvoiceUrl,
      })
      .onConflictDoUpdate({
        target: organizationBillingInvoices.stripeInvoiceId,
        set: {
          status: input.status as (typeof organizationBillingInvoices.$inferInsert)["status"],
          amountDueCents: input.amountDueCents,
          currency: input.currency,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          hostedInvoiceUrl: input.hostedInvoiceUrl,
          updatedAt: new Date(),
        },
      });
  });
}
