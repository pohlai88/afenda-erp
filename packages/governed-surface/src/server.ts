import "server-only";

export { resolveGovernedErpPermissionAllowed } from "./data/governed-permission-gate.server";

export type { LogGovernedListSurfaceRenderInput } from "./log-governed-list-surface-render.server";

export {
  ModulePageHeader,
  type ModulePageHeaderProps,
} from "./components/module-page-header";
export {
  GovernedSurface,
  type GovernedSurfaceProps,
} from "./components/governed-surface";
export {
  GovernedSection,
  type GovernedSectionProps,
} from "./components/governed-section";
export {
  GovernedSurfaceSectionCard,
  type GovernedSurfaceSectionCardBody,
  type GovernedSurfaceSectionCardProps,
} from "./components/governed-surface-section-card";
export {
  GovernedPatternCListSection,
  type GovernedPatternCListSectionLayout,
  type GovernedPatternCListSectionProps,
} from "./components/governed-pattern-c-list-section";
export {
  GovernedPatternBListSection,
  type GovernedPatternBListSectionLayout,
  type GovernedPatternBListSectionProps,
} from "./components/governed-pattern-b-list-section";
export {
  GovernedPatternBStatSection,
  governedStatSectionTestId,
  type GovernedPatternBStatGroup,
  type GovernedPatternBStatSectionLayout,
  type GovernedPatternBStatSectionProps,
} from "./components/governed-pattern-b-stat-section";
export {
  GovernedPatternBChartSection,
  governedChartSectionTestId,
  type GovernedPatternBChartSectionLayout,
  type GovernedPatternBChartSectionProps,
} from "./components/governed-pattern-b-chart-section";
export {
  GovernedPatternBApprovalTimelineSection,
  type GovernedPatternBApprovalTimelineSectionLayout,
  type GovernedPatternBApprovalTimelineSectionProps,
} from "./components/governed-pattern-b-approval-timeline-section";
export {
  GovernedPatternBActionBarSection,
  type GovernedPatternBActionBarSectionLayout,
  type GovernedPatternBActionBarSectionProps,
} from "./components/governed-pattern-b-action-bar-section";
export {
  GovernedPatternBMultiStepFormSection,
  type GovernedPatternBMultiStepFormSectionLayout,
  type GovernedPatternBMultiStepFormSectionProps,
} from "./components/governed-pattern-b-multi-step-form-section";
export {
  GovernedPatternBScorecardFormSection,
  type GovernedPatternBScorecardFormSectionLayout,
  type GovernedPatternBScorecardFormSectionProps,
} from "./components/governed-pattern-b-scorecard-form-section";
export {
  GovernedKanbanFooterSection,
  type GovernedKanbanFooterSectionLayout,
  type GovernedKanbanFooterSectionProps,
} from "./components/governed-kanban-footer-section";
/** Same RSC shell — pass `GovernedKanbanDragBoard` as children for `drag-reorder`. */
export {
  GovernedKanbanFooterSection as GovernedKanbanDragSection,
  type GovernedKanbanFooterSectionLayout as GovernedKanbanDragSectionLayout,
  type GovernedKanbanFooterSectionProps as GovernedKanbanDragSectionProps,
} from "./components/governed-kanban-footer-section";
export {
  GovernedKanbanReadOnlyBoard,
  type GovernedKanbanReadOnlyBoardProps,
} from "./components/governed-kanban-read-only-board.client";
export {
  GovernedKanbanFooterBoard,
  type GovernedKanbanFooterBoardProps,
} from "./components/governed-kanban-footer-board.client";
export {
  GovernedKanbanDragBoard,
  type GovernedKanbanDragBoardProps,
} from "./components/governed-kanban-drag-board.client";
export {
  GovernedEmpty,
  type GovernedEmptyProps,
} from "./components/governed-empty";
export {
  GovernedListSurface,
  type GovernedListSurfaceProps,
} from "./components/governed-list-surface";
export {
  ActionFormErrors,
  type ActionFormErrorKind,
  type ActionFormErrorsProps,
} from "./components/action-form-errors";
export {
  GovernedAuditPanel,
  type GovernedAuditPanelProps,
} from "./components/governed-audit-panel";
export {
  GovernedDetailTabs,
  type GovernedDetailTabsProps,
} from "./components/governed-detail-tabs";
