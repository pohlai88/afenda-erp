import type { GovernedChartConfigurationInput } from "../schemas/chart.schema";
import type { ListSurfaceRendererConfigurationResolvedInput } from "../schemas/list-surface-renderer.schema";
import type { StatCardConfigurationResolvedInput } from "../schemas/stat-card.schema";
import { buildGovernedActionBar, type GovernedActionBarConfiguration } from "./build-governed-action-bar";
import { buildGovernedAuditTimeline, type GovernedAuditTimelineConfiguration } from "./build-governed-audit-timeline";
import { buildGovernedEmptyState, type GovernedEmptyStateConfiguration } from "./build-governed-empty-state";
import { buildGovernedExceptionSurface, type GovernedExceptionSurfaceConfiguration } from "./build-governed-exception-surface";

export type GovernedWorkbenchSurfaceConfiguration = {
  surfaceId: string;
  title: string;
  description?: string;
  stats?: readonly StatCardConfigurationResolvedInput[];
  charts?: readonly GovernedChartConfigurationInput[];
  list?: ListSurfaceRendererConfigurationResolvedInput;
  exceptions?: GovernedExceptionSurfaceConfiguration;
  emptyState?: GovernedEmptyStateConfiguration;
  actions?: GovernedActionBarConfiguration;
  audit?: GovernedAuditTimelineConfiguration;
};

/**
 * Page-level composition builder.
 *
 * Features should expose one workbench builder per ERP screen, then compose
 * smaller governed builders inside it.
 */
export function buildGovernedWorkbenchSurface(
  input: GovernedWorkbenchSurfaceConfiguration,
): GovernedWorkbenchSurfaceConfiguration {
  return {
    surfaceId: input.surfaceId,
    title: input.title,
    ...(input.description ? { description: input.description } : {}),
    ...(input.stats?.length ? { stats: input.stats } : {}),
    ...(input.charts?.length ? { charts: input.charts } : {}),
    ...(input.list ? { list: input.list } : {}),
    ...(input.exceptions ? { exceptions: buildGovernedExceptionSurface(input.exceptions) } : {}),
    ...(input.emptyState ? { emptyState: buildGovernedEmptyState(input.emptyState) } : {}),
    ...(input.actions ? { actions: buildGovernedActionBar(input.actions) } : {}),
    ...(input.audit ? { audit: buildGovernedAuditTimeline(input.audit) } : {}),
  };
}
