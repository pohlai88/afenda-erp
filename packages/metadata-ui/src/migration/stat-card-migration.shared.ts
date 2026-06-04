import {
  parseMetadataUiActionContract,
  type MetadataUiActionContractInput,
} from "../contracts/action.contract";
import {
  parseMetadataUiStat,
  type MetadataUiStat,
  type MetadataUiStatComparisonInput,
  type MetadataUiStatInput,
  type MetadataUiStatItemInput,
  type MetadataUiStatTone,
} from "../schemas/stat.schema";

export type MetadataUiGovernedStatTone =
  | "positive"
  | "attention"
  | "default"
  | "critical";

export type MetadataUiGovernedStatDensity = "compact" | "comfortable";

export type MetadataUiGovernedStatPresentationProfile =
  | "erp-kpi-grid"
  | "erp-executive-summary";

export type MetadataUiGovernedStatComparisonInput = Readonly<{
  priorValue: string;
  label: string;
  direction: "up" | "down" | "flat";
}>;

export type MetadataUiGovernedStatProgressInput = Readonly<{
  value: number;
  max: number;
  label?: string;
}>;

export type MetadataUiGovernedStatSparkPointInput = Readonly<{
  value: number;
}>;

export type MetadataUiGovernedStatItemInput = Readonly<{
  label: string;
  value: string;
  delta?: string;
  tone?: MetadataUiGovernedStatTone;
  href?: string;
  icon?: "clock" | "alert" | "users" | "calendar" | "activity" | "shield";
  sparkPoints?: readonly MetadataUiGovernedStatSparkPointInput[];
  progress?: MetadataUiGovernedStatProgressInput;
  comparison?: MetadataUiGovernedStatComparisonInput;
  animateValue?: boolean;
}>;

export type MetadataUiGovernedStatAdapterInput = Readonly<{
  key?: string;
  title?: string;
  description?: string;
  dataNature?: "kpi" | "snapshot-summary";
  density?: MetadataUiGovernedStatDensity;
  presentationProfile?: MetadataUiGovernedStatPresentationProfile;
  stats: readonly MetadataUiGovernedStatItemInput[];
  metadata?: Readonly<Record<string, unknown>>;
}>;

export type MetadataUiGovernedStatParityNote = Readonly<{
  itemKey: string;
  sourceField: "animateValue" | "delta" | "icon" | "progress" | "sparkPoints";
  disposition: "carried-as-metadata" | "mapped-to-comparison";
  message: string;
}>;

export type MetadataUiGovernedStatAdapterResult = Readonly<{
  stat: MetadataUiStat;
  parityNotes: readonly MetadataUiGovernedStatParityNote[];
}>;

const GOVERNED_STAT_TONE_TO_METADATA_UI_TONE = {
  default: "neutral",
  positive: "positive",
  attention: "warning",
  critical: "critical",
} as const satisfies Record<MetadataUiGovernedStatTone, MetadataUiStatTone>;

function normalizeMetadataUiMigrationKey(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "stat";
}

function createGovernedStatItemKey(
  item: MetadataUiGovernedStatItemInput,
  index: number,
): string {
  return `governed.${normalizeMetadataUiMigrationKey(item.label)}.${index + 1}`;
}

function resolveGovernedStatPresentation(
  input: MetadataUiGovernedStatAdapterInput,
): MetadataUiStatInput["presentation"] {
  const density = input.density ?? "comfortable";

  return {
    profileId: "metadata-ui.presentation.metric",
    chrome: {
      surface: "card",
      density,
      emphasis:
        input.presentationProfile === "erp-executive-summary"
          ? "medium"
          : "high",
      tone: "neutral",
    },
    layout: {
      layout: "grid",
      alignment: "between",
      width: "full",
    },
    visibility: {
      showHeader: true,
      showDescription: false,
      showChrome: true,
      showDivider: false,
    },
    responsive: {
      collapseBelow: "sm",
      priority: input.presentationProfile === "erp-executive-summary" ? 70 : 80,
    },
    metadata: {
      migrationSource: "governed-surface.stat-card",
      governedPresentationProfile: input.presentationProfile,
      governedDensity: density,
    },
  };
}

