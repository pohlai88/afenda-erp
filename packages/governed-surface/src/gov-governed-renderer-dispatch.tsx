import type { ReactNode } from "react";

import { GovernedEmpty } from "./gov-governed-empty";
import { governedDispatchErrorCopy } from "./gov-governed-renderer-copy-shared";

import type {
  AfendaGovernedRendererId,
  GovernedComponentRendererDiagnostics,
} from "./gov-registry";
import { ActionBarRenderer } from "./gov-action-bar-renderer";
import { AuditPanelRenderer } from "./gov-audit-panel-renderer";
import { DetailTabsRenderer } from "./gov-detail-tabs-renderer";
import { ApprovalTimelineRenderer } from "./gov-approval-timeline-renderer";
import { ChartRenderer } from "./gov-chart-renderer";
import { EmptyRenderer } from "./gov-empty-renderer";
import { KanbanBoardRenderer } from "./gov-kanban-board-renderer";
import { MultiStepFormRenderer } from "./gov-multi-step-form-renderer";
import { ScorecardFormRenderer } from "./gov-scorecard-form-renderer";
import { ListSurfaceRenderer } from "./gov-list-surface-renderer";
import { SectionRenderer } from "./gov-section-renderer";
import { StackRenderer } from "./gov-stack-renderer";
import { StatCardRenderer } from "./gov-stat-card-renderer";

export type RendererProps = {
  configuration: unknown;
  diagnostics: GovernedComponentRendererDiagnostics;
  /** Governed component type literal — forwarded for telemetry and error context. */
  componentType: string;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

export type RenderGovernedRendererArgs = {
  rendererId: AfendaGovernedRendererId;
  componentType: string;
  configuration: unknown;
  diagnostics: GovernedComponentRendererDiagnostics;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

/**
 * Maps registered renderer IDs to their renderer components.
 *
 * `Partial<Record<...>>` is intentional: renderer IDs are declared in
 * `AfendaGovernedRendererId` before their implementation files exist.
 * `renderGovernedRendererById` handles the undefined case.
 * Switch to `Record<AfendaGovernedRendererId, ...>` once all renderers ship.
 */
const GOVERNED_RENDERERS = {
  "stat-card": StatCardRenderer,
  "list-surface": ListSurfaceRenderer,
  section: SectionRenderer,
  stack: StackRenderer,
  empty: EmptyRenderer,
  "action-bar": ActionBarRenderer,
  "audit-panel": AuditPanelRenderer,
  "detail-tabs": DetailTabsRenderer,
  "approval-timeline": ApprovalTimelineRenderer,
  chart: ChartRenderer,
  "kanban-board": KanbanBoardRenderer,
  "multi-step-form": MultiStepFormRenderer,
  "scorecard-form": ScorecardFormRenderer,
} satisfies Partial<
  Record<AfendaGovernedRendererId, (props: RendererProps) => ReactNode>
>;

export function renderGovernedRendererById({
  rendererId,
  componentType,
  configuration,
  diagnostics,
  surfaceKey,
  sectionKey,
  componentKey,
}: RenderGovernedRendererArgs): ReactNode {
  // `satisfies` preserves the narrow concrete renderer types, so the lookup
  // returns a union of specific function signatures. Cast to the shared
  // RendererProps contract — safe because `satisfies` already validated each entry.
  const Renderer = GOVERNED_RENDERERS[
    rendererId as keyof typeof GOVERNED_RENDERERS
  ] as ((props: RendererProps) => ReactNode) | undefined;

  if (!Renderer) {
    const copy = governedDispatchErrorCopy(
      diagnostics,
      "unregistered",
      `Renderer "${rendererId}" is not yet implemented.`,
    );
    return (
      <GovernedEmpty
        model={{
          variant: "muted",
          title: copy.title,
          description: copy.description,
        }}
      />
    );
  }

  return (
    <Renderer
      configuration={configuration}
      diagnostics={diagnostics}
      componentType={componentType}
      surfaceKey={surfaceKey}
      sectionKey={sectionKey}
      componentKey={componentKey}
    />
  );
}
