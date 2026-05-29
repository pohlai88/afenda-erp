import { hrRoutePaths } from "@/lib/hr-route.shared";
import { hrEmployeesUiCopy } from "@afenda/feature-hr/metadata";
import {
  getHrEmployeeDetail,
  HrEmployeeDetailSection,
  listHrEmployeeLifecycleEvents,
  loadHrEmployeeFormOptions,
  requireHrEmployeesRead,
} from "@afenda/feature-hr/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employee — HR",
  description: "Workforce employee record detail for the active tenant.",
};

export default async function HrEmployeeDetailPage({
  employeeId,
}: {
  employeeId: string;
}) {
  const copy = hrEmployeesUiCopy.detail;

  try {
    const { organization, canWrite, canViewLifecycle } = await requireHrEmployeesRead();
    const employee = await getHrEmployeeDetail({
      organizationId: organization.id,
      employeeId,
    });

    if (!employee) {
      notFound();
    }

    const [options, lifecycleEvents] = await Promise.all([
      loadHrEmployeeFormOptions({
        excludeEmployeeId: employee.id,
      }),
      canViewLifecycle
        ? listHrEmployeeLifecycleEvents({
            organizationId: organization.id,
            employeeId: employee.id,
          })
        : Promise.resolve([]),
    ]);

    return (
      <HrEmployeeDetailSection
        employee={employee}
        options={options}
        canWrite={canWrite}
        canViewLifecycle={canViewLifecycle}
        lifecycleEvents={lifecycleEvents}
        backHref={hrRoutePaths.employees}
      />
    );
  } catch {
    return (
      <div className="flex flex-col gap-surface-lg">
        <SectionPanel title={copy.notFoundTitle}>
          <p className="type-muted">{copy.notFoundDescription}</p>
          <Link
            className="type-caption text-muted underline-offset-2 hover:underline"
            href={hrRoutePaths.employees}
          >
            {copy.backLabel}
          </Link>
        </SectionPanel>
      </div>
    );
  }
}
