"use client";

import dynamic from "next/dynamic";

const ErpAssistantPanelLazy = dynamic(
  () =>
    import("./erp-assistant-panel").then((module) => ({
      default: module.ErpAssistantPanel,
    })),
  {
    loading: () => (
      <div className="rounded-section border border-line bg-surface-strong p-4">
        <div className="type-body font-medium text-foreground">Loading assistant</div>
        <div className="mt-2 type-muted">
          Preparing the operator conversation surface.
        </div>
      </div>
    ),
  },
);

export function LazyErpAssistantPanel({
  contextModuleId,
}: {
  contextModuleId?: string;
}) {
  return <ErpAssistantPanelLazy contextModuleId={contextModuleId} />;
}
