import { describe, expect, it } from "vitest";

import { createList } from "../builders/list.builder";
import {
  createMetadataUiTableClientModel,
  shouldRenderMetadataUiClientTable,
} from "../runtime/table-state.shared";

describe("metadata-ui enterprise table state", () => {
  it("serializes the current server window into a TanStack-safe table model", () => {
    const list = createList({
      key: "metadata-ui.fixture.enterprise-list",
      rowKey: "id",
      selectionMode: "multiple",
      density: "compact",
      columns: [
        {
          key: "name",
          field: "name",
          label: "Name",
          sortable: true,
          pinned: "start",
        },
        {
          key: "status",
          field: "status",
          label: "Status",
          format: "status",
          hidden: true,
        },
        {
          key: "amount",
          field: "amount",
          label: "Amount",
          format: "currency",
          align: "end",
        },
      ],
      defaultSort: [
        {
          field: "name",
          direction: "asc",
        },
        {
          field: "amount",
          direction: "desc",
        },
      ],
      rowActions: [
        {
          placement: "inline",
          action: {
            id: "metadata-ui.fixture.view-row",
            label: "View",
            intent: "read",
            execution: {
              kind: "navigation",
              href: "/workspace/metadata-ui/fixture",
            },
          },
        },
      ],
      trailingCells: [
        {
          key: "metadata-ui.fixture.trailing-status",
          kind: "status",
          label: "State",
          statusField: "status",
        },
        {
          key: "metadata-ui.fixture.trailing-action",
          kind: "action",
          label: "Open",
          action: {
            id: "metadata-ui.fixture.open-trailing",
            label: "Open",
            execution: {
              kind: "client-event",
              eventKey: "metadata-ui.fixture.open-trailing",
            },
          },
        },
      ],
    });

    const model = createMetadataUiTableClientModel(list, [
      {
        id: "row-1",
        name: "Quarter close",
        status: "Ready",
        amount: 1250,
        ignoredField: "not serialized as a column",
      },
      {
        id: "row-2",
        name: "Audit queue",
        status: "Blocked",
        amount: null,
      },
    ]);

    expect(model.serverWindow).toEqual({
      rowKey: "id",
      rowCount: 2,
      caption: "2 rows in the current server window.",
      ownsCurrentWindowOnly: true,
    });
    expect(model.columns.map((column) => column.key)).toEqual([
      "name",
      "status",
      "amount",
    ]);
    expect(model.columns[0]).toMatchObject({
      key: "name",
      pinned: "start",
      sortable: true,
    });
    expect(model.columns[1]).toMatchObject({
      key: "status",
      hidden: true,
    });
    expect(model.defaultSorting).toEqual([
      {
        id: "name",
        direction: "asc",
      },
    ]);
    expect(model.rows[0]?.cells).toEqual({
      name: "Quarter close",
      status: "Ready",
      amount: "1250",
    });
    expect(model.rows[1]?.cells.amount).toBe("");
    expect(model.rowActions).toEqual([
      {
        id: "metadata-ui.fixture.view-row",
        label: "View",
        disabledReason:
          "Row action execution must be provided by the host feature.",
      },
    ]);
    expect(model.trailingCells).toEqual([
      {
        key: "metadata-ui.fixture.trailing-status",
        kind: "status",
        label: "State",
        statusField: "status",
        hidden: false,
      },
      {
        key: "metadata-ui.fixture.trailing-action",
        kind: "action",
        label: "Open",
        actionId: "metadata-ui.fixture.open-trailing",
        actionLabel: "Open",
        hidden: false,
        disabledReason:
          "Trailing action execution must be provided by the host feature.",
      },
    ]);
    expect(shouldRenderMetadataUiClientTable(model)).toBe(true);
  });

  it("keeps virtualization explicitly scoped to the current server window", () => {
    const list = createList({
      key: "metadata-ui.fixture.virtual-list",
      rowKey: "id",
      virtualization: {
        enabled: true,
        rowEstimate: 44,
        overscan: 12,
        maxHeight: 520,
      },
      columns: [
        {
          key: "name",
          field: "name",
          label: "Name",
        },
      ],
    });

    const model = createMetadataUiTableClientModel(
      list,
      Array.from({ length: 50 }, (_, index) => ({
        id: `row-${index}`,
        name: `Row ${index}`,
      })),
    );

    expect(model.virtualization).toEqual({
      enabled: true,
      rowEstimate: 44,
      overscan: 12,
      maxHeight: 520,
      ownsCurrentWindowOnly: true,
    });
    expect(model.serverWindow).toMatchObject({
      rowCount: 50,
      ownsCurrentWindowOnly: true,
    });
    expect(shouldRenderMetadataUiClientTable(model)).toBe(true);
  });

  it("serializes list toolbar metadata without owning URL or persistence state", () => {
    const list = createList({
      key: "metadata-ui.fixture.toolbar-list",
      columns: [
        {
          key: "name",
          field: "name",
          label: "Name",
          sortable: true,
        },
      ],
      filters: [
        {
          key: "status-ready",
          field: "status",
          label: "Ready",
          operator: "equals",
          value: "ready",
          locked: true,
        },
      ],
      toolbar: {
        enabled: true,
        showSearch: true,
        searchPlaceholder: "Search tasks",
        showFilters: true,
        showSavedViews: true,
        savedViews: [
          {
            key: "my-open",
            label: "My open items",
            href: "/workspace/tasks?view=my-open",
            active: true,
          },
        ],
        showSort: true,
        showDensity: true,
        showExport: true,
        exportAction: {
          id: "metadata-ui.fixture.export-list",
          label: "Export",
          intent: "export",
          execution: {
            kind: "navigation",
            href: "/workspace/tasks/export",
            target: "download",
          },
        },
      },
      bulkActions: [
        {
          action: {
            id: "metadata-ui.fixture.bulk-approve",
            label: "Approve selected",
            execution: {
              kind: "client-event",
              eventKey: "metadata-ui.fixture.bulk-approve",
            },
          },
          requiresSelection: true,
        },
      ],
    });

    const model = createMetadataUiTableClientModel(list, [
      {
        id: "row-1",
        name: "Quarter close",
        status: "ready",
      },
    ]);

    expect(model.toolbar.enabled).toBe(true);
    expect(model.toolbar.searchPlaceholder).toBe("Search tasks");
    expect(model.toolbar.filters).toEqual([
      {
        key: "status-ready",
        label: "Ready",
        field: "status",
        operator: "equals",
        locked: true,
      },
    ]);
    expect(model.toolbar.savedViews).toEqual([
      {
        key: "my-open",
        label: "My open items",
        href: "/workspace/tasks?view=my-open",
        active: true,
      },
    ]);
    expect(model.toolbar.sortOptions).toEqual([
      {
        id: "name",
        label: "Name ascending",
        direction: "asc",
      },
      {
        id: "name",
        label: "Name descending",
        direction: "desc",
      },
    ]);
    expect(model.toolbar.exportAction).toEqual({
      id: "metadata-ui.fixture.export-list",
      label: "Export",
      href: "/workspace/tasks/export",
      disabledReason: "Export navigation is provided by the host feature.",
    });
    expect(model.toolbar.bulkActions).toEqual([
      {
        id: "metadata-ui.fixture.bulk-approve",
        label: "Approve selected",
        requiresSelection: true,
        disabledReason:
          "Bulk action execution must be provided by the host feature.",
      },
    ]);
    expect(shouldRenderMetadataUiClientTable(model)).toBe(true);
  });

  it("fails closed when server-window rows omit the configured row key", () => {
    const list = createList({
      key: "metadata-ui.fixture.identity-list",
      rowKey: "id",
      columns: [
        {
          key: "name",
          field: "name",
          label: "Name",
        },
      ],
    });

    expect(() =>
      createMetadataUiTableClientModel(list, [
        {
          name: "Missing id",
        },
      ]),
    ).toThrow(/rowKey "id"/i);
  });
});
