import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "./gov-render-governed-component";

import {
  parseGovernedMultiStepFormConfiguration,
  type GovernedMultiStepFormConfigurationInput,
} from "./gov-multi-step-form-schema";
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

  const body = await resolveMetadataSectionBody({
    loadError,
    parentAccessAllowed,
    parse: () => parseGovernedMultiStepFormConfiguration(formConfiguration),
    parseErrorLabel:
      "GovernedPatternBMultiStepFormSection invalid form configuration",
    parseContext: {
      surfaceKey,
      sectionKey: resolvedSectionKey,
      componentKey: resolvedComponentKey,
    },
    emptyStateIds: {
      loadError: "multi-step-form-section-load-error",
      invalid: "multi-step-form-section-invalid-config",
      forbidden: "multi-step-form-section-forbidden",
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
            type: "governed:multi-step-form",
            serverType: "governed:multi-step-form",
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
