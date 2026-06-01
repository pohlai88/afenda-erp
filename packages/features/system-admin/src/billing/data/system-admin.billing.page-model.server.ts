import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { getSystemAdminBillingContacts } from "./system-admin.billing-contacts.repository.server";
import type { BillingPostureSnapshot } from "../contracts/system-admin.billing-posture.contract";
import {
  buildBillingPaymentRows,
  getBillingPostureSnapshot,
  loadBillingInvoiceRows,
} from "./system-admin.billing-posture.query.server";
import { evaluateBillingReadiness } from "./system-admin.billing.readiness.server";
import type { BillingReadinessReport } from "../contracts/system-admin.billing-readiness.contract";
import type { OrganizationSubscription } from "../contracts/system-admin.billing-subscription.contract";
import type {
  SystemAdminBillingContactRow,
  SystemAdminBillingEntitlementRow,
  SystemAdminBillingInvoiceRow,
  SystemAdminBillingPaymentRow,
} from "../contracts/system-admin.billing-list.contract";
import type { SystemAdminBillingPlanRow } from "../contracts/system-admin.billing-plans.contract";
import { mapStripeBillingPlansToRows } from "./system-admin.billing-plans.mapper.server";
import { resolveSystemAdminBillingDefaultPlanKey } from "./system-admin.billing-default-plan.shared";
import { systemAdminBillingAuditActions } from "../events/system-admin.billing.event";

export type SystemAdminBillingPageModel = {
  posture: BillingPostureSnapshot;
  subscription: OrganizationSubscription;
  entitlements: readonly SystemAdminBillingEntitlementRow[];
  contacts: readonly SystemAdminBillingContactRow[];
  invoices: readonly SystemAdminBillingInvoiceRow[];
  payments: readonly SystemAdminBillingPaymentRow[];
  readiness: BillingReadinessReport;
  plans: readonly SystemAdminBillingPlanRow[];
  defaultPlanKey: string;
  checkoutStatus?: "success" | "cancelled";
};

export async function buildSystemAdminBillingPageModel(input: {
  organizationId: string;
  organizationSlug: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  checkoutStatus?: "success" | "cancelled";
}): Promise<SystemAdminBillingPageModel> {
  const [posture, contacts, invoices] = await Promise.all([
    getBillingPostureSnapshot({
      organizationId: input.organizationId,
      organizationSlug: input.organizationSlug,
    }),
    getSystemAdminBillingContacts({ organizationId: input.organizationId }),
    loadBillingInvoiceRows({ organizationId: input.organizationId }),
  ]);

  const payments = buildBillingPaymentRows({
    stripeConfigured: posture.stripeConfigured,
    paymentMethodConfigured: posture.paymentMethodConfigured,
    stripeCustomerId: posture.stripeCustomerId,
  });

  const readiness = evaluateBillingReadiness({
    subscription: posture.subscription,
    gatewaySpendAvailable: posture.gatewaySpendAvailable,
    gatewaySpendAuthenticationFailed: posture.gatewaySpendAuthenticationFailed,
    entitlements: posture.entitlements,
    invoiceCount: invoices.length,
    paymentMethodConfigured: posture.paymentMethodConfigured,
  });

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: systemAdminBillingAuditActions.view,
    targetType: "organization_billing",
    targetId: input.organizationId,
    metadata: {
      readinessVerdict: readiness.verdict,
      planKey: posture.subscription.planKey,
      subscriptionStatus: posture.subscription.status,
      entitlementCount: posture.entitlements.length,
      contactCount: contacts.length,
    },
  });

  const plans = mapStripeBillingPlansToRows();
  const defaultPlanKey = resolveSystemAdminBillingDefaultPlanKey({
    plans,
    currentPlanKey: posture.subscription.planKey,
  });

  return {
    posture,
    subscription: posture.subscription,
    entitlements: posture.entitlements,
    contacts,
    invoices,
    payments,
    readiness,
    plans,
    defaultPlanKey,
    checkoutStatus: input.checkoutStatus,
  };
}