function createGovernedStatDrilldownAction(
  itemKey: string,
  item: MetadataUiGovernedStatItemInput,
): MetadataUiActionContractInput | undefined {
  if (!item.href) {
    return undefined;
  }

  return parseMetadataUiActionContract({
    id: `${itemKey}.drilldown`,
    label: item.label,
    intent: "navigate",
    tone: "neutral",
    risk: "low",
    execution: {
      kind: "navigation",
      href: item.href,
      target: "self",
    },
    metadata: {
      migrationSource: "governed-surface.stat-card.href",
    },
  });
}

function createGovernedStatComparison(
  item: MetadataUiGovernedStatItemInput,
): MetadataUiStatComparisonInput | undefined {
  if (item.comparison) {
    return {
      label: item.comparison.label,
      value: item.comparison.priorValue,
      direction: item.comparison.direction,
    };
  }

  if (!item.delta) {
    return undefined;
  }

  return {
    label: "Delta",
    value: item.delta,
    direction: "flat",
  };
}

function collectGovernedStatParityNotes(
  itemKey: string,
  item: MetadataUiGovernedStatItemInput,
): readonly MetadataUiGovernedStatParityNote[] {
  const notes: MetadataUiGovernedStatParityNote[] = [];

  if (item.delta && !item.comparison) {
    notes.push({
      itemKey,
      sourceField: "delta",
      disposition: "mapped-to-comparison",
      message: "Governed delta was mapped to a flat comparison.",
    });
  }

  if (item.icon) {
    notes.push({
      itemKey,
      sourceField: "icon",
      disposition: "carried-as-metadata",
      message: "Governed icon is preserved as migration metadata.",
    });
  }

  if (item.sparkPoints?.length) {
    notes.push({
      itemKey,
      sourceField: "sparkPoints",
      disposition: "carried-as-metadata",
      message: "Governed sparkline points are preserved as migration metadata.",
    });
  }

  if (item.progress) {
    notes.push({
      itemKey,
      sourceField: "progress",
      disposition: "carried-as-metadata",
      message: "Governed progress is preserved as migration metadata.",
    });
  }

  if (item.animateValue !== undefined) {
    notes.push({
      itemKey,
      sourceField: "animateValue",
      disposition: "carried-as-metadata",
      message: "Governed animation preference is preserved as migration metadata.",
    });
  }

  return notes;
}

function adaptGovernedStatItem(
  item: MetadataUiGovernedStatItemInput,
  index: number,
): Readonly<{
  item: MetadataUiStatItemInput;
  parityNotes: readonly MetadataUiGovernedStatParityNote[];
}> {
  const itemKey = createGovernedStatItemKey(item, index);
  const drilldownAction = createGovernedStatDrilldownAction(itemKey, item);
  const comparison = createGovernedStatComparison(item);
  const display: MetadataUiStatItemInput["display"] = {
    animation:
      item.animateValue === false
        ? "off"
        : item.animateValue === true
          ? "respect-user"
          : "respect-user",
    iconKey: item.icon,
    progress: item.progress
      ? {
          value: item.progress.value,
          max: item.progress.max,
          label: item.progress.label,
        }
      : undefined,
    sparkline: item.sparkPoints?.map((point) => ({
      value: point.value,
    })),
  };

  return {
    item: {
      key: itemKey,
      label: item.label,
      value: item.value,
      format: "custom",
      display,
      tone: GOVERNED_STAT_TONE_TO_METADATA_UI_TONE[item.tone ?? "default"],
      comparison,
      drilldown: drilldownAction ? { action: drilldownAction } : undefined,
      thresholds: [],
      telemetry: {
        metricKey: itemKey,
        source: "governed-surface.stat-card",
      },
    },
    parityNotes: collectGovernedStatParityNotes(itemKey, item),
  };
}

export function adaptGovernedStatCardToMetadataUiStat(
  input: MetadataUiGovernedStatAdapterInput,
): MetadataUiGovernedStatAdapterResult {
  const adaptedItems = input.stats.map(adaptGovernedStatItem);
  const stat = parseMetadataUiStat({
    key: input.key ?? "governed.stat-card",
    title: input.title,
    description: input.description,
    layout:
      input.dataNature === "snapshot-summary" || input.stats.length > 4
        ? "row"
        : "grid",
    items: adaptedItems.map((entry) => entry.item),
    presentation: resolveGovernedStatPresentation(input),
    metadata: {
      ...input.metadata,
      migrationSource: "governed-surface.stat-card",
      governedDataNature: input.dataNature ?? "kpi",
    },
  });

  return {
    stat,
    parityNotes: adaptedItems.flatMap((entry) => entry.parityNotes),
  };
}
