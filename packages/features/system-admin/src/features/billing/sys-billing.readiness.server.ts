import type {
  BillingReadinessIssue,
  BillingReadinessReport,
  BillingReadinessVerdict,
} from "./sys-billing-readiness.contract";
import type { OrganizationSubscription } from "./sys-billing-subscription.contract";
import type { SystemAdminBillingEntitlementRow } from "./sys-billing-list.contract";

function issue(
  id: string,
  title: string,
  description: string,
): BillingReadinessIssue {
  return { id, title, description };
}

function resolveVerdict(
  issues: readonly BillingReadinessIssue[],
): BillingReadinessVerdict {
  if (issues.some((entry) => entry.id.startsWith("blocked:"))) {
    return "blocked";
  }

  if (issues.length > 0) {
    return "warning";
  }

  return "ready";
}

export function evaluateBillingReadiness(input: {
  subscription: OrganizationSubscription;
  gatewaySpendAvailable: boolean;
  gatewaySpendAuthenticationFailed: boolean;
  entitlements: readonly SystemAdminBillingEntitlementRow[];
  invoiceCount: number;
  paymentMethodConfigured: boolean;
}): BillingReadinessReport {
  const issues: BillingReadinessIssue[] = [];

  if (
    input.subscription.status === "suspended" ||
    input.subscription.status === "cancelled"
  ) {
    issues.push(
      issue(
        "blocked:subscription",
        "Subscription is not active",
        `Commercial status is ${input.subscription.status}. Restore subscription before relying on entitlements.`,
      ),
    );
  }

  if (input.subscription.status === "past_due") {
    issues.push(
      issue(
        "past-due",
        "Subscription is past due",
        "Resolve outstanding invoices before module entitlements are treated as current.",
      ),
    );
  }

  if (input.gatewaySpendAuthenticationFailed) {
    issues.push(
      issue(
        "blocked:gateway-auth",
        "AI Gateway billing credentials rejected",
        "Refresh AI_GATEWAY_API_KEY so usage and spend signals stay trustworthy.",
      ),
    );
  }

  if (!input.paymentMethodConfigured && input.subscription.status !== "trial") {
    issues.push(
      issue(
        "payment-method",
        "Payment method not verified",
        "Marketplace billing is managed in Vercel; confirm payment method before production cutover.",
      ),
    );
  }

  const disabledEntitlements = input.entitlements.filter((row) =>
    row.status.toLowerCase().includes("disabled"),
  );
  if (disabledEntitlements.length > 0) {
    issues.push(
      issue(
        "entitlement-conflicts",
        "Disabled commercial entitlements remain configured",
        `${disabledEntitlements.length} entitlement row(s) are disabled while usage may still accrue.`,
      ),
    );
  }

  if (input.invoiceCount === 0 && input.subscription.status === "active") {
    issues.push(
      issue(
        "invoices",
        "No invoices available in Afenda",
        "Commercial invoices are not synced yet. Review Vercel Marketplace until provider billing is connected.",
      ),
    );
  }

  return {
    verdict: resolveVerdict(issues),
    issues,
  };
}
