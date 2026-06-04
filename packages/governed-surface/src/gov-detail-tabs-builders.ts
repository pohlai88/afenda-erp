import type {
  GovernedDetailSection,
  GovernedDetailTabKind,
  GovernedDetailTabsInput,
  GovernedRevisionEntry,
} from "./gov-detail-tabs-schema";
import type { AuditPanelRow } from "./gov-audit-panel-schema";

export type BuildGovernedDetailSectionInput = Omit<
  GovernedDetailSection,
  "orderIndex"
> & {
  orderIndex?: number;
};

export type BuildGovernedDetailTabsInput = {
  entityKind: string;
  entityId: string;
  entityLabel: string;
  overview: BuildGovernedDetailSectionInput;
  relations?: ReadonlyArray<BuildGovernedDetailSectionInput>;
  referrers?: ReadonlyArray<BuildGovernedDetailSectionInput>;
  revisions?: ReadonlyArray<GovernedRevisionEntry>;
  audit?: ReadonlyArray<AuditPanelRow>;
  defaultTab?: GovernedDetailTabKind;
};

function cleanText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function withOrderIndexes(
  sections: ReadonlyArray<BuildGovernedDetailSectionInput> | undefined,
): GovernedDetailSection[] | undefined {
  if (!sections?.length) return undefined;
  return sections.map((section, index) => ({
    ...section,
    label: cleanText(section.label) ?? section.id,
    orderIndex: section.orderIndex ?? index + 1,
  }));
}

export function buildGovernedOverviewSection(
  input: BuildGovernedDetailSectionInput,
): GovernedDetailSection {
  return {
    ...input,
    label: cleanText(input.label) ?? "Overview",
    orderIndex: input.orderIndex ?? 1,
  };
}

export function buildGovernedRelationSection(
  input: BuildGovernedDetailSectionInput,
): GovernedDetailSection {
  return {
    ...input,
    label: cleanText(input.label) ?? input.id,
    orderIndex: input.orderIndex ?? 1,
  };
}

export function buildGovernedReferrerSection(
  input: BuildGovernedDetailSectionInput,
): GovernedDetailSection {
  return {
    ...input,
    label: cleanText(input.label) ?? input.id,
    orderIndex: input.orderIndex ?? 1,
  };
}

export function buildGovernedDetailTabs(
  input: BuildGovernedDetailTabsInput,
): GovernedDetailTabsInput {
  return {
    entityKind: input.entityKind,
    entityId: input.entityId,
    entityLabel: input.entityLabel,
    defaultTab: input.defaultTab ?? "overview",
    overview: buildGovernedOverviewSection(input.overview),
    ...(withOrderIndexes(input.relations)
      ? { relations: withOrderIndexes(input.relations) }
      : {}),
    ...(withOrderIndexes(input.referrers)
      ? { referrers: withOrderIndexes(input.referrers) }
      : {}),
    ...(input.revisions?.length ? { revisions: [...input.revisions] } : {}),
    ...(input.audit?.length ? { audit: [...input.audit] } : {}),
  };
}
