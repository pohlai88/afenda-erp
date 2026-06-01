import { systemAdminBillingUiCopy } from "@afenda/feature-system-admin/metadata";
import {
  buildSystemAdminBillingPageModel,
  exportSystemAdminBillingSummaryAction,
  parseSystemAdminBillingCheckoutStatus,
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

export default async function SystemAdminBillingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let organization: Awaited<
    ReturnType<typeof requireSystemAdminBillingRead>
  >["organization"];
  let context: Awaited<
    ReturnType<typeof requireSystemAdminBillingRead>
  >["context"];

  try {
    ({ organization, context } = await requireSystemAdminBillingRead());
  } catch {
    return (
      <div data-testid="system-admin-billing-access-denied" className="contents">
        <SystemAdminBillingAccessDenied />
      </div>
    );
  }

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
    checkoutStatus: parseSystemAdminBillingCheckoutStatus(resolvedSearchParams),
  });

  return (
    <div data-testid="system-admin-billing-page" className="contents">
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
    </div>
  );
}
