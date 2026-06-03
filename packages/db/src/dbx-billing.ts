import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organizationIdColumn, timestampColumns } from "./dbx-common";
import { organizations } from "./dbx-organizations";

export const organizationSubscriptionStatusEnum = pgEnum(
  "organization_subscription_status",
  ["trial", "active", "past_due", "suspended", "cancelled"],
);

export const organizationBilling = pgTable(
  "organization_billing",
  {
    organizationId: organizationIdColumn()
      .primaryKey()
      .references(() => organizations.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id"),
    planKey: text("plan_key").notNull().default("trial"),
    status: organizationSubscriptionStatusEnum("status")
      .notNull()
      .default("trial"),
    seatsPurchased: integer("seats_purchased").notNull().default(0),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("organization_billing_stripe_customer_uidx").on(
      table.stripeCustomerId,
    ),
    uniqueIndex("organization_billing_stripe_subscription_uidx").on(
      table.stripeSubscriptionId,
    ),
  ],
);

export const organizationBillingInvoiceStatusEnum = pgEnum(
  "organization_billing_invoice_status",
  ["draft", "open", "paid", "void", "uncollectible"],
);

export const organizationBillingInvoices = pgTable(
  "organization_billing_invoices",
  {
    id: text("id").primaryKey(),
    organizationId: organizationIdColumn()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    stripeInvoiceId: text("stripe_invoice_id").notNull(),
    status: organizationBillingInvoiceStatusEnum("status").notNull(),
    amountDueCents: integer("amount_due_cents").notNull().default(0),
    currency: text("currency").notNull().default("usd"),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    hostedInvoiceUrl: text("hosted_invoice_url"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("organization_billing_invoices_stripe_uidx").on(
      table.stripeInvoiceId,
    ),
    index("organization_billing_invoices_org_idx").on(table.organizationId),
  ],
);

export const organizationBillingRelations = relations(
  organizationBilling,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationBilling.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const organizationBillingInvoicesRelations = relations(
  organizationBillingInvoices,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationBillingInvoices.organizationId],
      references: [organizations.id],
    }),
  }),
);
