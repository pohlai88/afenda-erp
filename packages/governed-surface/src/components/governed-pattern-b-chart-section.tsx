import "server-only";

import type { ReactNode } from "react";
import { GovernedComponentRenderer } from "../metadata/index";
import { logUnexpectedServerError } from "../data/governed-logging.server";
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy";

import type { EmptyState } from "../schemas/list-surface.schema";
import {
  parseGovernedChartConfiguration,
  type GovernedChartConfigurationInput,
} from "../schemas/chart.schema";
import { type GovernedSurfaceSectionCardBody } from "./governed-surface-section-card";
import {
  renderGovernedPatternSectionShell,
  type GovernedPatternSectionDensity,
  type GovernedPatternSectionLayout,
} from "./governed-pattern-section-shell.shared";

export type GovernedPatternBChartSectionLayout = GovernedPatternSectionLayout;

export type GovernedPatternBChartSectionProps = {
  title: string;
  description?: string;
  surfaceKey: string;
  chartConfiguration: GovernedChartConfigurationInput;
  layout?: GovernedPatternBChartSectionLayout;
  density?: GovernedPatternSectionDensity;
  loadError?: EmptyState;
  forbidden?: EmptyState;
  invalid?: EmptyState;
  headerSlot?: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
};

export function governedChartSectionTestId(surfaceKey: string): string {
  return `governed-chart-section:${surfaceKey}`;
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
    headerSlot,
    title,
    description,
    headerAction,
    cardClassName,
    contentClassName,
  };

  const invalidModel: EmptyState = invalid ?? {
    variant: "error",
    title: t("GovernedSurface.invalidConfigTitle"),
    description: t("GovernedSurface.invalidConfigDescription"),
  };

  if (loadError) {
    const body: GovernedSurfaceSectionCardBody = {
      state: "invalid",
      model: loadError,
    };
    return renderGovernedPatternSectionShell({ ...shellInput, body });
  }

  if (forbidden) {
    return renderGovernedPatternSectionShell({
      ...shellInput,
      body: { state: "forbidden", model: forbidden },
    });
  }

  const parsed = parseGovernedChartConfiguration(chartConfiguration);
  let body: GovernedSurfaceSectionCardBody;

  if (!parsed.success) {
    logUnexpectedServerError(
      "GovernedPatternBChartSection invalid chart configuration",
      parsed.error,
      { surfaceKey },
    );
    body = { state: "invalid", model: invalidModel };
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

  return renderGovernedPatternSectionShell({ ...shellInput, body });
}
