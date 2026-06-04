import { GovernedEmpty } from "./gov-governed-empty";
import { buildGovernedListSurfaceDataAttributes } from "./list-surface-identity.shared";
import { buildListSurfaceTableProps } from "./build-list-surface-table-props.shared";
import {
  parseListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfiguration,
} from "./gov-list-surface-renderer-schema";
import { governedParseErrorCopy } from "./gov-governed-renderer-copy-shared";

import type { GovernedComponentRendererDiagnostics } from "./gov-registry";
import { ListSurfaceTable } from "./gov-list-surface-table";

export type ListSurfaceRendererProps = {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

export function ListSurfaceRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
}: ListSurfaceRendererProps) {
  const parsed = parseListSurfaceRendererConfiguration(configuration);
  if (!parsed.success) {
    const copy = governedParseErrorCopy(diagnostics, "listSurface");
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: copy.title,
          description: copy.description,
          emptyId: "list-surface-parse-error",
        }}
      />
    );
  }

  const config: ListSurfaceRendererConfiguration = parsed.data;
  const { surface, rows, presentation } = config;
  const presentationVariant = "table-only" as const;
  const tableDensity = presentation?.tableDensity ?? "compact";
  const resolvedSurfaceKey = surfaceKey ?? surface.columnsId;
  const listState = rows.length === 0 ? "empty" : "ready";

  const tableProps = buildListSurfaceTableProps(config, {
    surfaceKey: resolvedSurfaceKey,
    sectionKey,
    componentKey,
    presentationVariant,
  });

  return (
    <div
      className="@container min-w-0"
      {...buildGovernedListSurfaceDataAttributes({
        surfaceKey: resolvedSurfaceKey,
        sectionKey,
        componentKey,
        columnsId: surface.columnsId,
        dataNature: config.dataNature,
        presentationVariant,
        density: tableDensity,
        state: listState,
      })}
    >
      <ListSurfaceTable {...tableProps} />
    </div>
  );
}
