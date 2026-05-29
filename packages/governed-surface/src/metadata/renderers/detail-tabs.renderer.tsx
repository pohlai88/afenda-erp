import { GovernedDetailTabs } from "../../components/governed-detail-tabs";
import { GovernedEmpty } from "../../client";
import { parseGovernedDetailTabsData } from "../../schemas/detail-tabs.schema";
import { governedParseErrorCopy } from "../../i18n/governed-renderer-copy.shared";

import type { GovernedComponentRendererDiagnostics } from "../registry";

/**
 * governed:detail-tabs — entity detail with overview / audit / revisions.
 */
export function DetailTabsRenderer({
  configuration,
  diagnostics = "user",
}: {
  configuration: unknown;
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
        }}
      />
    );
  }

  return <GovernedDetailTabs model={parsed.data} />;
}
