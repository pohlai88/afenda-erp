import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "./gov-render-governed-component";
import { resolveGovernedErpPermissionAllowed } from "./gov-governed-permission-gate-server";

import {
  parseGovernedActionBarConfiguration,
  type GovernedActionBarConfiguration,
  type GovernedActionBarConfigurationInput,
} from "./gov-action-bar-schema";
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

  const body = await resolveMetadataSectionBody<GovernedActionBarConfiguration>({
    loadError,
    parse: () => parseGovernedActionBarConfiguration(actionBarConfiguration),
    parseErrorLabel:
      "GovernedPatternBActionBarSection invalid action-bar configuration",
    parseContext: {
      surfaceKey,
      sectionKey: resolvedSectionKey,
      componentKey: resolvedComponentKey,
    },
    emptyStateIds: {
      loadError: "action-bar-section-load-error",
      invalid: "action-bar-section-invalid-config",
      forbidden: "action-bar-section-forbidden",
    },
    invalid,
    forbidden,
    resolvePermission: async (config) => {
      const allowedFromConfig = resolveConfiguredPermission
        ? await resolveGovernedErpPermissionAllowed(
            config.requiresErpPermission,
          )
        : true;
      return parentAccessAllowed && allowedFromConfig;
    },
    buildReadyBody: (config) => ({
      state: "ready",
      children: (
        <GovernedComponentRenderer
          surfaceKey={surfaceKey}
          sectionKey={resolvedSectionKey}
          componentKey={resolvedComponentKey}
          component={{
            type: "governed:action-bar",
            serverType: "governed:action-bar",
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
