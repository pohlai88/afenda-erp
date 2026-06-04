import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "./gov-render-governed-component";
import { governedRendererCopy } from "./gov-governed-renderer-copy-shared";
import { diagnosticsDataAttributes } from "./gov-governed-diagnostics-shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "./gov-governed-identity-shared";

import {
  parseStatCardConfiguration,
  type StatCardConfiguration,
  type StatCardConfigurationInput,
} from "./gov-stat-card-schema";
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

export type GovernedPatternBStatSectionLayout = GovernedPatternSectionLayout;

export type GovernedPatternBStatGroup = {
  /** Stable id for group governance attrs (e.g. `registry`). */
  groupKey: string;
  /** Optional subgroup label above the stat-card renderer. */
  label?: string;
  configuration: StatCardConfigurationInput;
};

export type GovernedPatternBStatSectionProps = {
  title: string;
  description?: string;
  surfaceKey: string;
  sectionKey?: string;
  componentKey?: string;
  statGroups: ReadonlyArray<GovernedPatternBStatGroup>;
  layout?: GovernedPatternBStatSectionLayout;
  density?: GovernedPatternSectionDensity;
  loadError?: GovernedPatternEmptyState;
  forbidden?: GovernedPatternEmptyState;
  invalid?: GovernedPatternEmptyState;
  headerSlot?: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
};

type ParsedStatSectionData =
  | { kind: "empty" }
  | {
      kind: "groups";
      groups: ReadonlyArray<{
        group: GovernedPatternBStatGroup;
        configuration: StatCardConfiguration;
      }>;
    };

export function governedStatSectionTestId(surfaceKey: string): string {
  return governedTestId("stat-section", surfaceKey);
}

export async function GovernedPatternBStatSection({
  title,
  description,
  surfaceKey,
  sectionKey,
  componentKey,
  statGroups,
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
}: GovernedPatternBStatSectionProps) {
  const resolvedSectionKey = sectionKey ?? `${surfaceKey}-stats`;
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

  const body = await resolveMetadataSectionBody<ParsedStatSectionData>({
    loadError,
    forbiddenPreset: forbidden,
    parse: () => {
      if (statGroups.length === 0) {
        return { success: true, data: { kind: "empty" } };
      }

      const parsedGroups = statGroups.map((group) => ({
        group,
        parsed: parseStatCardConfiguration(group.configuration),
      }));
      const firstInvalid = parsedGroups.find((entry) => !entry.parsed.success);

      if (firstInvalid) {
        return {
          success: false,
          error: firstInvalid.parsed.error,
        };
      }

      return {
        success: true,
        data: {
          kind: "groups",
          groups: parsedGroups.flatMap(({ group, parsed }) =>
            parsed.success
              ? [{ group, configuration: parsed.data }]
              : [],
          ),
        },
      };
    },
    parseErrorLabel: "GovernedPatternBStatSection invalid stat configuration",
    parseContext: {
      surfaceKey,
      sectionKey: resolvedSectionKey,
      componentKey: resolvedComponentKey,
    },
    emptyStateIds: {
      loadError: "stat-section-load-error",
      invalid: "stat-section-invalid-config",
      forbidden: "stat-section-forbidden",
    },
    invalid,
    forbidden,
    buildReadyBody: (data) => {
      if (data.kind === "empty") {
        return {
          state: "empty",
          model: {
            variant: "muted",
            title: governedRendererCopy.empty.statCard.title,
            description: governedRendererCopy.empty.statCard.description,
            emptyId: `${resolvedComponentKey}-empty-groups`,
          },
        };
      }

      return {
        state: "ready",
        children: (
          <div className="flex flex-col gap-surface-lg">
            {data.groups.map(({ group, configuration }) => {
              const groupComponentKey = `${resolvedComponentKey}-${group.groupKey}`;

              return (
                <section
                  key={group.groupKey}
                  className="flex flex-col gap-2"
                  data-stat-group-key={group.groupKey}
                  {...governedIdentityAttributes({
                    surfaceKey,
                    sectionKey: resolvedSectionKey,
                    componentKey: groupComponentKey,
                  })}
                  {...diagnosticsDataAttributes({
                    state: "ready",
                    testId: governedTestId("stat-group", groupComponentKey),
                  })}
                >
                  {group.label ? (
                    <p className="type-muted font-medium">{group.label}</p>
                  ) : null}

                  <GovernedComponentRenderer
                    component={{
                      type: "governed:stat-card",
                      serverType: "governed:stat-card",
                      configuration,
                    }}
                    surfaceKey={surfaceKey}
                    sectionKey={resolvedSectionKey}
                    componentKey={groupComponentKey}
                  />
                </section>
              );
            })}
          </div>
        ),
      };
    },
  });

  return renderGovernedPatternSectionShell({
    ...shellInput,
    body,
  });
}
