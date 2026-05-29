import { hrRoutePaths } from "@/lib/hr-route.shared";
import { hrDocumentsUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  buildHrDocumentsPageModel,
  HrDocumentsAccessDenied,
  HrDocumentsSection,
  requireHrDocumentsRead,
} from "@afenda/feature-hr-suite/server";
import { listHrEmployeeDirectory } from "@afenda/feature-hr-suite/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents — HR",
  description: "Workforce document vault for the active tenant.",
};

export default async function HrDocumentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pageCopy = hrDocumentsUiCopy.page;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  try {
    const { organization, canWrite } = await requireHrDocumentsRead();
    const { window, searchValue, requirements } = await buildHrDocumentsPageModel({
      organizationId: organization.id,
      searchParams: resolvedSearchParams,
      limit: 25,
    });

    const directory = await listHrEmployeeDirectory({
      organizationId: organization.id,
      limit: 100,
    });
    const employees = directory.rows.map((row) => ({
      id: row.id,
      label: `${row.employeeNumber} — ${row.displayName}`,
    }));

    return (
      <div className="flex flex-col gap-surface-2xl">
        <SectionPanel
          headingLevel={1}
          title={pageCopy.title}
          description={pageCopy.description}
          aside={
            <Link
              className="type-caption text-muted underline-offset-2 hover:underline"
              href={hrRoutePaths.hub}
            >
              HR hub
            </Link>
          }
        />
        <HrDocumentsSection
          window={window}
          searchValue={searchValue}
          canWrite={canWrite}
          employees={employees}
          requirements={requirements}
        />
      </div>
    );
  } catch {
    return (
      <div className="flex flex-col gap-surface-lg">
        <SectionPanel
          headingLevel={1}
          title={pageCopy.title}
          description={pageCopy.description}
        />
        <HrDocumentsAccessDenied />
      </div>
    );
  }
}
