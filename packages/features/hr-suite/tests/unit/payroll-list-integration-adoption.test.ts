import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { describe, expect, it } from "vitest";

import { hrPayrollBenefitsReadPermission } from "../../src/payroll-compensation/benefits-administration/contracts/hr.payroll.benefits.contract";
import {
  buildBenefitsListSearchToolbar,
  buildBenefitsOperationalListSurface,
} from "../../src/payroll-compensation/benefits-administration/surface/hr.payroll.benefits-list.shared";
import { hrPayrollBonusReadPermission } from "../../src/payroll-compensation/bonus-incentive-management/contracts/hr.payroll.bonus.contract";
import {
  buildBonusListSearchToolbar,
  buildBonusOperationalListSurface,
} from "../../src/payroll-compensation/bonus-incentive-management/surface/hr.payroll.bonus-list.shared";
import { hrPayrollCpmReadPermission } from "../../src/payroll-compensation/compensation-planning-modeling/contracts/hr.payroll.cpm.contract";
import {
  buildCpmListSearchToolbar,
  buildCpmOperationalListSurface,
} from "../../src/payroll-compensation/compensation-planning-modeling/surface/hr.payroll.cpm-list.shared";
import { hrPayrollExpenseReadPermission } from "../../src/payroll-compensation/expenses-reimbursement/contracts/hr.payroll.expense.contract";
import {
  buildExpenseListSearchToolbar,
  buildExpenseOperationalListSurface,
} from "../../src/payroll-compensation/expenses-reimbursement/surface/hr.payroll.expense-list.shared";
import { hrPayrollMcpReadPermission } from "../../src/payroll-compensation/multi-country-payroll/contracts/hr.payroll.mcp.contract";
import {
  buildMcpListSearchToolbar,
  buildMcpOperationalListSurface,
} from "../../src/payroll-compensation/multi-country-payroll/surface/hr.payroll.mcp-list.shared";
import { hrPayrollProcessingReadPermission } from "../../src/payroll-compensation/payroll-processing/contracts/hr.payroll.processing.contract";
import {
  buildPayrollListSearchToolbar,
  buildPayrollOperationalListSurface,
} from "../../src/payroll-compensation/payroll-processing/surface/hr.payroll.processing-list.shared";
import { hrPayrollSbsReadPermission } from "../../src/payroll-compensation/salary-benchmarking-survey/contracts/hr.payroll.sbs.contract";
import {
  buildSbsListSearchToolbar,
  buildSbsOperationalListSurface,
} from "../../src/payroll-compensation/salary-benchmarking-survey/surface/hr.payroll.sbs-list.shared";

type PayrollPermission = {
  readonly module: "hr";
  readonly object: string;
  readonly function: string;
};

const columns = [
  {
    id: "name",
    header: "Name",
    priority: "primary",
    cellKind: { kind: "text" },
  },
] as const;

const rows = [
  {
    id: "row-1",
    cells: { name: "Payroll record" },
  },
] as const;

const window = {
  pageSize: 25,
  totalCount: 1,
  hasNextPage: false,
} as const;

function surfaceMeta(columnsId: string) {
  return {
    headerTitle: "Payroll records",
    columnsId,
    emptyTitle: "No records",
    emptyDescription: "No payroll records match this view.",
  };
}

function assertPayrollSurface(input: {
  surface: ListSurfaceRendererConfigurationResolvedInput;
  permission: PayrollPermission;
  searchParam: string;
}) {
  expect(input.surface.dataNature).toBe("table");
  expect(input.surface.requiresErpPermission).toEqual(input.permission);
  expect(input.surface.presentation?.primaryColumnId).toBe("name");
  expect(input.surface.presentation?.toolbar?.search?.param).toBe(
    input.searchParam,
  );
  expect(input.surface.pagination).toEqual(window);
  expect(input.surface.surface.rowKey).toBe("id");
  expect(input.surface.rows).toHaveLength(1);
}

describe("payroll list integration adoption", () => {
  it("builds payroll governed list envelopes through HR Suite integration helpers", () => {
    const surfaces = [
      {
        surface: buildBenefitsOperationalListSurface({
          primaryColumnId: "name",
          searchToolbar: buildBenefitsListSearchToolbar({
            param: "benefitsSearch",
            label: "Search benefits",
            placeholder: "Search benefits",
            value: "active",
          }),
          window,
          surface: surfaceMeta("hr.payroll.benefits.columns"),
          columns: [...columns],
          rows: [...rows],
        }),
        permission: hrPayrollBenefitsReadPermission,
        searchParam: "benefitsSearch",
      },
      {
        surface: buildBonusOperationalListSurface({
          primaryColumnId: "name",
          searchToolbar: buildBonusListSearchToolbar({
            param: "bonusSearch",
            label: "Search bonus",
            placeholder: "Search bonus",
            value: "annual",
          }),
          window,
          surface: surfaceMeta("hr.payroll.bonus.columns"),
          columns: [...columns],
          rows: [...rows],
        }),
        permission: hrPayrollBonusReadPermission,
        searchParam: "bonusSearch",
      },
      {
        surface: buildCpmOperationalListSurface({
          primaryColumnId: "name",
          searchToolbar: buildCpmListSearchToolbar({
            param: "cpmSearch",
            label: "Search planning",
            placeholder: "Search planning",
            value: "cycle",
          }),
          window,
          surface: surfaceMeta("hr.payroll.cpm.columns"),
          columns,
          rows,
        }),
        permission: hrPayrollCpmReadPermission,
        searchParam: "cpmSearch",
      },
      {
        surface: buildExpenseOperationalListSurface({
          primaryColumnId: "name",
          searchToolbar: buildExpenseListSearchToolbar({
            param: "expenseSearch",
            label: "Search expenses",
            placeholder: "Search expenses",
            value: "claim",
          }),
          window,
          surface: surfaceMeta("hr.payroll.expense.columns"),
          columns,
          rows,
        }),
        permission: hrPayrollExpenseReadPermission,
        searchParam: "expenseSearch",
      },
      {
        surface: buildMcpOperationalListSurface({
          primaryColumnId: "name",
          searchToolbar: buildMcpListSearchToolbar({
            param: "mcpSearch",
            label: "Search countries",
            placeholder: "Search countries",
            value: "my",
          }),
          window,
          surface: surfaceMeta("hr.payroll.mcp.columns"),
          columns: [...columns],
          rows: [...rows],
        }),
        permission: hrPayrollMcpReadPermission,
        searchParam: "mcpSearch",
      },
      {
        surface: buildPayrollOperationalListSurface({
          primaryColumnId: "name",
          searchToolbar: buildPayrollListSearchToolbar({
            param: "payrollSearch",
            label: "Search payroll",
            placeholder: "Search payroll",
            value: "run",
          }),
          window,
          surface: surfaceMeta("hr.payroll.processing.columns"),
          columns: [...columns],
          rows: [...rows],
        }),
        permission: hrPayrollProcessingReadPermission,
        searchParam: "payrollSearch",
      },
      {
        surface: buildSbsOperationalListSurface({
          primaryColumnId: "name",
          searchToolbar: buildSbsListSearchToolbar({
            param: "sbsSearch",
            label: "Search benchmarking",
            placeholder: "Search benchmarking",
            value: "market",
          }),
          window,
          surface: surfaceMeta("hr.payroll.sbs.columns"),
          columns,
          rows,
        }),
        permission: hrPayrollSbsReadPermission,
        searchParam: "sbsSearch",
      },
    ];

    for (const surface of surfaces) {
      assertPayrollSurface(surface);
    }
  });
});
