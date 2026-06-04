"use client";

import { ListSurfaceTable } from "./gov-list-surface-table";
import type { ListSurfaceTableTrailingColumn } from "./gov-list-surface-table-client";
import { buildListSurfaceTableProps } from "./build-list-surface-table-props.shared";

import type { ListSurfaceRendererConfiguration } from "./gov-list-surface-renderer-schema";

import {
  resolveGovernedTrailingColumn,
  type GovernedPatternCTrailingColumnSpec,
} from "./gov-governed-list-trailing-cell-registry-client";

export type GovernedPatternCListTableHostProps = {
  surfaceKey: string;
  sectionKey: string;
  componentKey: string;
  config: ListSurfaceRendererConfiguration;
  trailingColumn?: GovernedPatternCTrailingColumnSpec;
};

export function resolvePatternCTableTrailingColumn(
  spec: GovernedPatternCTrailingColumnSpec | undefined,
  surfaceKey: string,
  sectionKey: string,
  componentKey: string,
): ListSurfaceTableTrailingColumn | undefined {
  if (!spec) {
    return undefined;
  }

  const resolved = resolveGovernedTrailingColumn(spec);

  return {
    header: resolved.header,
    Cell: resolved.Cell,
    context: {
      ...resolved.context,
      surfaceKey: resolved.context?.surfaceKey ?? surfaceKey,
      sectionKey: resolved.context?.sectionKey ?? sectionKey,
      componentKey: resolved.context?.componentKey ?? componentKey,
    },
  };
}

export function GovernedPatternCListTableHost({
  surfaceKey,
  sectionKey,
  componentKey,
  config,
  trailingColumn,
}: GovernedPatternCListTableHostProps) {
  const tableTrailing = resolvePatternCTableTrailingColumn(
    trailingColumn,
    surfaceKey,
    sectionKey,
    componentKey,
  );

  const tableProps = buildListSurfaceTableProps(config, {
    surfaceKey,
    sectionKey,
    componentKey,
    presentationVariant:
      config.presentation?.variant ?? "table-only",
    trailingColumn: tableTrailing,
  });

  return <ListSurfaceTable {...tableProps} />;
}
