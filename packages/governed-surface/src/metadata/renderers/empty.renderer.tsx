import { GovernedEmpty } from "../../client";
import { parseEmptyStateData } from "../../schemas/list-surface.schema";
import { governedParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";

import type { GovernedComponentRendererDiagnostics } from "../registry";

/**
 * governed:empty — standalone empty / error / forbidden state.
 */
export function EmptyRenderer({
  configuration,
  diagnostics = "user",
}: {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
}) {
  const parsed = parseEmptyStateData(configuration);
  if (!parsed.success) {
    const copy = governedParseErrorCopy(diagnostics, "empty");
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: copy.title,
          description: copy.description,
        }}
      />
    );
  }
  return <GovernedEmpty model={parsed.data} />;
}
