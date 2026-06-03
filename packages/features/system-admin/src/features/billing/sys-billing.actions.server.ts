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
import { parseSystemAdminBillingContactsFormData } from "../data/system-admin.billing-contacts-form.shared";
import { buildSystemAdminBillingSummaryCsv } from "../data/system-admin.billing-export.build.server";
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

export async function updateSystemAdminBillingContactsAction(
  _state: SystemAdminActionResult | undefined,
  formData: FormData,
): Promise<SystemAdminActionResult> {
  const { context, organization } = await requireSystemAdminBillingManage();

  const parsed = parseSystemAdminBillingContactsFormData(formData);
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

  const { csv, rowCount } = buildSystemAdminBillingSummaryCsv(snapshot);

  await writeExecutionAuditEvent({
    organizationId: organization.id,
    actorId: context.userId,
    actorType: context.actorType,
    action: systemAdminBillingAuditActions.export,
    targetType: "organization_billing",
    targetId: organization.id,
    metadata: { rowCount },
  });

  return systemAdminActionSuccess({ csv, rowCount });
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
