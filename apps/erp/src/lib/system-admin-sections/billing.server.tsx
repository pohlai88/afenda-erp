import { systemAdminBillingUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminBillingPageModel,
  exportSystemAdminBillingSummaryAction,
  requireSystemAdminBillingRead,
  startStripeBillingPortalAction,
  startStripeCheckoutWithPlanAction,
  SystemAdminBillingAccessDenied,
  SystemAdminBillingSection,
  updateSystemAdminBillingContactsAction,
} from "@afenda/feature-system-admin/server";
import { hasExecutionPermission } from "@afenda/kernel/execution";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing — System admin",
  description: systemAdminBillingUiCopy.page.description,
};

function resolveCheckoutStatus(
  searchParams: Record<string, string | string[] | undefined> | undefined,
) {
  const raw = searchParams?.checkout;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "success" || value === "cancelled") {
    return value;
  }

  return undefined;
}

export default async function SystemAdminBillingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  try {
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const { organization, context } = await requireSystemAdminBillingRead();
    const canManageStripe = hasExecutionPermission(
      context,
      "system-admin.billing.manage",
    );
    const canManageContacts = canManageStripe;
    const canExport = hasExecutionPermission(
      context,
      "system-admin.billing.export",
    );

    const pageModel = await buildSystemAdminBillingPageModel({
      organizationId: organization.id,
      organizationSlug: organization.slug,
      actorId: context.userId,
      actorType: context.actorType,
      checkoutStatus: resolveCheckoutStatus(resolvedSearchParams),
    });

    return (
      <SystemAdminBillingSection
        {...pageModel}
        canManageContacts={canManageContacts}
        canManageStripe={canManageStripe}
        canExport={canExport}
        updateBillingContactsAction={updateSystemAdminBillingContactsAction}
        exportBillingSummaryAction={exportSystemAdminBillingSummaryAction}
        startStripeCheckoutWithPlanAction={startStripeCheckoutWithPlanAction}
        startStripeBillingPortalAction={startStripeBillingPortalAction}
      />
    );
  } catch {
    return <SystemAdminBillingAccessDenied />;
  }
}
