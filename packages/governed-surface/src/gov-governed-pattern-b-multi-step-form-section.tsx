import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "./index";
import { logUnexpectedServerError } from "../data/governed-logging.server";
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy";

import type { EmptyState } from "../schemas/list-surface.schema";
import {
  parseGovernedMultiStepFormConfiguration,
  type GovernedMultiStepFormConfigurationInput,
} from "../schemas/multi-step-form.schema";
import {
  renderGovernedPatternSectionShell,
  type GovernedPatternSectionDensity,
  type GovernedPatternSectionLayout,
  type RenderGovernedPatternSectionShellInput,
} from "./governed-pattern-section-shell.shared";
import type { GovernedSurfaceSectionCardBody } from "./governed-surface-section-card";

type GovernedPatternEmptyState = EmptyState & { emptyId?: string };

export type GovernedPatternBMultiStepFormSectionLayout =
  GovernedPatternSectionLayout;

export type GovernedPatternBMultiStepFormSectionProps = {
  title: string;
  description?: string;
  surfaceKey: string;
  sectionKey?: string;
  componentKey?: string;
  formConfiguration: GovernedMultiStepFormConfigurationInput;
  layout?: GovernedPatternBMultiStepFormSectionLayout;
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

export async function GovernedPatternBMultiStepFormSection({
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
}: GovernedPatternBMultiStepFormSectionProps) {
  const t = await getGovernedSurfaceTranslations("Erp");
  const resolvedSectionKey = sectionKey ?? `${surfaceKey}-form`;
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
        emptyId: loadError.emptyId ?? "multi-step-form-section-load-error",
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
        emptyId: forbidden?.emptyId ?? "multi-step-form-section-forbidden",
      },
    };
  } else {
    const parsed = parseGovernedMultiStepFormConfiguration(formConfiguration);

    if (!parsed.success) {
      logUnexpectedServerError(
        "GovernedPatternBMultiStepFormSection invalid form configuration",
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
          emptyId: invalid?.emptyId ?? "multi-step-form-section-invalid-config",
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
              type: "governed:multi-step-form",
              serverType: "governed:multi-step-form",
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
