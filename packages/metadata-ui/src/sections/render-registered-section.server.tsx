import "server-only";

import type { ReactNode } from "react";

import type { MetadataUiRenderSectionState } from "../renderers/render-section.server";
import { MetadataUiActionBarRenderer } from "./action-bar/action-bar-renderer.server";
import { MetadataUiApprovalTimelineRenderer } from "./approval-timeline/approval-timeline-renderer.server";
import { MetadataUiAuditPanelRenderer } from "./audit-panel/audit-panel-renderer.server";
import { MetadataUiChartRenderer } from "./chart/chart-renderer.server";
import { MetadataUiDetailTabsRenderer } from "./detail-tabs/detail-tabs-renderer.server";
import { MetadataUiFormRenderer } from "./form/form-renderer.server";
import { MetadataUiKanbanRenderer } from "./kanban/kanban-renderer.server";
import { MetadataUiListRenderer } from "./list/list-renderer.server";
import { MetadataUiMultiStepFormRenderer } from "./multi-step-form/multi-step-form-renderer.server";
import { MetadataUiPageHeaderRenderer } from "./page-header/page-header-renderer.server";
import { MetadataUiScorecardFormRenderer } from "./scorecard-form/scorecard-form-renderer.server";
import { MetadataUiStatRenderer } from "./stat/stat-renderer.server";

export type MetadataUiRegisteredSectionDispatchState =
  MetadataUiRenderSectionState;

export function renderMetadataUiRegisteredSection(
  state: MetadataUiRegisteredSectionDispatchState,
): ReactNode {
  if (state.children) {
    return state.children;
  }

  const metadata = state.section.metadata as never;

  switch (state.renderer.id) {
    case "metadata-ui.renderer.action-bar":
      return <MetadataUiActionBarRenderer metadata={metadata} />;
    case "metadata-ui.renderer.approval-timeline":
      return <MetadataUiApprovalTimelineRenderer metadata={metadata} />;
    case "metadata-ui.renderer.audit-panel":
      return <MetadataUiAuditPanelRenderer metadata={metadata} />;
    case "metadata-ui.renderer.chart":
      return <MetadataUiChartRenderer metadata={metadata} />;
    case "metadata-ui.renderer.detail-tabs":
      return <MetadataUiDetailTabsRenderer metadata={metadata} />;
    case "metadata-ui.renderer.form":
      return <MetadataUiFormRenderer metadata={metadata} />;
    case "metadata-ui.renderer.kanban":
      return <MetadataUiKanbanRenderer metadata={metadata} />;
    case "metadata-ui.renderer.list":
      return <MetadataUiListRenderer metadata={metadata} rows={state.rows} />;
    case "metadata-ui.renderer.multi-step-form":
      return <MetadataUiMultiStepFormRenderer metadata={metadata} />;
    case "metadata-ui.renderer.page-header":
      return <MetadataUiPageHeaderRenderer metadata={metadata} />;
    case "metadata-ui.renderer.scorecard-form":
      return <MetadataUiScorecardFormRenderer metadata={metadata} />;
    case "metadata-ui.renderer.stat":
      return <MetadataUiStatRenderer metadata={metadata} />;
    default:
      throw new Error(
        `Metadata UI renderer "${state.renderer.id}" is registered but has no section dispatcher.`,
      );
  }
}
