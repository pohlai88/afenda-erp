import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "./gov-render-governed-component";

import {
  parseGovernedScorecardFormConfiguration,
  type GovernedScorecardFormConfigurationInput,
} from "./gov-scorecard-form-schema";
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

  const body = await resolveMetadataSectionBody({
    loadError,
    parentAccessAllowed,
    parse: () => parseGovernedScorecardFormConfiguration(formConfiguration),
    parseErrorLabel:
      "GovernedPatternBScorecardFormSection invalid form configuration",
    parseContext: {
      surfaceKey,
      sectionKey: resolvedSectionKey,
      componentKey: resolvedComponentKey,
    },
    emptyStateIds: {
      loadError: "scorecard-form-section-load-error",
      invalid: "scorecard-form-section-invalid-config",
      forbidden: "scorecard-form-section-forbidden",
    },
    invalid,
    forbidden,
    buildReadyBody: (config) => ({
      state: "ready",
      children: (
        <GovernedComponentRenderer
          surfaceKey={surfaceKey}
          sectionKey={resolvedSectionKey}
          componentKey={resolvedComponentKey}
          component={{
            type: "governed:scorecard-form",
            serverType: "governed:scorecard-form",
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
