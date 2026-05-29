import { hrRoutePaths } from "@/lib/hr-route.shared";
import {
  HrOrgChartSection,
  requireHrEmployeesRead,
} from "@afenda/feature-hr-suite/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Org chart — HR",
  description: "Reporting and department hierarchy for the active tenant.",
};

export default async function HrOrgChartPage() {
  try {
    const { organization } = await requireHrEmployeesRead();

    return (
      <div className="flex flex-col gap-surface-2xl">
        <SectionPanel
          headingLevel={1}
          title="Org chart"
          description="Slice 1 read-only org structure from workforce master data."
          aside={
            <Link
              className="type-caption text-muted underline-offset-2 hover:underline"
              href={hrRoutePaths.hub}
            >
              HR hub
            </Link>
          }
        />
        <HrOrgChartSection organizationId={organization.id} />
      </div>
    );
  } catch {
    return (
      <SectionPanel title="Access restricted">
        <p className="type-muted">You need hr.view to open the org chart.</p>
      </SectionPanel>
    );
  }
}
