import "server-only";

import type { ReactNode } from "react";
import { Suspense } from "react";

import type { GovernedPatternCTrailingColumnSpec } from "./governed-pattern-c-trailing-column.shared";
import { resolveGovernedErpPermissionAllowed } from "./gov-governed-permission-gate-server";
import { logGovernedListSurfaceRender } from "./log-governed-list-surface-render.server";
import {
  governedListSectionDomId,
  summarizeListSurfaceTrailingActions,
} from "./list-surface-identity.shared";

import {
  parseListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfigurationInput,
} from "./gov-list-surface-renderer-schema";
import { GovernedComponentSkeleton } from "./gov-governed-component-skeleton";
import { GovernedPatternCListTableHost } from "./gov-governed-pattern-c-list-table-host-client";
import {
  renderGovernedPatternSectionShell,
  type GovernedPatternSectionDensity,
  type GovernedPatternSectionLayout,
  type RenderGovernedPatternSectionShellInput,
} from "./gov-governed-pattern-section-shell-shared";
import {
  resolveMetadataSectionBody,
  type GovernedPatternEmptyState,
} from "./resolve-metadata-section-body.server";

export type GovernedPatternCListSectionLayout = GovernedPatternSectionLayout;

export type GovernedPatternCListSectionProps = {
  title: string;
  description?: string;
  listConfiguration: ListSurfaceRendererConfigurationInput;
  surfaceKey: string;
  sectionKey?: string;
  componentKey?: string;
  layout?: GovernedPatternCListSectionLayout;
  density?: GovernedPatternSectionDensity;
  loadError?: GovernedPatternEmptyState;
  parentAccessAllowed?: boolean;
  resolveConfiguredPermission?: boolean;
  forbidden?: GovernedPatternEmptyState;
  invalid?: GovernedPatternEmptyState;
  headerSlot?: ReactNode;
  cardHeaderAction?: ReactNode;
  contentBeforeList?: ReactNode;
  contentAfterList?: ReactNode;
  trailingColumn?: GovernedPatternCTrailingColumnSpec;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
};

export async function GovernedPatternCListSection({
  title,
  description,
  listConfiguration,
  surfaceKey,
  sectionKey,
  componentKey,
  layout = "card",
  density = "comfortable",
  loadError,
  parentAccessAllowed = true,
  resolveConfiguredPermission = true,
  forbidden,
  invalid,
  headerSlot,
  cardHeaderAction,
  contentBeforeList,
  contentAfterList,
  trailingColumn,
  className,
  cardClassName,
  contentClassName,
}: GovernedPatternCListSectionProps) {
  const defaultSectionKey = listConfiguration.surface?.columnsId ?? surfaceKey;
  const resolvedSectionKey = sectionKey ?? defaultSectionKey;
  const resolvedComponentKey = componentKey ?? resolvedSectionKey;
  const sectionDomId = governedListSectionDomId(resolvedComponentKey);

  const shellInput = {
    layout,
    density,
    className,
    sectionDomId,
    surfaceKey,
    sectionKey: resolvedSectionKey,
    componentKey: resolvedComponentKey,
    headerSlot,
    headerAction: cardHeaderAction,
    title,
    description,
    cardClassName,
    contentClassName,
  } satisfies Omit<RenderGovernedPatternSectionShellInput, "body">;

  const body = await resolveMetadataSectionBody({
    loadError,
    parse: () => parseListSurfaceRendererConfiguration(listConfiguration),
    parseErrorLabel: "GovernedPatternCListSection invalid list configuration",
    parseContext: {
      surfaceKey,
      sectionKey: resolvedSectionKey,
      componentKey: resolvedComponentKey,
    },
    emptyStateIds: {
      loadError: "pattern-c-load-error",
      invalid: "pattern-c-invalid-config",
      forbidden: "pattern-c-forbidden",
    },
    invalid,
    forbidden,
    resolvePermission: async (_config) => {
      const allowedFromConfig = resolveConfiguredPermission
        ? await resolveGovernedErpPermissionAllowed(
            listConfiguration.requiresErpPermission,
          )
        : true;
      return parentAccessAllowed && allowedFromConfig;
    },
    buildReadyBody: (config: ListSurfaceRendererConfiguration) => {
      const isEmpty = config.rows.length === 0;
      const listState = isEmpty ? "empty" : "ready";
      const tableDensity = config.presentation?.tableDensity ?? "compact";
      const presentationVariant =
        config.presentation?.variant ?? "table-only";

      logGovernedListSurfaceRender({
        surfaceKey,
        sectionKey: resolvedSectionKey,
        componentKey: resolvedComponentKey,
        columnsId: config.surface.columnsId,
        dataNature: config.dataNature,
        presentationVariant,
        density: tableDensity,
        state: listState,
        rowCount: config.rows.length,
        trailing: summarizeListSurfaceTrailingActions(config.rows),
      });

      const children = (
        <>
          {contentBeforeList}
          <Suspense
            fallback={<GovernedComponentSkeleton rendererId="list-surface" />}
          >
            <GovernedPatternCListTableHost
              surfaceKey={surfaceKey}
              sectionKey={resolvedSectionKey}
              componentKey={resolvedComponentKey}
              config={config}
              trailingColumn={trailingColumn}
            />
          </Suspense>
          {contentAfterList}
        </>
      );

      return isEmpty
        ? {
            state: "empty",
            model: {
              ...config.surface.empty,
              emptyId: `${resolvedComponentKey}-empty`,
            },
          }
        : { state: "ready", children };
    },
  });

  return renderGovernedPatternSectionShell({
    ...shellInput,
    body,
  });
}
