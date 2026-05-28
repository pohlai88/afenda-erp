import type { ReactNode } from "react";

import { GovernedEmpty } from "../client";
import { toGovernedComponentEnvelopeFromDetailSection } from "../governed-configuration.shared";
import type { GovernedDetailSection } from "../schemas/detail-tabs.schema";

import { GovernedComponentRenderer } from "./render-governed-component";

/**
 * Resolves `rendererKey` to presentation for a governed detail section.
 *
 * `rendererKey` is a free-form string on the schema (e.g. "governed:stat-card",
 * "governed:list-surface"). The discriminated component schema does the type
 * narrowing — anything that does not match a known renderer type shows the
 * "section unavailable" fallback via `GovernedComponentTree`.
 *
 * Delegates all validation and error rendering to `GovernedComponentRenderer`
 * (which wraps `GovernedComponentTree`) so diagnostic copy is always consistent.
 */
export function resolveGovernedDetailSectionContent(
  section: GovernedDetailSection,
): ReactNode {
  try {
    const envelope = toGovernedComponentEnvelopeFromDetailSection(section);
    return <GovernedComponentRenderer component={envelope} />;
  } catch {
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: "Section unavailable",
          description: "This section could not be loaded safely.",
        }}
      />
    );
  }
}
