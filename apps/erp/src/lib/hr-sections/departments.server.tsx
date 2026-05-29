import { hrRoutePaths } from "@/lib/hr-route.shared";
import {
  HrDepartmentsSection,
  requireHrEmployeesRead,
} from "@afenda/feature-hr/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Departments — HR",
  description: "Organization units for the active tenant.",
};

export default async function HrDepartmentsPage() {
  try {
    const { organization } = await requireHrEmployeesRead();

    return (
      <div className="flex flex-col gap-surface-2xl">
        <SectionPanel
          headingLevel={1}
          title="Departments"
          description="Org units from hr_departments."
          aside={
            <Link
              className="type-caption text-muted underline-offset-2 hover:underline"
              href={hrRoutePaths.hub}
            >
              HR hub
            </Link>
          }
        />
        <HrDepartmentsSection organizationId={organization.id} />
      </div>
    );
  } catch {
    return (
      <SectionPanel title="Access restricted">
        <p className="type-muted">You need hr.view to open departments.</p>
      </SectionPanel>
    );
  }
}
