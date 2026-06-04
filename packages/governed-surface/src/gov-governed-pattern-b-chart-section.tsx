import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "./gov-render-governed-component";
import { governedTestId } from "./gov-governed-identity-shared";

import type { EmptyState } from "./gov-list-surface-schema";
import {
  parseGovernedChartConfiguration,
  type GovernedChartConfigurationInput,
} from "./gov-chart-schema";
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

export type GovernedPatternBChartSectionLayout = GovernedPatternSectionLayout;

export type GovernedPatternBChartSectionProps = {
  title: string;
  description?: string;
  surfaceKey: string;
  sectionKey?: string;
  componentKey?: string;
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
  sectionKey,
  componentKey,
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
  const defaultSectionKey = `${surfaceKey}-chart`;
  const resolvedSectionKey = sectionKey ?? defaultSectionKey;
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

  const body = await resolveMetadataSectionBody({
    loadError,
    forbiddenPreset: forbidden
      ? ({
          ...forbidden,
          emptyId:
            typeof (forbidden as GovernedPatternEmptyState).emptyId === "string"
              ? (forbidden as GovernedPatternEmptyState).emptyId
              : "chart-section-forbidden",
        } satisfies GovernedPatternEmptyState)
      : undefined,
    parse: () => parseGovernedChartConfiguration(chartConfiguration),
    parseErrorLabel: "GovernedPatternBChartSection invalid chart configuration",
    parseContext: {
      surfaceKey,
      sectionKey: resolvedSectionKey,
      componentKey: resolvedComponentKey,
    },
    emptyStateIds: {
      loadError: "chart-section-load-error",
      invalid: "chart-section-invalid-config",
      forbidden: "chart-section-forbidden",
    },
    invalid,
    buildReadyBody: (config) => ({
      state: "ready",
      children: (
        <GovernedComponentRenderer
          surfaceKey={surfaceKey}
          sectionKey={resolvedSectionKey}
          componentKey={resolvedComponentKey}
          component={{
            type: "governed:chart",
            serverType: "governed:chart",
            configuration: config,
          }}
        />
      ),
    }),
  });

  return renderGovernedPatternSectionShell({
    ...shellInput,
    body,
  });
}
