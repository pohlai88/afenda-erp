import { hrRoutePaths } from "@/lib/hr-route.shared";
import {
  HrPositionsSection,
  requireHrEmployeesRead,
} from "@afenda/feature-hr-suite/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Positions — HR",
  description: "Position catalog for the active tenant.",
};

export default async function HrPositionsPage() {
  try {
    const { organization } = await requireHrEmployeesRead();

    return (
      <div className="flex flex-col gap-surface-2xl">
        <SectionPanel
          headingLevel={1}
          title="Positions"
          description="Roles from hr_positions."
          aside={
            <Link
              className="type-caption text-muted underline-offset-2 hover:underline"
              href={hrRoutePaths.hub}
            >
              HR hub
            </Link>
          }
        />
        <HrPositionsSection organizationId={organization.id} />
      </div>
    );
  } catch {
    return (
      <SectionPanel title="Access restricted">
        <p className="type-muted">You need hr.view to open positions.</p>
      </SectionPanel>
    );
  }
}
