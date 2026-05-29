import { hrEmployeeCreatePath, hrRoutePaths } from "@/lib/hr-route.shared";
import { hrEmployeesUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrEmployeesPageModel,
  HrEmployeesAccessDenied,
  HrEmployeesSection,
  requireHrEmployeesRead,
} from "@afenda/feature-hr-suite/server";
import { Button, SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employees — HR",
  description: "Workforce employee directory for the active tenant.",
};

export default async function HrEmployeesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pageCopy = hrEmployeesUiCopy.page;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  try {
    const { organization, canWrite } = await requireHrEmployeesRead();
    const { window, searchValue } = await buildHrEmployeesPageModel({
      organizationId: organization.id,
      searchParams: resolvedSearchParams,
      limit: 25,
    });

    return (
      <div className="flex flex-col gap-surface-2xl">
        <SectionPanel
          headingLevel={1}
          title={pageCopy.title}
          description={pageCopy.description}
          aside={
            <div className="flex flex-wrap items-center gap-3">
              {canWrite ? (
                <Button asChild size="sm">
                  <Link href={hrEmployeeCreatePath()}>{pageCopy.addEmployeeLabel}</Link>
                </Button>
              ) : null}
              <Link
                className="type-caption text-muted underline-offset-2 hover:underline"
                href={hrRoutePaths.hub}
              >
                HR hub
              </Link>
            </div>
          }
        />
        <HrEmployeesSection window={window} searchValue={searchValue} />
      </div>
    );
  } catch {
    return <HrEmployeesAccessDenied />;
  }
}
