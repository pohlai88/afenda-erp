import "server-only";

import type { ReactNode } from "react";
import { getGovernedSurfaceTranslations } from "../i18n/governed-surface-copy";

import { GovernedComponentRenderer } from "../metadata/index";
import { logUnexpectedServerError } from "../data/governed-logging.server";

import type { EmptyState } from "../schemas/list-surface.schema";
import {
  parseStatCardConfiguration,
  type StatCardConfigurationInput,
} from "../schemas/stat-card.schema";
import {
  type GovernedSurfaceSectionCardBody,
} from "./governed-surface-section-card";
import {
  renderGovernedPatternSectionShell,
  type GovernedPatternSectionLayout,
} from "./governed-pattern-section-shell.shared";

export type GovernedPatternBStatSectionLayout = GovernedPatternSectionLayout;

export type GovernedPatternBStatGroup = {
  /** Stable id for `data-testid` on the group wrapper (e.g. `registry`). */
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
  loadError?: EmptyState;
  forbidden?: EmptyState;
  invalid?: EmptyState;
  headerSlot?: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
};

export function governedStatSectionTestId(surfaceKey: string): string {
  return `governed-stat-section:${surfaceKey}`;
}

export async function GovernedPatternBStatSection({
  title,
  description,
  surfaceKey,
  statGroups,
  layout = "card",
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

  const parsedGroups = statGroups.map((group) => ({
    group,
    parsed: parseStatCardConfiguration(group.configuration),
  }));

  const firstInvalid = parsedGroups.find((entry) => !entry.parsed.success);
  let body: GovernedSurfaceSectionCardBody;

  if (firstInvalid) {
    logUnexpectedServerError(
      "GovernedPatternBStatSection invalid stat configuration",
      firstInvalid.parsed.error,
      { surfaceKey, groupKey: firstInvalid.group.groupKey },
    );
    body = { state: "invalid", model: invalidModel };
  } else if (parsedGroups.length === 0) {
    body = { state: "invalid", model: invalidModel };
  } else {
    body = {
      state: "ready",
      children: (
        <div className="flex flex-col gap-surface-lg">
          {parsedGroups.map(({ group, parsed }) => {
            if (!parsed.success) {
              return null;
            }
            return (
              <section
                key={group.groupKey}
                className="flex flex-col gap-2"
                data-testid={`governed-stat-group:${surfaceKey}:${group.groupKey}`}
              >
                {group.label ? (
                  <p className="type-muted font-medium">
                    {group.label}
                  </p>
                ) : null}
                <GovernedComponentRenderer
                  component={{
                    type: "governed:stat-card",
                    serverType: "governed:stat-card",
                    configuration: parsed.data,
                  }}
                  surfaceKey={surfaceKey}
                />
              </section>
            );
          })}
        </div>
      ),
    };
  }

  return renderGovernedPatternSectionShell({ ...shellInput, body });
}
