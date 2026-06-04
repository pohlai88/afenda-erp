/**
 * @afenda/metadata-ui/server
 * Server door — registries, renderers, sections, security, shell.
 */
import "server-only";

export * from "./shell/section-shell.server";
export * from "./shell/section-body-resolver.server";
export * from "./shell/section-card.server";
export * from "./shell/heading.server";
export * from "./shell/empty-state.server";
export * from "./primitives/action-button.server";
export * from "./primitives/badge.server";
export * from "./primitives/card.server";
export * from "./primitives/empty.server";
export * from "./primitives/field.server";
export * from "./primitives/list-toolbar.server";
export * from "./primitives/table.server";
export * from "./primitives/tabs.server";
export * from "./registry/component-registry.server";
export * from "./registry/renderer-registry.server";
export * from "./registry/section-capability-registry.server";
export * from "./runtime/renderer-context.server";
export * from "./runtime/resolve-renderer.server";
export * from "./sections/list/list-section.server";
export * from "./sections/list/list-renderer.server";
export * from "./sections/stat/stat-section.server";
export * from "./sections/stat/stat-renderer.server";
export * from "./sections/chart/chart-section.server";
export * from "./sections/chart/chart-renderer.server";
export * from "./sections/action-bar/action-bar-section.server";
export * from "./sections/action-bar/action-bar-renderer.server";
export * from "./sections/form/form-section.server";
export * from "./sections/form/form-renderer.server";
export * from "./sections/multi-step-form/multi-step-form-section.server";
export * from "./sections/multi-step-form/multi-step-form-renderer.server";
export * from "./sections/scorecard-form/scorecard-form-section.server";
export * from "./sections/scorecard-form/scorecard-form-renderer.server";
export * from "./sections/kanban/kanban-section.server";
export * from "./sections/kanban/kanban-renderer.server";
export * from "./sections/audit-panel/audit-panel-section.server";
export * from "./sections/audit-panel/audit-panel-renderer.server";
export * from "./sections/approval-timeline/approval-timeline-section.server";
export * from "./sections/approval-timeline/approval-timeline-renderer.server";
export * from "./sections/detail-tabs/detail-tabs-section.server";
export * from "./sections/detail-tabs/detail-tabs-renderer.server";
export * from "./sections/page-header/page-header.server";
export * from "./security/permission-gate.server";
export * from "./security/permission-resolver.server";
export * from "./renderers/render-component.server";
export * from "./renderers/render-section.server";
export * from "./renderers/render-stack.server";
export * from "./renderers/render-child-tree.server";
export * from "./server-actions/action-policy.server";
export * from "./server-actions/action-registry.server";
export * from "./server-actions/action-submit.action";
export * from "./logging/render-log.server";
export * from "./logging/list-render-log.server";
