import { hasExecutionPermission } from "@afenda/kernel/execution";

import { exportSystemAdminBillingSummaryAction, startStripeBillingPortalAction, startStripeCheckoutWithPlanAction, updateSystemAdminBillingContactsAction } from "./sys-billing.actions.server";
import { buildSystemAdminBillingPageModel } from "./sys-billing.page-model.server";
import { parseSystemAdminBillingCheckoutStatus } from "./sys-billing-checkout-status.shared";
import { requireSystemAdminBillingRead } from "./sys-billing.policy.server";
import {
  SystemAdminBillingAccessDenied,
  SystemAdminBillingSection,
} from "./sys-billing-section.component.server";

type SystemAdminBillingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function SystemAdminBillingPage({
  searchParams,
}: SystemAdminBillingPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireSystemAdminBillingRead>>;

  try {
    guard = await requireSystemAdminBillingRead();
  } catch {
    return (
      <div data-testid="system-admin-billing-access-denied" className="contents">
        <SystemAdminBillingAccessDenied />
      </div>
    );
  }

  const canManageStripe = hasExecutionPermission(
    guard.context,
    "system-admin.billing.manage",
  );
  const canManageContacts = canManageStripe;
  const canExport = hasExecutionPermission(
    guard.context,
    "system-admin.billing.export",
  );

  const pageModel = await buildSystemAdminBillingPageModel({
    organizationId: guard.organization.id,
    organizationSlug: guard.organization.slug,
    actorId: guard.context.userId,
    actorType: guard.context.actorType,
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
