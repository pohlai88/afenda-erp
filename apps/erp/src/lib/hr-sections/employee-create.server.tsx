import { hrRoutePaths } from "@/lib/hr-route.shared";
import { hrEmployeesUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  HrEmployeeCreateSection,
  loadHrEmployeeFormOptions,
  requireHrEmployeesWrite,
} from "@afenda/feature-hr-suite/server";
import { SectionPanel } from "@afenda/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add employee — HR",
  description: "Create a workforce employee record for the active tenant.",
};

export default async function HrEmployeeCreatePage() {
  const copy = hrEmployeesUiCopy.create;

  try {
    await requireHrEmployeesWrite();
    const options = await loadHrEmployeeFormOptions();

    return (
      <HrEmployeeCreateSection
        options={options}
        backHref={hrRoutePaths.employees}
      />
    );
  } catch {
    return (
      <div className="flex flex-col gap-surface-lg">
        <SectionPanel title={copy.accessDeniedTitle}>
          <p className="type-muted">{copy.accessDeniedDescription}</p>
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
