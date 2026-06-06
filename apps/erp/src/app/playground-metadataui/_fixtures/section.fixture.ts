import "server-only";

import {
  getMetadataUiSectionIdForKind,
  type MetadataUiSectionKind,
} from "@afenda/metadata-ui";

type MetadataUiPlaygroundNormalizableSection = Readonly<{
  id: string;
  kind: MetadataUiSectionKind;
  title: string;
  description?: string;
  schemaId?: string;
  rendererId?: string;
  metadata?: unknown;
}>;

function mergeMetadataUiPlaygroundSectionDiagnostics(
  metadata: unknown,
  sectionKey: string,
): Record<string, unknown> {
  const baseMetadata =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? (metadata as Record<string, unknown>)
      : {};

  const diagnostics =
    baseMetadata.diagnostics &&
    typeof baseMetadata.diagnostics === "object" &&
    !Array.isArray(baseMetadata.diagnostics)
      ? (baseMetadata.diagnostics as Record<string, unknown>)
      : {};

  return {
    ...baseMetadata,
    diagnostics: {
      ...diagnostics,
      sectionKey,
    },
  };
}

export function normalizeMetadataUiPlaygroundSection<
  Section extends MetadataUiPlaygroundNormalizableSection,
>(section: Section): Section {
  const instanceId = section.id.trim();
  const kind = section.kind;

  return {
    ...section,
    id: getMetadataUiSectionIdForKind(kind),
    schemaId: `metadata-ui.schema.${kind}`,
    rendererId: `metadata-ui.renderer.${kind}`,
    metadata: mergeMetadataUiPlaygroundSectionDiagnostics(
      section.metadata,
      instanceId,
    ),
  };
}

export function normalizeMetadataUiPlaygroundStackSections<
  Item extends Readonly<{ section: MetadataUiPlaygroundNormalizableSection }>,
>(items: readonly Item[]): readonly Item[] {
  return items.map((item) => ({
    ...item,
    section: normalizeMetadataUiPlaygroundSection(item.section),
  }));
}
