import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import { HR_MODULE_ID } from "../../../contracts";
import { loadHrOrgChartModel } from "../data/hr-org-chart.query.server";

export const hrReportingLinesSurfaceKey = "hr.workforce.org-chart.reporting-lines";
export const hrDepartmentTreeSurfaceKey = "hr.workforce.org-chart.department-tree";

function employeeDetailHref(employeeId: string) {
  return `/${HR_MODULE_ID}/employees/${employeeId}`;
}

export async function HrOrgChartSection({
  organizationId,
}: {
  organizationId: string;
}) {
  const { reportingLines, departmentTree } = await loadHrOrgChartModel({
    organizationId,
    limit: 100,
  });

  const reportingConfiguration = buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "hr",
      object: "org-chart",
      function: "read",
    },
    pagination: {
      pageSize: reportingLines.length || 1,
      totalCount: reportingLines.length,
      hasNextPage: false,
    },
    surface: {
      header: {
        title: "Reporting lines",
        description: "Manager relationships from hr_employees.manager_employee_id.",
      },
      columnsId: "hr-org-chart-reporting",
      rowKey: "employeeId",
      empty: {
        variant: "muted",
        title: "No reporting lines",
        description: "Active employees with managers appear here after seeding.",
      },
    },
    columns: [
      {
        id: "employee",
        header: "Employee",
        priority: "primary",
        pin: "start",
        minWidth: 180,
      },
      { id: "employeeNumber", header: "Number", minWidth: 100 },
      { id: "manager", header: "Reports to", minWidth: 180 },
      { id: "department", header: "Department", minWidth: 140 },
      { id: "position", header: "Position", minWidth: 140 },
    ],
    rows: reportingLines.map((line) => ({
      id: line.employeeId,
      rowHref: employeeDetailHref(line.employeeId),
      cells: {
        employee: line.employeeDisplayName,
        employeeNumber: line.employeeNumber,
        manager: line.managerDisplayName ?? "—",
        department: line.departmentName ?? "—",
        position: line.positionTitle ?? "—",
      },
    })),
  });

  const departmentConfiguration = buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "hr",
      object: "org-chart",
      function: "read",
    },
    pagination: {
      pageSize: departmentTree.length || 1,
      totalCount: departmentTree.length,
      hasNextPage: false,
    },
    surface: {
      header: {
        title: "Department hierarchy",
        description: "Org units and parent department links from hr_departments.",
      },
      columnsId: "hr-org-chart-departments",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No departments",
        description: "Department hierarchy appears after org units are seeded.",
      },
    },
    columns: [
      {
        id: "name",
        header: "Department",
        priority: "primary",
        pin: "start",
        minWidth: 180,
      },
      { id: "code", header: "Code", minWidth: 100 },
      { id: "parent", header: "Parent unit", minWidth: 160 },
      { id: "status", header: "Status", minWidth: 100 },
    ],
    rows: departmentTree.map((department) => ({
      id: department.id,
      cells: {
        name: department.name,
        code: department.code,
        parent: department.parentDepartmentName ?? "—",
        status: department.orgUnitStatus,
      },
    })),
  });

  return (
    <div className="flex flex-col gap-surface-2xl">
      <GovernedPatternCListSection
        title="Reporting structure"
        description="Read-only view of current manager assignments."
        surfaceKey={hrReportingLinesSurfaceKey}
        listConfiguration={reportingConfiguration}
        parentAccessAllowed
        layout="embedded"
      />
      <GovernedPatternCListSection
        title="Department structure"
        description="Read-only department parent links for org planning."
        surfaceKey={hrDepartmentTreeSurfaceKey}
        listConfiguration={departmentConfiguration}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}
