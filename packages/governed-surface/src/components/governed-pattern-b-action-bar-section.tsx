import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "../metadata/index";
import { logUnexpectedServerError } from "../data/governed-logging.server";
import { resolveGovernedErpPermissionAllowed } from "../data/governed-permission-gate.server";
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy";

import {
  parseGovernedActionBarConfiguration,
  type GovernedActionBarConfigurationInput,
} from "../schemas/action-bar.schema";
import type { EmptyState } from "../schemas/list-surface.schema";
import {
  renderGovernedPatternSectionShell,
  type GovernedPatternSectionDensity,
  type GovernedPatternSectionLayout,
  type RenderGovernedPatternSectionShellInput,
} from "./governed-pattern-section-shell.shared";
import type { GovernedSurfaceSectionCardBody } from "./governed-surface-section-card";

type GovernedPatternEmptyState = EmptyState & { emptyId?: string };

export type GovernedPatternBActionBarSectionLayout =
  GovernedPatternSectionLayout;

export type GovernedPatternBActionBarSectionProps = {
  title: string;
  description?: string;
  surfaceKey: string;
  sectionKey?: string;
  componentKey?: string;
  actionBarConfiguration: GovernedActionBarConfigurationInput;
  layout?: GovernedPatternBActionBarSectionLayout;
  density?: GovernedPatternSectionDensity;
  loadError?: GovernedPatternEmptyState;
  parentAccessAllowed?: boolean;
  resolveConfiguredPermission?: boolean;
  forbidden?: GovernedPatternEmptyState;
  invalid?: GovernedPatternEmptyState;
  headerSlot?: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
};

export async function GovernedPatternBActionBarSection({
  title,
  description,
  surfaceKey,
  sectionKey,
  componentKey,
  actionBarConfiguration,
  layout = "card",
  density = "comfortable",
  loadError,
  parentAccessAllowed = true,
  resolveConfiguredPermission = true,
  forbidden,
  invalid,
  headerSlot,
  headerAction,
  className,
  cardClassName,
  contentClassName,
}: GovernedPatternBActionBarSectionProps) {
  const t = await getGovernedSurfaceTranslations("Erp");
  const resolvedSectionKey = sectionKey ?? `${surfaceKey}-actions`;
  const resolvedComponentKey = componentKey ?? resolvedSectionKey;

  const shellInput = {
    layout,
    density,
    className,
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
        emptyId: loadError.emptyId ?? "action-bar-section-load-error",
      },
    };
  } else {
    const parsed = parseGovernedActionBarConfiguration(actionBarConfiguration);

    if (!parsed.success) {
      logUnexpectedServerError(
        "GovernedPatternBActionBarSection invalid action-bar configuration",
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
          emptyId: invalid?.emptyId ?? "action-bar-section-invalid-config",
        },
      };
    } else {
      const allowedFromConfig = resolveConfiguredPermission
        ? await resolveGovernedErpPermissionAllowed(
            parsed.data.requiresErpPermission,
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
            emptyId: forbidden?.emptyId ?? "action-bar-section-forbidden",
          },
        };
      } else {
        body = {
          state: "ready",
          children: (
            <GovernedComponentRenderer
              surfaceKey={surfaceKey}
              sectionKey={resolvedSectionKey}
              componentKey={resolvedComponentKey}
              component={{
                type: "governed:action-bar",
                serverType: "governed:action-bar",
                configuration: parsed.data,
              }}
            />
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
