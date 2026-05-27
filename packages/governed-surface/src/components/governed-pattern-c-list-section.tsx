import "server-only";

import type { ReactNode } from "react";
import type { GovernedPatternCTrailingColumnSpec } from "../governed-pattern-c-trailing-column.shared";
import { GovernedPatternCListTableHost } from "./governed-pattern-c-list-table-host.client";
import { logUnexpectedServerError } from "../adapters/logger.server";
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
import { GovernedEmpty } from "./governed-empty";
import {
  GovernedSurfaceSectionCard,
  type GovernedSurfaceSectionCardBody,
} from "./governed-surface-section-card";

export type GovernedPatternCListSectionLayout = "card" | "embedded";

export type GovernedPatternCListSectionProps = {
  title: string;
  description?: string;
  listConfiguration: ListSurfaceRendererConfigurationInput;
  surfaceKey: string;
  layout?: GovernedPatternCListSectionLayout;
  /** Query/load failure before permission or parse — uses same card/embedded shell as other states. */
  loadError?: EmptyState;
  /**
   * Parent section already decided read access (e.g. page-level ERP permission).
   * Default `true`.
   */
  parentAccessAllowed?: boolean;
  /**
   * When `true`, evaluate `listConfiguration.requiresErpPermission` via
   * `resolveGovernedErpPermissionAllowed`. Default `true`.
   */
  resolveConfiguredPermission?: boolean;
  forbidden?: EmptyState;
  invalid?: EmptyState;
  headerSlot?: ReactNode;
  contentBeforeList?: ReactNode;
  contentAfterList?: ReactNode;
  /** Client Component cell reference or registry `cellId` — never pass `render` from Server Components. */
  trailingColumn?: GovernedPatternCTrailingColumnSpec;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
};

function renderListBody(body: GovernedSurfaceSectionCardBody) {
  if (body.state === "forbidden" || body.state === "invalid") {
    return <GovernedEmpty model={body.model} />;
  }
  return body.children;
}

type RenderSectionShellInput = {
  layout: GovernedPatternCListSectionLayout;
  className?: string;
  sectionTestId: string;
  sectionDomId: string;
  headerSlot?: ReactNode;
  title: string;
  description?: string;
  body: GovernedSurfaceSectionCardBody;
  cardClassName?: string;
  contentClassName?: string;
};

function renderSectionShell({
  layout,
  className,
  sectionTestId,
  sectionDomId,
  headerSlot,
  title,
  description,
  body,
  cardClassName,
  contentClassName,
}: RenderSectionShellInput) {
  const listBody = renderListBody(body);

  if (layout === "embedded") {
    return (
      <div id={sectionDomId} className={className} data-testid={sectionTestId}>
        {headerSlot}
        <div className={contentClassName}>{listBody}</div>
      </div>
    );
  }

  return (
    <div id={sectionDomId} className={className} data-testid={sectionTestId}>
      {headerSlot}
      <GovernedSurfaceSectionCard
        title={title}
        description={description}
        body={body}
        className={cardClassName}
        contentClassName={contentClassName}
      />
    </div>
  );
}

export async function GovernedPatternCListSection({
  title,
  description,
  listConfiguration,
  surfaceKey,
  layout = "card",
  loadError,
  parentAccessAllowed = true,
  resolveConfiguredPermission = true,
  forbidden,
  invalid,
  headerSlot,
  contentBeforeList,
  contentAfterList,
  trailingColumn,
  className,
  cardClassName,
  contentClassName,
}: GovernedPatternCListSectionProps) {
  const t = await getGovernedSurfaceTranslations("Erp");
  const sectionTestId = buildGovernedListSectionTestId(surfaceKey);
  const sectionDomId = governedListSectionDomId(surfaceKey);

  const shellInput = {
    layout,
    className,
    sectionTestId,
    sectionDomId,
    headerSlot,
    title,
    description,
    cardClassName,
    contentClassName,
  };

  if (loadError) {
    const body: GovernedSurfaceSectionCardBody = {
      state: "invalid",
      model: loadError,
    };
    return renderSectionShell({ ...shellInput, body });
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
      "GovernedPatternCListSection invalid list configuration",
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
          <GovernedPatternCListTableHost
            surfaceKey={surfaceKey}
            config={config}
            trailingColumn={trailingColumn}
          />
          {contentAfterList}
        </>
      ),
    };
  }

  return renderSectionShell({ ...shellInput, body });
}
