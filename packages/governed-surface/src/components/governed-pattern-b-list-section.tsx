import "server-only";

import type { ReactNode } from "react";
import { GovernedComponentRenderer } from "../metadata/index";
import { logUnexpectedServerError } from "../data/governed-logging.server";
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy";

import type { EmptyState } from "../schemas/list-surface.schema";
import {
  parseListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfigurationInput,
} from "../schemas/list-surface-renderer.schema";
import { resolveGovernedErpPermissionAllowed } from "../data/governed-permission-gate.server";
import { logGovernedListSurfaceRender } from "../log-governed-list-surface-render.server";
import {
  governedListSectionDomId,
  governedListSectionTestId as buildGovernedListSectionTestId,
  summarizeListSurfaceTrailingActions,
} from "../list-surface-identity.shared";
import {
  type GovernedSurfaceSectionCardBody,
} from "./governed-surface-section-card";
import {
  renderGovernedPatternSectionShell,
  type GovernedPatternSectionDensity,
  type GovernedPatternSectionLayout,
} from "./governed-pattern-section-shell.shared";

export type GovernedPatternBListSectionLayout = GovernedPatternSectionLayout;

export type GovernedPatternBListSectionProps = {
  title: string;
  description?: string;
  listConfiguration: ListSurfaceRendererConfigurationInput;
  surfaceKey: string;
  layout?: GovernedPatternBListSectionLayout;
  density?: GovernedPatternSectionDensity;
  loadError?: EmptyState;
  parentAccessAllowed?: boolean;
  resolveConfiguredPermission?: boolean;
  forbidden?: EmptyState;
  invalid?: EmptyState;
  headerSlot?: ReactNode;
  /** Rendered inside `CardHeader` via `CardAction` (e.g. Add contact). */
  headerAction?: ReactNode;
  contentBeforeList?: ReactNode;
  contentAfterList?: ReactNode;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
};

export async function GovernedPatternBListSection({
  title,
  description,
  listConfiguration,
  surfaceKey,
  layout = "card",
  density = "comfortable",
  loadError,
  parentAccessAllowed = true,
  resolveConfiguredPermission = true,
  forbidden,
  invalid,
  headerSlot,
  headerAction,
  contentBeforeList,
  contentAfterList,
  className,
  cardClassName,
  contentClassName,
}: GovernedPatternBListSectionProps) {
  const t = await getGovernedSurfaceTranslations("Erp");
  const sectionTestId = buildGovernedListSectionTestId(surfaceKey);
  const sectionDomId = governedListSectionDomId(surfaceKey);

  const shellInput = {
    layout,
    density,
    className,
    sectionTestId,
    sectionDomId,
    surfaceKey,
    sectionKey: surfaceKey,
    headerSlot,
    title,
    description,
    headerAction,
    cardClassName,
    contentClassName,
  };

  if (loadError) {
    const body: GovernedSurfaceSectionCardBody = {
      state: "invalid",
      model: loadError,
    };
    return renderGovernedPatternSectionShell({ ...shellInput, body });
  }

  const [allowedFromConfig, parsed] = await Promise.all([
    resolveConfiguredPermission
      ? resolveGovernedErpPermissionAllowed(
          listConfiguration.requiresErpPermission,
        )
      : Promise.resolve(true),
    Promise.resolve(parseListSurfaceRendererConfiguration(listConfiguration)),
  ]);
  const allowed = parentAccessAllowed && allowedFromConfig;

  const forbiddenModel: EmptyState = forbidden ?? {
    variant: "forbidden",
    title: t("GovernedSurface.forbiddenTitle"),
    description: t("GovernedSurface.forbiddenDescription"),
  };
  const invalidModel: EmptyState = invalid ?? {
    variant: "error",
    title: t("GovernedSurface.invalidConfigTitle"),
    description: t("GovernedSurface.invalidConfigDescription"),
  };

  let body: GovernedSurfaceSectionCardBody;
  if (!allowed) {
    body = { state: "forbidden", model: forbiddenModel };
  } else if (!parsed.success) {
    logUnexpectedServerError(
      "GovernedPatternBListSection invalid list configuration",
      parsed.error,
      { surfaceKey },
    );
    body = { state: "invalid", model: invalidModel };
  } else {
    const config: ListSurfaceRendererConfiguration = parsed.data;
    const isEmpty = config.rows.length === 0;
    const listState = isEmpty ? "empty" : "ready";
    const tableDensity = config.presentation?.tableDensity ?? "compact";
    const presentationVariant = config.presentation?.variant ?? "table-only";

    logGovernedListSurfaceRender({
      surfaceKey,
      columnsId: config.surface.columnsId,
      dataNature: config.dataNature,
      presentationVariant,
      density: tableDensity,
      state: listState,
      rowCount: config.rows.length,
      trailing: summarizeListSurfaceTrailingActions(config.rows),
    });

    body = {
      state: listState,
      children: (
        <>
          {contentBeforeList}
          <GovernedComponentRenderer
            component={{
              type: "governed:list-surface",
              serverType: "governed:list-surface",
              configuration: config,
            }}
            surfaceKey={surfaceKey}
          />
          {contentAfterList}
        </>
      ),
    };
  }

  return renderGovernedPatternSectionShell({
    ...shellInput,
    body,
  });
}
