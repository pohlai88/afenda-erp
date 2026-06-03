import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "./index";
import { logUnexpectedServerError } from "../data/governed-logging.server";
import { resolveGovernedErpPermissionAllowed } from "../data/governed-permission-gate.server";
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy";
import { logGovernedListSurfaceRender } from "./log-governed-list-surface-render.server";
import {
  governedListSectionDomId,
  summarizeListSurfaceTrailingActions,
} from "./list-surface-identity.shared";

import type { EmptyState } from "../schemas/list-surface.schema";
import {
  parseListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfiguration,
  type ListSurfaceRendererConfigurationInput,
} from "../schemas/list-surface-renderer.schema";
import {
  renderGovernedPatternSectionShell,
  type GovernedPatternSectionDensity,
  type GovernedPatternSectionLayout,
  type RenderGovernedPatternSectionShellInput,
} from "./governed-pattern-section-shell.shared";
import type { GovernedSurfaceSectionCardBody } from "./governed-surface-section-card";

type GovernedPatternEmptyState = EmptyState & { emptyId?: string };

export type GovernedPatternBListSectionLayout = GovernedPatternSectionLayout;

export type GovernedPatternBListSectionProps = {
  title: string;
  description?: string;
  listConfiguration: ListSurfaceRendererConfigurationInput;
  surfaceKey: string;
  sectionKey?: string;
  componentKey?: string;
  layout?: GovernedPatternBListSectionLayout;
  density?: GovernedPatternSectionDensity;
  loadError?: GovernedPatternEmptyState;
  parentAccessAllowed?: boolean;
  resolveConfiguredPermission?: boolean;
  forbidden?: GovernedPatternEmptyState;
  invalid?: GovernedPatternEmptyState;
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
  headerAction,
  contentBeforeList,
  contentAfterList,
  className,
  cardClassName,
  contentClassName,
}: GovernedPatternBListSectionProps) {
  const t = await getGovernedSurfaceTranslations("Erp");
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
    title,
    description,
    headerAction,
    cardClassName,
    contentClassName,
  } satisfies Omit<RenderGovernedPatternSectionShellInput, "body">;

  let body: GovernedSurfaceSectionCardBody;

  if (loadError) {
    body = {
      state: "invalid",
      model: {
        ...loadError,
        emptyId: loadError.emptyId ?? "list-section-load-error",
      },
    };
  } else {
    const parsed = parseListSurfaceRendererConfiguration(listConfiguration);

    if (!parsed.success) {
      logUnexpectedServerError(
        "GovernedPatternBListSection invalid list configuration",
        parsed.error,
        {
          surfaceKey,
          sectionKey: resolvedSectionKey,
          componentKey: resolvedComponentKey,
        },
      );

      body = {
        state: "invalid",
        model: {
          variant: "error",
          title: invalid?.title ?? t("GovernedSurface.invalidConfigTitle"),
          description:
            invalid?.description ?? t("GovernedSurface.invalidConfigDescription"),
          emptyId: invalid?.emptyId ?? "list-section-invalid-config",
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
            emptyId: forbidden?.emptyId ?? "list-section-forbidden",
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
            <GovernedComponentRenderer
              component={{
                type: "governed:list-surface",
                serverType: "governed:list-surface",
                configuration: config,
              }}
              surfaceKey={surfaceKey}
              sectionKey={resolvedSectionKey}
              componentKey={resolvedComponentKey}
            />
            {contentAfterList}
          </>
        );

        body = isEmpty
          ? {
              state: "empty",
              model: {
                ...config.surface.empty,
                emptyId: `${resolvedComponentKey}-empty`,
              },
            }
          : { state: "ready", children };
      }
    }
  }

  return renderGovernedPatternSectionShell({
    ...shellInput,
    body,
  });
}
