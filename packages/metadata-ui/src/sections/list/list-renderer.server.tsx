import "server-only";

import { MetadataUiPrimitiveActionButton } from "../../primitives/action-button.server";
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

  if (rows.length === 0) {
    return (
      <MetadataUiEmptyState
        title="No records"
        description="No rows are available for this list window."
      />
    );
  }

  if (shouldRenderMetadataUiClientTable(tableModel)) {
    return (
      <MetadataUiClientListTable
        key={`${tableModel.listKey}:${tableModel.serverWindow.rowCount}:${tableModel.rows.map((row) => row.id).join("|")}`}
        model={tableModel}
      />
    );
  }

  return (
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
  );
}

export default MetadataUiListRenderer;
