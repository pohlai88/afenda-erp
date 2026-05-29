import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
  type ListSurfaceRendererConfigurationResolvedInput,
  type ListSurfaceRow,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";
import { clampHrPageSize, HR_MODULE_ID } from "../../../contracts";
import type { HrEmployeeDirectoryRow } from "../contracts";
import { hrEmployeesUiCopy } from "./hr-employees-ui.copy.shared";

function employeeDetailHref(employeeId: string) {
  return `/${HR_MODULE_ID}/employees/${employeeId}`;
}

export const hrEmployeesSurfaceKey = "hr.workforce.employees.list";

const EMPLOYMENT_STATUS_BADGE: Record<
  HrEmployeeDirectoryRow["employmentStatus"],
  NonNullable<ListSurfaceRow["cellKinds"]>[string]
> = {
  onboarding: { kind: "badge", tone: "default" },
  active: { kind: "badge", tone: "positive" },
  probation: { kind: "badge", tone: "attention" },
  confirmed: { kind: "badge", tone: "positive" },
  suspended: { kind: "badge", tone: "attention" },
  notice_period: { kind: "badge", tone: "attention" },
  offboarding: { kind: "badge", tone: "attention" },
  terminated: { kind: "badge", tone: "critical" },
  separated: { kind: "badge", tone: "critical" },
  retired: { kind: "badge", tone: "default" },
  archived: { kind: "badge", tone: "critical" },
};

const EMPLOYEE_COLUMNS = [
  {
    id: "employee",
    header: "Employee",
    priority: "primary" as const,
    pin: "start" as const,
    minWidth: 200,
  },
  { id: "employeeNumber", header: "Number", minWidth: 120 },
  { id: "email", header: "Email", minWidth: 200, clip: true },
  {
    id: "status",
    header: "Status",
    cellKind: { kind: "badge" as const },
    minWidth: 110,
  },
  { id: "department", header: "Department", minWidth: 160, clip: true },
  { id: "position", header: "Position", minWidth: 160, clip: true },
  { id: "manager", header: "Manager", minWidth: 160, clip: true },
  { id: "updatedAt", header: "Updated", minWidth: 180 },
] as const;

function buildEmployeesToolbar(searchValue?: string) {
  return {
    search: {
      param: "employeesQ",
      label: "Search",
      placeholder: hrEmployeesUiCopy.listSurface.searchPlaceholder,
      value: searchValue,
    },
    densityToggle: true,
    columnPicker: true,
    resetParams: ["employeesQ"],
  };
}

export function buildHrEmployeesListSurface(input: {
  window: {
    rows: readonly HrEmployeeDirectoryRow[];
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
  };
  searchValue?: string;
}): ListSurfaceRendererConfigurationResolvedInput {
  const listCopy = hrEmployeesUiCopy.listSurface;
  const pageSize = clampHrPageSize(input.window.pageSize);

  return buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    presentation: {
      toolbar: buildEmployeesToolbar(input.searchValue),
    },
    requiresErpPermission: {
      module: "hr",
      object: "employees",
      function: "read",
    },
    pagination: {
      pageSize,
      totalCount: input.window.totalCount,
      hasNextPage: input.window.hasNextPage,
    },
    surface: {
      header: {
        title: hrEmployeesUiCopy.section.title,
        description: hrEmployeesUiCopy.section.description,
      },
      columnsId: "hr-workforce-employees",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: listCopy.emptyTitle,
        description: listCopy.emptyDescription,
      },
    },
    columns: [...EMPLOYEE_COLUMNS],
    rows: input.window.rows.map((employee) => ({
      id: employee.id,
      rowHref: employeeDetailHref(employee.id),
      cells: {
        employee: employee.displayName,
        employeeNumber: employee.employeeNumber,
        email: employee.email ?? "—",
        status: employee.employmentStatus,
        department: employee.departmentName ?? "—",
        position: employee.positionTitle ?? "—",
        manager: employee.managerDisplayName ?? "—",
        updatedAt: formatErpDateTime(employee.updatedAt),
      },
      cellKinds: {
        status: EMPLOYMENT_STATUS_BADGE[employee.employmentStatus],
      },
    })),
  });
}
