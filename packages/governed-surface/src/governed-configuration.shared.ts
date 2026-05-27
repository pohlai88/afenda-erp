import { z } from "zod";

import type { GovernedDetailSection } from "./schemas/detail-tabs.schema";
import type { GovernedComponentRendererInput } from "./metadata/registry";

const configurationDataNatureProbeSchema = z
  .object({
    dataNature: z.string().optional(),
  })
  .passthrough();

/**
 * Reads `dataNature` from a renderer configuration blob without full Zod parse.
 * Container-only renderers omit the field; invalid shapes yield `undefined`.
 */
export function extractGovernedConfigurationDataNature(
  configuration: unknown,
): string | undefined {
  const parsed = configurationDataNatureProbeSchema.safeParse(configuration);
  if (!parsed.success) {
    return undefined;
  }

  const { dataNature } = parsed.data;
  return typeof dataNature === "string" && dataNature.length > 0
    ? dataNature
    : undefined;
}

/** Maps a detail-tab section to the governed component envelope the kernel expects. */
export function toGovernedComponentEnvelopeFromDetailSection(
  section: GovernedDetailSection,
): GovernedComponentRendererInput {
  return {
    type: section.rendererKey,
    serverType: section.rendererKey,
    configuration: section.rendererProps,
  };
}
