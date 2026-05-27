import type { ReactNode } from "react";

import { parseGovernedComponentData } from "../client";
import { toGovernedComponentEnvelopeFromDetailSection } from "../governed-configuration.shared";
import type { GovernedDetailSection } from "../schemas/detail-tabs.schema";

import { GovernedComponentRenderer } from "./render-governed-component";

/**
 * Resolves `rendererKey` to presentation for a governed detail section.
 *
 * `rendererKey` is a free-form string on the schema (e.g. "governed:stat-card",
 * "governed:list-surface"). The discriminated component schema does the type
 * narrowing — anything that does not match a known literal returns null and
 * `GovernedComponentTree` shows the standard "section unavailable" fallback.
 */
export function resolveGovernedDetailSectionContent(
  section: GovernedDetailSection,
): ReactNode {
  const parsed = parseGovernedComponentData(
    toGovernedComponentEnvelopeFromDetailSection(section),
  );
  if (!parsed.success) {
    return null;
  }

  return <GovernedComponentRenderer component={parsed.data} />;
}
