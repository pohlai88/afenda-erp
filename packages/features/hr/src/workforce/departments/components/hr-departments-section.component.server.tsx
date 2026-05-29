import { listHrDepartmentCatalog } from "../data/hr-departments.query.server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";

export const hrDepartmentsSurfaceKey = "hr.workforce.departments.list";

export async function HrDepartmentsSection({
  organizationId,
}: {
  organizationId: string;
}) {
  const departments = await listHrDepartmentCatalog({
    organizationId,
    limit: 100,
  });

  const listConfiguration = buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "hr",
      object: "departments",
      function: "read",
    },
    pagination: {
      pageSize: departments.length || 1,
      totalCount: departments.length,
      hasNextPage: false,
    },
    surface: {
      header: {
        title: "Department catalog",
        description: "Organization units for workforce placement.",
      },
      columnsId: "hr-workforce-departments",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No departments",
        description: "Run the HR workforce seed to load demo org units.",
      },
    },
    columns: [
      { id: "name", header: "Name", priority: "primary", pin: "start", minWidth: 180 },
      { id: "code", header: "Code", minWidth: 100 },
      { id: "status", header: "Status", minWidth: 100 },
      { id: "updatedAt", header: "Updated", minWidth: 180 },
    ],
    rows: departments.map((department) => ({
      id: department.id,
      cells: {
        name: department.name,
        code: department.code,
        status: department.orgUnitStatus,
        updatedAt: formatErpDateTime(department.updatedAt),
      },
    })),
  });

  return (
    <GovernedPatternCListSection
      title="Departments"
      description="Bounded catalog window from hr_departments."
      surfaceKey={hrDepartmentsSurfaceKey}
      listConfiguration={listConfiguration}
      parentAccessAllowed
      layout="embedded"
    />
  );
}
