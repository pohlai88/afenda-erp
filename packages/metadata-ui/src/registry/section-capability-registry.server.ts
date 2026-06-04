import "server-only";

import type { MetadataUiSectionKind } from "../contracts/section.contract";
import type { MetadataUiRegisteredServerSectionKind } from "./renderer-registry.server";

export const METADATA_UI_SECTION_CAPABILITY_VALUES = [
  "render",
  "compose",
  "tabulate",
  "summarize",
  "visualize",
  "interact",
  "submit",
  "navigate",
  "audit",
] as const;

export type MetadataUiSectionCapability =
  (typeof METADATA_UI_SECTION_CAPABILITY_VALUES)[number];

export type MetadataUiSectionCapabilityRegistry = Readonly<
  Record<
    MetadataUiRegisteredServerSectionKind,
    readonly MetadataUiSectionCapability[]
  >
>;

export const METADATA_UI_SECTION_CAPABILITY_REGISTRY = {
  list: ["render", "compose", "tabulate", "interact"],
  stat: ["render", "summarize", "navigate"],
  chart: ["render", "visualize"],
  "action-bar": ["render", "compose", "interact", "submit", "navigate"],
  form: ["render", "compose", "interact", "submit"],
  "multi-step-form": ["render", "compose", "interact", "submit", "navigate"],
  "scorecard-form": ["render", "compose", "interact", "submit"],
  kanban: ["render", "compose", "interact"],
  "audit-panel": ["render", "audit"],
  "approval-timeline": ["render", "audit"],
  "detail-tabs": ["render", "compose", "navigate"],
  "page-header": ["render", "compose", "navigate"],
} as const satisfies MetadataUiSectionCapabilityRegistry;

export function hasMetadataUiSectionCapability(
  sectionKind: MetadataUiSectionKind,
  capability: MetadataUiSectionCapability,
): sectionKind is MetadataUiRegisteredServerSectionKind {
  return getMetadataUiSectionCapabilities(sectionKind).includes(capability);
}

export function getMetadataUiSectionCapabilities(
  sectionKind: MetadataUiSectionKind,
): readonly MetadataUiSectionCapability[] {
  if (sectionKind in METADATA_UI_SECTION_CAPABILITY_REGISTRY) {
    return METADATA_UI_SECTION_CAPABILITY_REGISTRY[
      sectionKind as MetadataUiRegisteredServerSectionKind
    ];
  }

  return [];
}
