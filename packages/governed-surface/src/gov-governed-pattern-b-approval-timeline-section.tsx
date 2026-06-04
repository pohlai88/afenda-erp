import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "./gov-render-governed-component";
import { governedRendererCopy } from "./gov-governed-renderer-copy-shared";

import {
  parseGovernedApprovalTimelineConfiguration,
  type GovernedApprovalTimelineConfiguration,
  type GovernedApprovalTimelineConfigurationInput,
} from "./gov-approval-timeline-schema";
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

export type GovernedPatternBApprovalTimelineSectionLayout =
  GovernedPatternSectionLayout;

export type GovernedPatternBApprovalTimelineSectionProps = {
  title: string;
  description?: string;
  surfaceKey: string;
  sectionKey?: string;
  componentKey?: string;
  timelineConfiguration: GovernedApprovalTimelineConfigurationInput;
  layout?: GovernedPatternBApprovalTimelineSectionLayout;
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

export async function GovernedPatternBApprovalTimelineSection({
  title,
  description,
  surfaceKey,
  sectionKey,
  componentKey,
  timelineConfiguration,
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
}: GovernedPatternBApprovalTimelineSectionProps) {
  const resolvedSectionKey = sectionKey ?? `${surfaceKey}-approval-timeline`;
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

  const body = await resolveMetadataSectionBody<GovernedApprovalTimelineConfiguration>({
    loadError,
    parentAccessAllowed,
    parse: () =>
      parseGovernedApprovalTimelineConfiguration(timelineConfiguration),
    parseErrorLabel:
      "GovernedPatternBApprovalTimelineSection invalid timeline configuration",
    parseContext: {
      surfaceKey,
      sectionKey: resolvedSectionKey,
      componentKey: resolvedComponentKey,
    },
    emptyStateIds: {
      loadError: "approval-timeline-section-load-error",
      invalid: "approval-timeline-section-invalid-config",
      forbidden: "approval-timeline-section-forbidden",
    },
    invalid,
    forbidden,
    buildReadyBody: (config) => {
      if (config.steps.length === 0) {
        return {
          state: "empty",
          model: {
            variant: "muted",
            title: governedRendererCopy.empty.approvalTimeline.title,
            description:
              governedRendererCopy.empty.approvalTimeline.description,
            emptyId: `${resolvedComponentKey}-empty`,
          },
        };
      }

      return {
        state: "ready",
        children: (
          <GovernedComponentRenderer
            surfaceKey={surfaceKey}
            sectionKey={resolvedSectionKey}
            componentKey={resolvedComponentKey}
            component={{
              type: "governed:approval-timeline",
              serverType: "governed:approval-timeline",
              configuration: config,
            }}
          />
        ),
      };
    },
  });

  return renderGovernedPatternSectionShell({
    ...shellInput,
    body,
  });
}
