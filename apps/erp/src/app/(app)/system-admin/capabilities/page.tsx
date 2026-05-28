import {
  buildCapabilitiesListSurface,
  requireSystemAdminCapabilitiesRead,
  systemAdminCapabilitiesSurfaceKey,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { listExecutionCapabilities } from "@afenda/kernel/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Capabilities — System admin",
  description: "Execution capability metadata and route coverage.",
};

export default async function SystemAdminCapabilitiesPage() {
  await requireSystemAdminCapabilitiesRead();
  const capabilities = listExecutionCapabilities();

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Capabilities"
        description="Capability metadata comes from the execution kernel and is consumed by navigation, access checks, and diagnostics."
      />

      <GovernedPatternCListSection
        title="Execution capabilities"
        surfaceKey={systemAdminCapabilitiesSurfaceKey}
        listConfiguration={buildCapabilitiesListSurface({ capabilities })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}
