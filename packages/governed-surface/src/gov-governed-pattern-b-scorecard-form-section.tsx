import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "./index";
import { logUnexpectedServerError } from "../data/governed-logging.server";
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy";

import type { EmptyState } from "../schemas/list-surface.schema";
import {
  parseGovernedScorecardFormConfiguration,
  type GovernedScorecardFormConfigurationInput,
} from "../schemas/scorecard-form.schema";
import {
  renderGovernedPatternSectionShell,
  type GovernedPatternSectionDensity,
  type GovernedPatternSectionLayout,
  type RenderGovernedPatternSectionShellInput,
} from "./governed-pattern-section-shell.shared";
import type { GovernedSurfaceSectionCardBody } from "./governed-surface-section-card";

type GovernedPatternEmptyState = EmptyState & { emptyId?: string };

export type GovernedPatternBScorecardFormSectionLayout =
  GovernedPatternSectionLayout;

export type GovernedPatternBScorecardFormSectionProps = {
  title: string;
  description?: string;
  surfaceKey: string;
  sectionKey?: string;
  componentKey?: string;
  formConfiguration: GovernedScorecardFormConfigurationInput;
  layout?: GovernedPatternBScorecardFormSectionLayout;
  density?: GovernedPatternSectionDensity;
  loadError?: GovernedPatternEmptyState;
  parentAccessAllowed?: boolean;
  forbidden?: GovernedPatternEmptyState;
  invalid?: GovernedPatternEmptyState;
  headerSlot?: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
};

export async function GovernedPatternBScorecardFormSection({
  title,
  description,
  surfaceKey,
  sectionKey,
  componentKey,
  formConfiguration,
  layout = "card",
  density = "comfortable",
  loadError,
  parentAccessAllowed = true,
  forbidden,
  invalid,
  headerSlot,
  headerAction,
  className,
  cardClassName,
  contentClassName,
}: GovernedPatternBScorecardFormSectionProps) {
  const t = await getGovernedSurfaceTranslations("Erp");
  const resolvedSectionKey = sectionKey ?? `${surfaceKey}-scorecard-form`;
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
        emptyId: loadError.emptyId ?? "scorecard-form-section-load-error",
      },
    };
  } else if (!parentAccessAllowed) {
    body = {
      state: "forbidden",
      model: {
        variant: "forbidden",
        title: forbidden?.title ?? t("GovernedSurface.forbiddenTitle"),
        description:
          forbidden?.description ?? t("GovernedSurface.forbiddenDescription"),
        emptyId: forbidden?.emptyId ?? "scorecard-form-section-forbidden",
      },
    };
  } else {
    const parsed = parseGovernedScorecardFormConfiguration(formConfiguration);

    if (!parsed.success) {
      logUnexpectedServerError(
        "GovernedPatternBScorecardFormSection invalid form configuration",
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
          emptyId: invalid?.emptyId ?? "scorecard-form-section-invalid-config",
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
              type: "governed:scorecard-form",
              serverType: "governed:scorecard-form",
              configuration: parsed.data,
            }}
          />
        ),
      };
    }
  }

  return renderGovernedPatternSectionShell({
    ...shellInput,
    body,
  });
}
