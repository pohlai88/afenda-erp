import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { type ColumnDef } from "@tanstack/react-table";

import { GovernedDataTableClient } from "../../src/components/governed-data-table.client";

type Row = { id: string; name: string };

const columns: ColumnDef<Row, unknown>[] = [
  { id: "name", accessorKey: "name", header: "Name" },
];

describe("GovernedDataTableClient", () => {
  it("renders empty body row with diagnostics", () => {
    const html = renderToStaticMarkup(
      <GovernedDataTableClient
        data={[]}
        columns={columns}
        getRowId={(row) => row.id}
        tableLabel="Employees"
        surfaceKey="hr.records"
        componentKey="employee-table"
        testId="governed:data-table:employee-table"
      />,
    );

    expect(html).toContain("No records found.");
    expect(html).toContain('data-row-state="empty"');
    expect(html).toContain('data-render-state="empty"');
    expect(html).toContain('data-surface-key="hr.records"');
    expect(html).toContain('data-component-key="employee-table"');
    expect(html).toContain('data-testid="governed:data-table:employee-table"');
    expect(html).toContain('data-component-type="governed:data-table"');
  });

  it("defaults testId from componentKey when testId is omitted", () => {
    const html = renderToStaticMarkup(
      <GovernedDataTableClient
        data={[]}
        columns={columns}
        getRowId={(row) => row.id}
        tableLabel="Employees"
        componentKey="employee-table"
      />,
    );

    expect(html).toContain('data-testid="governed:data-table:employee-table"');
  });

  it("uses colSpan 1 when columns are empty", () => {
    const html = renderToStaticMarkup(
      <GovernedDataTableClient
        data={[] as Row[]}
        columns={[]}
        getRowId={(row) => row.id}
        tableLabel="Employees"
      />,
    );

    expect(html).toContain('colSpan="1"');
  });

  it("renders rows with row index and ready diagnostics", () => {
    const html = renderToStaticMarkup(
      <GovernedDataTableClient
        data={[
          { id: "r1", name: "Alex" },
          { id: "r2", name: "Jordan" },
        ]}
        columns={columns}
        getRowId={(row) => row.id}
        tableLabel="Employees"
        sectionKey="active"
        surfaceKey="hr.records"
        density="comfortable"
        className="min-w-full"
      />,
    );

    expect(html).toContain("Alex");
    expect(html).toContain('data-row-id="r1"');
    expect(html).toContain('data-row-index="0"');
    expect(html).toContain('data-row-index="1"');
    expect(html).toContain('data-render-state="ready"');
    expect(html).toContain('data-section-key="active"');
    expect(html).toContain('data-testid="governed:data-table:active"');
    expect(html).toContain('data-component-type="governed:data-table"');
    expect(html).toContain("min-w-full");
  });
});
