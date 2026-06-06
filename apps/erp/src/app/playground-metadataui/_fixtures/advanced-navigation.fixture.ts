import "server-only";

import type {
  AppShellCommandSection,
  AppShellPrimaryLeftRailNavSection,
  AppShellPrimaryLeftRailNavIconId,
} from "@afenda/appshell/server";

import { METADATA_UI_PLAYGROUND_ROUTE } from "./constants.fixture";
import {
  METADATA_UI_ADVANCED_NAVIGATION_GROUPS,
  METADATA_UI_ADVANCED_PATTERN_SCENARIOS,
} from "./advanced-seed.fixture";
import type {
  MetadataUiAdvancedNavigationGroup,
  MetadataUiAdvancedPatternId,
  MetadataUiAdvancedPatternKind,
  MetadataUiAdvancedScenario,
} from "./advanced-seed-types.fixture";

const ADVANCED_PATTERN_ICON_BY_KIND = {
  overview: "layout-dashboard",
  "operations-list": "clipboard-check",
  "tanstack-table": "list",
  "record-detail": "file-text",
  "workflow-form": "pen-line",
  "planning-board": "calendar",
  analytics: "activity",
  "state-matrix": "scan-search",
} as const satisfies Record<
  MetadataUiAdvancedPatternKind,
  AppShellPrimaryLeftRailNavIconId
>;

const ADVANCED_PATTERN_KEYWORDS_BY_KIND = {
  overview: ["overview", "coverage", "renderer"],
  "operations-list": ["operations", "queue", "review"],
  "tanstack-table": ["table", "tanstack", "sort", "filter"],
  "record-detail": ["record", "detail", "tabs", "audit"],
  "workflow-form": ["form", "workflow", "scorecard"],
  "planning-board": ["planning", "kanban", "timeline"],
  analytics: ["analytics", "kpi", "chart"],
  "state-matrix": ["state", "loading", "empty", "error"],
} as const satisfies Record<
  MetadataUiAdvancedPatternKind,
  readonly string[]
>;

function createAdvancedScenarioHref(
  scenario: MetadataUiAdvancedScenario,
): string {
  return scenario.kind === "overview"
    ? METADATA_UI_PLAYGROUND_ROUTE
    : `${METADATA_UI_PLAYGROUND_ROUTE}/${scenario.kind}`;
}

function findAdvancedScenario(
  scenarioId: MetadataUiAdvancedPatternId,
): MetadataUiAdvancedScenario {
  const scenario = METADATA_UI_ADVANCED_PATTERN_SCENARIOS.find(
    (candidate) => candidate.id === scenarioId,
  );

  if (!scenario) {
    throw new Error(
      `Metadata UI playground advanced navigation references unknown scenario ${scenarioId}`,
    );
  }

  return scenario;
}

function createAdvancedRailSection(
  group: MetadataUiAdvancedNavigationGroup,
): AppShellPrimaryLeftRailNavSection {
  return {
    id: group.id,
    label: group.label,
    items: group.scenarioIds.map((scenarioId) => {
      const scenario = findAdvancedScenario(scenarioId);

      return {
        id: scenario.id,
        label: scenario.navigationLabel,
        description: scenario.description,
        href: createAdvancedScenarioHref(scenario),
        match: "exact",
        icon: ADVANCED_PATTERN_ICON_BY_KIND[scenario.kind],
      };
    }),
  };
}

function createAdvancedCommandSection(
  group: MetadataUiAdvancedNavigationGroup,
): AppShellCommandSection {
  return {
    id: `${group.id}.commands`,
    label: group.label,
    items: group.scenarioIds.map((scenarioId) => {
      const scenario = findAdvancedScenario(scenarioId);

      return {
        id: `${scenario.id}.open`,
        label: `Open ${scenario.navigationLabel}`,
        description: scenario.description,
        href: createAdvancedScenarioHref(scenario),
        icon: ADVANCED_PATTERN_ICON_BY_KIND[scenario.kind],
        kind: "navigation",
        keywords: [
          "metadata-ui",
          "playground",
          scenario.kind,
          ...ADVANCED_PATTERN_KEYWORDS_BY_KIND[scenario.kind],
        ],
      };
    }),
  };
}

export function createMetadataUiPlaygroundAdvancedRailSections(): readonly AppShellPrimaryLeftRailNavSection[] {
  return METADATA_UI_ADVANCED_NAVIGATION_GROUPS.map(createAdvancedRailSection);
}

export function createMetadataUiPlaygroundAdvancedCommandSections(): readonly AppShellCommandSection[] {
  return METADATA_UI_ADVANCED_NAVIGATION_GROUPS.map(createAdvancedCommandSection);
}
