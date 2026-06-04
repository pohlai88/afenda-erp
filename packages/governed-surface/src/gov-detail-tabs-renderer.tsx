import { GovernedDetailTabs } from "../../components/governed-detail-tabs";
import { GovernedEmpty } from "./client";
import { parseGovernedDetailTabsData } from "./gov-detail-tabs-schema";
import { governedParseErrorCopy } from "../i18n/governed-renderer-copy.shared";

import type { GovernedComponentRendererDiagnostics } from "./gov-registry";
import type { RendererProps } from "../governed-renderer-dispatch";

/**
 * governed:detail-tabs — entity detail with overview / audit / revisions.
 */
export function DetailTabsRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
}: RendererProps & {
  diagnostics?: GovernedComponentRendererDiagnostics;
}) {
  const parsed = parseGovernedDetailTabsData(configuration);

  if (!parsed.success) {
    const copy = governedParseErrorCopy(diagnostics, "detailTabs");
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: copy.title,
          description: copy.description,
          emptyId: "detail-tabs-parse-error",
        }}
      />
    );
  }

  return (
    <GovernedDetailTabs
      model={parsed.data}
      surfaceKey={surfaceKey}
      sectionKey={sectionKey}
      componentKey={componentKey ?? sectionKey ?? surfaceKey ?? parsed.data.entityId}
    />
  );
}
