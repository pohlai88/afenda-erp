/**
 * Server-only public door — RSC sections and server helpers.
 * Shared schemas/builders: `@afenda/governed-surface` (index.ts).
 * Client components: `@afenda/governed-surface/client`.
 */
import "server-only";

export * from "./build-list-surface-table-props.shared";
export * from "./resolve-metadata-section-body.server";
export * from "./log-governed-list-surface-render.server";
export * from "./gov-governed-permission-gate-server";
export * from "./gov-list-surface-trailing-action-server";

export * from "./gov-governed-heading.server";
export * from "./gov-governed-kanban-footer-section";
export * from "./gov-governed-pattern-b-action-bar-section";
export * from "./gov-governed-pattern-b-approval-timeline-section";
export * from "./gov-governed-pattern-b-chart-section";
export * from "./gov-governed-pattern-b-multi-step-form-section";
export * from "./gov-governed-pattern-b-scorecard-form-section";
export * from "./gov-governed-pattern-b-stat-section";
export * from "./gov-governed-pattern-c-list-section";

export * from "./gov-list-surface-renderer";
export * from "./gov-list-surface-table";
export * from "./gov-render-governed-component";
