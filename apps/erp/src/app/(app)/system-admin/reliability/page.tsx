import {
  buildCronHealthListSurface,
  systemAdminCronSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  getCronHealthSurfaceRows,
  requireSystemAdminReliabilityRead,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reliability — System admin",
  description: "Cron routes, workflow sweeps, and observability drain posture.",
};

export default async function SystemAdminReliabilityPage() {
  await requireSystemAdminReliabilityRead();

  const cronRows = await getCronHealthSurfaceRows();
  const cronSurface = buildCronHealthListSurface({ rows: cronRows });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Reliability"
        description="Scheduled jobs and operational drain endpoints for this deployment."
      />

      <GovernedPatternCListSection
        title="Cron routes"
        description="Configured in vercel.json. Each route validates CRON_SECRET."
        surfaceKey={systemAdminCronSurfaceKey}
        listConfiguration={cronSurface}
        parentAccessAllowed
        layout="embedded"
      />

      <SectionPanel
        title="Workflow sweeps"
        description="Durable workflow recovery runs through the solution console."
      >
        <Link
          href="/solution-console/workflows"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Open workflow sessions
        </Link>
      </SectionPanel>

      <SectionPanel
        title="Observability drain"
        description="Log drain handler for centralized observability export."
      >
        <p className="text-sm text-muted-foreground">
          Route: <code className="text-foreground">/api/observability/drain</code>
        </p>
      </SectionPanel>
    </div>
  );
}
