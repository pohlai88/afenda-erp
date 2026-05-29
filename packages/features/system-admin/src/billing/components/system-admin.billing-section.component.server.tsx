import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { SystemAdminBillingPageModel } from "../data/system-admin.billing.page-model.server";
import {
  buildBillingContactsListSurface,
  buildBillingEntitlementsListSurface,
  buildBillingGovernanceListSurface,
  buildBillingInvoicesListSurface,
  buildBillingPaymentsListSurface,
  buildBillingPlansListSurface,
  buildBillingSubscriptionListSurface,
  buildBillingUsageListSurface,
  systemAdminBillingContactsSurfaceKey,
  systemAdminBillingEntitlementsSurfaceKey,
  systemAdminBillingGovernanceSurfaceKey,
  systemAdminBillingInvoicesSurfaceKey,
  systemAdminBillingPaymentsSurfaceKey,
  systemAdminBillingPlansSurfaceKey,
  systemAdminBillingSubscriptionSurfaceKey,
  systemAdminBillingUiCopy,
  systemAdminBillingUsageSurfaceKey,
} from "../surface";
import { SystemAdminBillingContactsForm } from "./system-admin.billing-contacts-form.component.client";
import { SystemAdminBillingExportButton } from "./system-admin.billing-export-button.component.client";
import { SystemAdminBillingCheckoutBanner } from "./system-admin.billing-checkout-banner.component.client";
import { SystemAdminBillingPlanCheckout } from "./system-admin.billing-plan-checkout.component.client";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";

type UpdateBillingContactsAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

type ExportBillingSummaryAction = () => Promise<
  SystemAdminActionResult<{ csv: string; rowCount: number }>
>;

type StartStripeCheckoutWithPlanAction = (input: {
  planKey: string;
}) => Promise<SystemAdminActionResult<{ url: string }>>;

type StartStripeBillingPortalAction = () => Promise<
  SystemAdminActionResult<{ url: string }>
>;

export function SystemAdminBillingSection({
  posture,
  subscription,
  entitlements,
  contacts,
  invoices,
  payments,
  readiness,
  plans,
  defaultPlanKey,
  checkoutStatus,
  canManageContacts,
  canManageStripe,
  canExport,
  updateBillingContactsAction,
  exportBillingSummaryAction,
  startStripeCheckoutWithPlanAction,
  startStripeBillingPortalAction,
}: SystemAdminBillingPageModel & {
  canManageContacts: boolean;
  canManageStripe: boolean;
  canExport: boolean;
  updateBillingContactsAction: UpdateBillingContactsAction;
  exportBillingSummaryAction: ExportBillingSummaryAction;
  startStripeCheckoutWithPlanAction: StartStripeCheckoutWithPlanAction;
  startStripeBillingPortalAction: StartStripeBillingPortalAction;
}) {
  const copy = systemAdminBillingUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
        aside={
          canExport ? (
            <SystemAdminBillingExportButton
              exportBillingSummaryAction={exportBillingSummaryAction}
            />
          ) : null
        }
      />

      <SystemAdminBillingCheckoutBanner checkoutStatus={checkoutStatus} />

      {!posture.stripeConfigured ? (
        <SectionPanel
          title={copy.stripe.configurationTitle}
          description={copy.stripe.configurationBody}
        />
      ) : null}

      {posture.stripeConfigured ? (
        <SectionPanel
          title={copy.plans.checkoutTitle}
          description={copy.plans.checkoutHint}
        >
          <SystemAdminBillingPlanCheckout
            plans={plans}
            defaultPlanKey={defaultPlanKey}
            canManage={canManageStripe}
            startStripeCheckoutWithPlanAction={startStripeCheckoutWithPlanAction}
            startStripeBillingPortalAction={startStripeBillingPortalAction}
          />
        </SectionPanel>
      ) : null}

      {plans.length > 0 ? (
        <GovernedPatternCListSection
          title={copy.plans.title}
          surfaceKey={systemAdminBillingPlansSurfaceKey}
          listConfiguration={buildBillingPlansListSurface({ plans })}
          parentAccessAllowed
          layout="embedded"
        />
      ) : null}

      <GovernedPatternCListSection
        title={copy.governance.title}
        surfaceKey={systemAdminBillingGovernanceSurfaceKey}
        listConfiguration={buildBillingGovernanceListSurface({
          readiness,
          subscription,
          seatCount: subscription.seatsUsed,
          gatewaySpendAvailable: posture.gatewaySpendAvailable,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={copy.subscription.title}
        surfaceKey={systemAdminBillingSubscriptionSurfaceKey}
        listConfiguration={buildBillingSubscriptionListSurface({ subscription })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={copy.usage.title}
        surfaceKey={systemAdminBillingUsageSurfaceKey}
        listConfiguration={buildBillingUsageListSurface(posture)}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={copy.entitlements.title}
        description={copy.entitlements.description}
        surfaceKey={systemAdminBillingEntitlementsSurfaceKey}
        listConfiguration={buildBillingEntitlementsListSurface({ entitlements })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={copy.invoices.title}
        description={copy.invoices.description}
        surfaceKey={systemAdminBillingInvoicesSurfaceKey}
        listConfiguration={buildBillingInvoicesListSurface({ invoices })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={copy.payments.title}
        description={copy.payments.description}
        surfaceKey={systemAdminBillingPaymentsSurfaceKey}
        listConfiguration={buildBillingPaymentsListSurface({ payments })}
        parentAccessAllowed
        layout="embedded"
      />

      {canManageContacts ? (
        <SectionPanel
          title={copy.contacts.formTitle}
          description={copy.contacts.formDescription}
        >
          <SystemAdminBillingContactsForm
            contacts={contacts}
            updateBillingContactsAction={updateBillingContactsAction}
          />
        </SectionPanel>
      ) : null}

      <GovernedPatternCListSection
        title={copy.contacts.title}
        surfaceKey={systemAdminBillingContactsSurfaceKey}
        listConfiguration={buildBillingContactsListSurface({ contacts })}
        parentAccessAllowed
        layout="embedded"
      />

      <SectionPanel
        title={copy.marketplace.title}
        description={copy.marketplace.description}
      >
        <p className="type-muted">{copy.marketplace.body}</p>
      </SectionPanel>
    </div>
  );
}

export function SystemAdminBillingAccessDenied() {
  const copy = systemAdminBillingUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />
      <SectionPanel title={copy.accessDenied.title}>
        <p className="type-muted">{copy.accessDenied.description}</p>
      </SectionPanel>
    </div>
  );
}
