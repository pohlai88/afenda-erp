import "server-only";

import type { ReactNode } from "react";
import { Suspense } from "react";

import type { GovernedPatternCTrailingColumnSpec } from "../governed-pattern-c-trailing-column.shared";
import { logUnexpectedServerError } from "../data/governed-logging.server";
import { resolveGovernedErpPermissionAllowed } from "../data/governed-permission-gate.server";
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy";
import { logGovernedListSurfaceRender } from "../log-governed-list-surface-render.server";
import {
  governedListSectionDomId,
  governedListSectionTestId as buildGovernedListSectionTestId,
  summarizeListSurfaceTrailingActions,
} from "../list-surface-identity.shared";

import type { EmptyState } from "../schemas/list-surface.schema";
import {
  parseListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfigurationInput,
} from "../schemas/list-surface-renderer.schema";
import { GovernedPatternCListTableHost } from "./governed-pattern-c-list-table-host.client";
import {
  renderGovernedPatternSectionShell,
  type GovernedPatternSectionDensity,
  type GovernedPatternSectionLayout,
  type RenderGovernedPatternSectionShellInput,
} from "./governed-pattern-section-shell.shared";
import type { GovernedSurfaceSectionCardBody } from "./governed-surface-section-card";

type GovernedPatternEmptyState = EmptyState & { emptyId?: string };

export type GovernedPatternCListSectionLayout = GovernedPatternSectionLayout;

export type GovernedPatternCListSectionProps = {
  title: string;
  description?: string;
  listConfiguration: ListSurfaceRendererConfigurationInput;
  surfaceKey: string;
  layout?: GovernedPatternCListSectionLayout;
  density?: GovernedPatternSectionDensity;
  /** Query/load failure before permission or parse — uses same card/embedded shell as other states. */
  loadError?: GovernedPatternEmptyState;
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
  forbidden?: GovernedPatternEmptyState;
  invalid?: GovernedPatternEmptyState;
  headerSlot?: ReactNode;
  /** Action element rendered in the card header (Pattern C parity with Pattern B `headerAction`). Ignored when `layout="embedded"`. */
  cardHeaderAction?: ReactNode;
  contentBeforeList?: ReactNode;
  contentAfterList?: ReactNode;
  /** Client Component cell reference or registry `cellId` — never pass `render` from Server Components. */
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
    headerAction: cardHeaderAction,
    title,
    description,
    cardClassName,
    contentClassName,
  } satisfies Omit<RenderGovernedPatternSectionShellInput, "body">;

  let body: GovernedSurfaceSectionCardBody;

  if (loadError) {
    body = {
      state: "invalid",
      model: {
        ...loadError,
        emptyId: loadError.emptyId ?? "pattern-c-load-error",
      },
    };
  } else {
    const parsed = parseListSurfaceRendererConfiguration(listConfiguration);

    if (!parsed.success) {
      logUnexpectedServerError(
        "GovernedPatternCListSection invalid list configuration",
        parsed.error,
        { surfaceKey },
      );

      body = {
        state: "invalid",
        model: {
          variant: "error",
          title: invalid?.title ?? t("GovernedSurface.invalidConfigTitle"),
          description:
            invalid?.description ?? t("GovernedSurface.invalidConfigDescription"),
          emptyId: invalid?.emptyId ?? "pattern-c-invalid-config",
        },
      };
    } else {
      const allowedFromConfig = resolveConfiguredPermission
        ? await resolveGovernedErpPermissionAllowed(
            listConfiguration.requiresErpPermission,
          )
        : true;
      const allowed = parentAccessAllowed && allowedFromConfig;

      if (!allowed) {
        body = {
          state: "forbidden",
          model: {
            variant: "forbidden",
            title: forbidden?.title ?? t("GovernedSurface.forbiddenTitle"),
            description:
              forbidden?.description ??
              t("GovernedSurface.forbiddenDescription"),
            emptyId: forbidden?.emptyId ?? "pattern-c-forbidden",
          },
        };
      } else {
        const config: ListSurfaceRendererConfiguration = parsed.data;
        const isEmpty = config.rows.length === 0;
        const listState = isEmpty ? "empty" : "ready";
        const tableDensity = config.presentation?.tableDensity ?? "compact";
        const presentationVariant =
          config.presentation?.variant ?? "table-only";

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
              <Suspense fallback={null}>
                <GovernedPatternCListTableHost
                  surfaceKey={surfaceKey}
                  config={config}
                  trailingColumn={trailingColumn}
                />
              </Suspense>
              {contentAfterList}
            </>
          ),
        };
      }
    }
  }

  return renderGovernedPatternSectionShell({
    ...shellInput,
    body,
  });
}
