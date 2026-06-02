import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "../metadata/index";
import { logUnexpectedServerError } from "../data/governed-logging.server";
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy";
import { governedTestId } from "../utils/governed-identity.shared";

import type { EmptyState } from "../schemas/list-surface.schema";
import {
  parseGovernedChartConfiguration,
  type GovernedChartConfigurationInput,
} from "../schemas/chart.schema";
import {
  renderGovernedPatternSectionShell,
  type GovernedPatternSectionDensity,
  type GovernedPatternSectionLayout,
  type RenderGovernedPatternSectionShellInput,
} from "./governed-pattern-section-shell.shared";
import type { GovernedSurfaceSectionCardBody } from "./governed-surface-section-card";

type GovernedPatternEmptyState = EmptyState & { emptyId?: string };

export type GovernedPatternBChartSectionLayout = GovernedPatternSectionLayout;

export type GovernedPatternBChartSectionProps = {
  title: string;
  description?: string;
  surfaceKey: string;
  chartConfiguration: GovernedChartConfigurationInput;
  layout?: GovernedPatternBChartSectionLayout;
  density?: GovernedPatternSectionDensity;
  loadError?: GovernedPatternEmptyState;
  forbidden?: EmptyState;
  invalid?: GovernedPatternEmptyState;
  headerSlot?: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
};

export function governedChartSectionTestId(surfaceKey: string): string {
  return governedTestId("chart-section", surfaceKey);
}

export async function GovernedPatternBChartSection({
  title,
  description,
  surfaceKey,
  chartConfiguration,
  layout = "card",
  density = "comfortable",
  loadError,
  forbidden,
  invalid,
  headerSlot,
  headerAction,
  className,
  cardClassName,
  contentClassName,
}: GovernedPatternBChartSectionProps) {
  const t = await getGovernedSurfaceTranslations("Erp");
  const sectionTestId = governedChartSectionTestId(surfaceKey);

  const shellInput = {
    layout,
    density,
    className,
    sectionTestId,
    surfaceKey,
    sectionKey: surfaceKey,
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
        emptyId: loadError.emptyId ?? "chart-section-load-error",
      },
    };
  } else if (forbidden) {
    body = {
      state: "forbidden",
      model: forbidden,
    };
  } else {
    const parsed = parseGovernedChartConfiguration(chartConfiguration);

    if (!parsed.success) {
      logUnexpectedServerError(
        "GovernedPatternBChartSection invalid chart configuration",
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
          emptyId: invalid?.emptyId ?? "chart-section-invalid-config",
        },
      };
    } else {
      body = {
        state: "ready",
        children: (
          <GovernedComponentRenderer
            surfaceKey={surfaceKey}
            component={{
              type: "governed:chart",
              serverType: "governed:chart",
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
