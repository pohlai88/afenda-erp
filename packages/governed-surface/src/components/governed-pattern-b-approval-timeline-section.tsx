import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "../metadata/index";
import { logUnexpectedServerError } from "../data/governed-logging.server";
import { governedRendererCopy } from "../i18n/governed-renderer-copy.shared";
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy";

import type { EmptyState } from "../schemas/list-surface.schema";
import {
  parseGovernedApprovalTimelineConfiguration,
  type GovernedApprovalTimelineConfigurationInput,
} from "../schemas/approval-timeline.schema";
import {
  renderGovernedPatternSectionShell,
  type GovernedPatternSectionDensity,
  type GovernedPatternSectionLayout,
  type RenderGovernedPatternSectionShellInput,
} from "./governed-pattern-section-shell.shared";
import type { GovernedSurfaceSectionCardBody } from "./governed-surface-section-card";

type GovernedPatternEmptyState = EmptyState & { emptyId?: string };

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
  const t = await getGovernedSurfaceTranslations("Erp");
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

  let body: GovernedSurfaceSectionCardBody;

  if (loadError) {
    body = {
      state: "invalid",
      model: {
        ...loadError,
        emptyId: loadError.emptyId ?? "approval-timeline-section-load-error",
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
        emptyId: forbidden?.emptyId ?? "approval-timeline-section-forbidden",
      },
    };
  } else {
    const parsed =
      parseGovernedApprovalTimelineConfiguration(timelineConfiguration);

    if (!parsed.success) {
      logUnexpectedServerError(
        "GovernedPatternBApprovalTimelineSection invalid timeline configuration",
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
          emptyId:
            invalid?.emptyId ?? "approval-timeline-section-invalid-config",
        },
      };
    } else if (parsed.data.steps.length === 0) {
      body = {
        state: "empty",
        model: {
          variant: "muted",
          title: governedRendererCopy.empty.approvalTimeline.title,
          description: governedRendererCopy.empty.approvalTimeline.description,
          emptyId: `${resolvedComponentKey}-empty`,
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
              type: "governed:approval-timeline",
              serverType: "governed:approval-timeline",
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
