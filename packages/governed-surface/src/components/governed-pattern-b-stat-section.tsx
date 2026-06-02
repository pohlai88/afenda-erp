import "server-only";

import type { ReactNode } from "react";

import { GovernedComponentRenderer } from "../metadata/index";
import { logUnexpectedServerError } from "../data/governed-logging.server";
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy";
import { governedTestId } from "../utils/governed-identity.shared";

import type { EmptyState } from "../schemas/list-surface.schema";
import {
  parseStatCardConfiguration,
  type StatCardConfigurationInput,
} from "../schemas/stat-card.schema";
import type { GovernedSurfaceSectionCardBody } from "./governed-surface-section-card";
import {
  renderGovernedPatternSectionShell,
  type GovernedPatternSectionDensity,
  type GovernedPatternSectionLayout,
  type RenderGovernedPatternSectionShellInput,
} from "./governed-pattern-section-shell.shared";

type GovernedPatternEmptyState = EmptyState & { emptyId?: string };

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

export function governedStatSectionTestId(surfaceKey: string): string {
  return governedTestId("stat-section", surfaceKey);
}

export async function GovernedPatternBStatSection({
  title,
  description,
  surfaceKey,
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
  const t = await getGovernedSurfaceTranslations("Erp");
  const sectionTestId = governedStatSectionTestId(surfaceKey);

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

  const fallbackInvalidModel: GovernedPatternEmptyState = {
    variant: "error",
    title: invalid?.title ?? t("GovernedSurface.invalidConfigTitle"),
    description:
      invalid?.description ?? t("GovernedSurface.invalidConfigDescription"),
    emptyId: invalid?.emptyId ?? "stat-section-invalid-config",
  };

  let body: GovernedSurfaceSectionCardBody;

  if (loadError) {
    body = {
      state: "invalid",
      model: {
        ...loadError,
        emptyId: loadError.emptyId ?? "stat-section-load-error",
      },
    };
  } else if (forbidden) {
    body = {
      state: "forbidden",
      model: {
        ...forbidden,
        emptyId: forbidden.emptyId ?? "stat-section-forbidden",
      },
    };
  } else if (statGroups.length === 0) {
    body = {
      state: "invalid",
      model: {
        ...fallbackInvalidModel,
        emptyId: invalid?.emptyId ?? "stat-section-empty-groups",
      },
    };
  } else {
    const parsedGroups = statGroups.map((group) => ({
      group,
      parsed: parseStatCardConfiguration(group.configuration),
    }));

    const firstInvalid = parsedGroups.find((entry) => !entry.parsed.success);

    if (firstInvalid) {
      logUnexpectedServerError(
        "GovernedPatternBStatSection invalid stat configuration",
        firstInvalid.parsed.error,
        { surfaceKey, groupKey: firstInvalid.group.groupKey },
      );

      body = {
        state: "invalid",
        model: fallbackInvalidModel,
      };
    } else {
      const validGroups = parsedGroups.map(({ group, parsed }) => ({
        group,
        configuration: parsed.data,
      }));

      body = {
        state: "ready",
        children: (
          <div className="flex flex-col gap-surface-lg">
            {validGroups.map(({ group, configuration }) => (
              <section
                key={group.groupKey}
                className="flex flex-col gap-2"
                data-stat-group-key={group.groupKey}
                data-testid={governedTestId(
                  "stat-group",
                  `${surfaceKey}:${group.groupKey}`,
                )}
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
                />
              </section>
            ))}
          </div>
        ),
      };
    }
  }

  return renderGovernedPatternSectionShell({
    ...shellInput,
    body,
  });
}
