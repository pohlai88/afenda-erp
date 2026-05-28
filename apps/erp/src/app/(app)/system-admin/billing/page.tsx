import { requireCapability } from "@afenda/auth/server";
import {
  buildBillingPostureListSurface,
  getBillingPostureSnapshot,
  systemAdminBillingSurfaceKey,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing — System admin",
  description: "Tenant usage counters and marketplace billing links.",
};

export default async function SystemAdminBillingPage() {
  const { organization } = await requireCapability("system-admin.billing.read");

  const snapshot = await getBillingPostureSnapshot({
    organizationId: organization.id,
  });

  const billingSurface = buildBillingPostureListSurface(snapshot);

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Billing posture"
        description="Usage signals for this tenant. Marketplace billing is managed in Vercel."
      />

      <GovernedPatternCListSection
        title="Usage summary"
        surfaceKey={systemAdminBillingSurfaceKey}
        listConfiguration={billingSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <SectionPanel
        title="Vercel Marketplace"
        description="Provision databases, auth, and integrations from the linked Vercel project."
      >
        <p className="text-sm text-muted-foreground">
          Open your Vercel project → Settings → Integrations to manage marketplace
          resources and billing for this deployment. AI Gateway custom reporting
          requires a valid API key from the AI Gateway console (Pro or Enterprise).
        </p>
      </SectionPanel>
    </div>
  );
}
