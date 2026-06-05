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

  switch (state.section.kind) {
    case "action-bar":
      return <MetadataUiActionBarRenderer metadata={metadata} />;
    case "approval-timeline":
      return <MetadataUiApprovalTimelineRenderer metadata={metadata} />;
    case "audit-panel":
      return <MetadataUiAuditPanelRenderer metadata={metadata} />;
    case "chart":
      return <MetadataUiChartRenderer metadata={metadata} />;
    case "detail-tabs":
      return <MetadataUiDetailTabsRenderer metadata={metadata} />;
    case "form":
      return <MetadataUiFormRenderer metadata={metadata} />;
    case "kanban":
      return <MetadataUiKanbanRenderer metadata={metadata} />;
    case "list":
      return <MetadataUiListRenderer metadata={metadata} rows={state.rows} />;
    case "multi-step-form":
      return <MetadataUiMultiStepFormRenderer metadata={metadata} />;
    case "page-header":
      return <MetadataUiPageHeaderRenderer metadata={metadata} />;
    case "scorecard-form":
      return <MetadataUiScorecardFormRenderer metadata={metadata} />;
    case "stat":
      return <MetadataUiStatRenderer metadata={metadata} />;
    case "custom":
      return null;
  }
}
