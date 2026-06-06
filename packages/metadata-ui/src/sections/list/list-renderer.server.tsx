import "server-only";

import type { ReactNode } from "react";
import { MetadataUiPrimitiveActionButton } from "../../primitives/action-button.server";
import { MetadataUiPrimitiveDescriptionList } from "../../primitives/description-list.server";
import { MetadataUiPrimitiveListWindow } from "../../primitives/list-window.server";
import {
  MetadataUiPrimitiveTable,
  type MetadataUiPrimitiveTableRow,
} from "../../primitives/table.server";
import {
  createMetadataUiTableClientModel,
  shouldRenderMetadataUiClientTable,
  type MetadataUiTableClientModel,
} from "../../runtime/table-state.shared";
import {
  type MetadataUiListInput,
  parseMetadataUiList,
} from "../../schemas/list.schema";
import { MetadataUiEmptyState } from "../../shell/empty-state.server";
import { MetadataUiClientListTable } from "./list-table.client";

export type MetadataUiListRendererProps = Readonly<{
  metadata: MetadataUiListInput;
  rows?: readonly Record<string, unknown>[];
}>;

function resolveMetadataUiListRows(
  list: ReturnType<typeof parseMetadataUiList>,
  tableModel: MetadataUiTableClientModel,
): readonly MetadataUiPrimitiveTableRow[] {
  const visibleColumns = tableModel.columns.filter((column) => !column.hidden);
  const inlineRowActions = list.rowActions.filter(
    (rowAction) => rowAction.placement === "inline",
  );

  return tableModel.rows.map((row) => ({
    key: row.id,
    cells: visibleColumns.map((column) => row.cells[column.key] ?? ""),
    actions:
      inlineRowActions.length > 0 ? (
        <div className="inline-flex justify-end gap-surface-xs">
          {inlineRowActions.map((rowAction) => (
            <MetadataUiPrimitiveActionButton
              key={rowAction.action.id}
              action={rowAction.action}
              priority="tertiary"
              state="disabled"
              disabledReason="Row action execution must be provided by the host feature."
            />
          ))}
        </div>
      ) : undefined,
  }));
}

export function MetadataUiListRenderer({
  metadata,
  rows = [],
}: MetadataUiListRendererProps) {
  const list = parseMetadataUiList(metadata);
  const tableModel = createMetadataUiTableClientModel(list, rows);
  const visibleColumns = tableModel.columns.filter((column) => !column.hidden);
  const summary = (
    <MetadataUiPrimitiveDescriptionList
      title="Window summary"
      description="Contract-backed metadata for the current governed list window."
      columns={3}
      items={[
        {
          key: "selection",
          label: "Selection",
          value: list.selectionMode,
        },
        {
          key: "density",
          label: "Density",
          value: list.density,
        },
        {
          key: "rows",
          label: "Rows",
          value: tableModel.serverWindow.rowCount,
          copyValue: tableModel.serverWindow.caption,
        },
        {
          key: "columns",
          label: "Columns",
          value: visibleColumns.length,
        },
        {
          key: "toolbar",
          label: "Toolbar",
          value: list.toolbar.enabled ? "Enabled" : "Disabled",
        },
        {
          key: "virtualization",
          label: "Virtualization",
          value: list.virtualization.enabled ? "Enabled" : "Disabled",
        },
      ]}
    />
  );

  if (rows.length === 0) {
    return (
      <MetadataUiListWindowShell
        title={list.title}
        description={list.description}
        content={
          <div
            className="grid gap-surface-sm"
            data-metadata-ui-list-key={list.key}
            data-metadata-ui-list-row-count={tableModel.serverWindow.rowCount}
            data-metadata-ui-list-selection-mode={list.selectionMode}
            data-metadata-ui-list-toolbar-enabled={list.toolbar.enabled}
            data-metadata-ui-list-virtualization-enabled={list.virtualization.enabled}
          >
            {summary}
            <MetadataUiEmptyState
              title="No records"
              description="No rows are available for this list window."
            />
          </div>
        }
      />
    );
  }

  if (shouldRenderMetadataUiClientTable(tableModel)) {
    return (
      <MetadataUiListWindowShell
        title={list.title}
        description={list.description}
        content={
          <div
            className="grid gap-surface-sm"
            data-metadata-ui-list-key={list.key}
            data-metadata-ui-list-row-count={tableModel.serverWindow.rowCount}
            data-metadata-ui-list-selection-mode={list.selectionMode}
            data-metadata-ui-list-toolbar-enabled={list.toolbar.enabled}
            data-metadata-ui-list-virtualization-enabled={list.virtualization.enabled}
          >
            {summary}
            <MetadataUiClientListTable
              key={`${tableModel.listKey}:${tableModel.serverWindow.rowCount}:${tableModel.rows.map((row) => row.id).join("|")}`}
              model={tableModel}
            />
          </div>
        }
      />
    );
  }

  return (
    <MetadataUiListWindowShell
      title={list.title}
      description={list.description}
      content={
        <div
          className="grid gap-surface-sm"
          data-metadata-ui-list-key={list.key}
          data-metadata-ui-list-row-count={tableModel.serverWindow.rowCount}
          data-metadata-ui-list-selection-mode={list.selectionMode}
          data-metadata-ui-list-toolbar-enabled={list.toolbar.enabled}
          data-metadata-ui-list-virtualization-enabled={list.virtualization.enabled}
        >
          {summary}
          <MetadataUiPrimitiveTable
            columns={visibleColumns.map((column) => ({
              key: column.key,
              label: column.label,
              align: column.align,
              width: column.width,
            }))}
            rows={resolveMetadataUiListRows(list, tableModel)}
            density={list.density}
            caption={tableModel.serverWindow.caption}
          />
        </div>
      }
    />
  );
}

function MetadataUiListWindowShell({
  title,
  description,
  content,
}: Readonly<{
  title?: ReactNode;
  description?: ReactNode;
  content: ReactNode;
}>) {
  return (
    <MetadataUiPrimitiveListWindow
      title={title}
      description={description}
      content={content}
    />
  );
}

export default MetadataUiListRenderer;
