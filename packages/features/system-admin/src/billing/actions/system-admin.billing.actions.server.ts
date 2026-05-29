"use server";

import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";
import {
  systemAdminActionSuccess,
  type SystemAdminActionResult,
  zodActionFailure,
} from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminRoutePaths } from "../../overview/contracts/system-admin.route-paths.contract";
import { upsertSystemAdminBillingContacts } from "../data/system-admin.billing-contacts.repository.server";
import {
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  getBillingPostureSnapshot,
} from "../data/system-admin.billing-posture.query.server";
import { systemAdminBillingAuditActions } from "../events/system-admin.billing.event";
import {
  requireSystemAdminBillingExport,
  requireSystemAdminBillingManage,
} from "../policies/system-admin.billing.policy.server";
import { systemAdminBillingContactsSchema } from "../schemas/system-admin.billing-contact.schema";

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export async function updateSystemAdminBillingContactsAction(
  _state: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization } = await requireSystemAdminBillingManage();

  const parsed = systemAdminBillingContactsSchema.safeParse({
    primary: {
      name: formData.get("primaryName"),
      email: formData.get("primaryEmail"),
    },
    invoice:
      formData.get("invoiceName") && formData.get("invoiceEmail")
        ? {
            name: formData.get("invoiceName"),
            email: formData.get("invoiceEmail"),
          }
        : undefined,
    procurement:
      formData.get("procurementName") && formData.get("procurementEmail")
        ? {
            name: formData.get("procurementName"),
            email: formData.get("procurementEmail"),
          }
        : undefined,
  });

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  await upsertSystemAdminBillingContacts({
    organizationId: organization.id,
    actorAuthUserId: context.userId,
    contacts: parsed.data,
  });

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminBillingAuditActions.contactUpdate,
    targetType: "organization_billing_contacts",
    targetId: organization.id,
    metadata: {
      primaryEmail: parsed.data.primary.email,
      hasInvoiceContact: Boolean(parsed.data.invoice),
      hasProcurementContact: Boolean(parsed.data.procurement),
    },
  });

  revalidatePath(systemAdminRoutePaths.billing);

  return systemAdminActionSuccess();
}

export async function exportSystemAdminBillingSummaryAction(): Promise<
  SystemAdminActionResult<{ csv: string; rowCount: number }>
> {
  const { context, organization } = await requireSystemAdminBillingExport();

  const snapshot = await getBillingPostureSnapshot({
    organizationId: organization.id,
    organizationSlug: organization.slug,
  });

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

  const csv = rows
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\n");

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminBillingAuditActions.export,
    targetType: "organization_billing",
    targetId: organization.id,
    metadata: { rowCount: rows.length - 1 },
  });

  return systemAdminActionSuccess({ csv, rowCount: rows.length - 1 });
}

export async function startStripeCheckoutAction(input?: {
  planKey?: string;
}): Promise<SystemAdminActionResult<{ url: string }>> {
  const { organization } = await requireSystemAdminBillingManage();
  const snapshot = await getBillingPostureSnapshot({
    organizationId: organization.id,
    organizationSlug: organization.slug,
  });

  const session = await createStripeCheckoutSession({
    organizationId: organization.id,
    organizationSlug: organization.slug,
    seatQuantity: snapshot.subscription.seatsUsed,
    planKey: input?.planKey,
  });

  return systemAdminActionSuccess({ url: session.url });
}

export async function startStripeCheckoutWithPlanAction(input: {
  planKey: string;
}) {
  return startStripeCheckoutAction({ planKey: input.planKey });
}

export async function startStripeBillingPortalAction(): Promise<
  SystemAdminActionResult<{ url: string }>
> {
  const { organization } = await requireSystemAdminBillingManage();

  const session = await createStripeBillingPortalSession({
    organizationId: organization.id,
    organizationSlug: organization.slug,
  });

  return systemAdminActionSuccess({ url: session.url });
}
