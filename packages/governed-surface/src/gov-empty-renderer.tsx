import { GovernedEmpty } from "./client";
import { parseEmptyStateData } from "../../schemas/list-surface.schema";
import { governedParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";

import type { RendererProps } from "../governed-renderer-dispatch";
import type { GovernedComponentRendererDiagnostics } from "./gov-registry";

type EmptyRendererProps = Omit<
  RendererProps,
  "componentType" | "diagnostics"
> & {
  componentType?: string;
  diagnostics?: GovernedComponentRendererDiagnostics;
};

/**
 * governed:empty — standalone empty / error / forbidden state.
 */
export function EmptyRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
}: EmptyRendererProps) {
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
        surfaceKey={surfaceKey}
        sectionKey={sectionKey}
        componentKey={componentKey ?? sectionKey ?? surfaceKey}
        renderState="invalid"
      />
    );
  }
  return (
    <GovernedEmpty
      model={parsed.data}
      surfaceKey={surfaceKey}
      sectionKey={sectionKey}
      componentKey={componentKey ?? sectionKey ?? surfaceKey}
    />
  );
}
