import { buildGovernedActionBar, type GovernedActionBarConfiguration } from "./build-governed-action-bar";
import { buildGovernedAuditTimeline, type GovernedAuditTimelineConfiguration } from "./build-governed-audit-timeline";

export type GovernedDetailField = {
  label: string;
  value: string | number | boolean | null;
  helperText?: string;
};

export type GovernedDetailSection = {
  id: string;
  title: string;
  fields: readonly GovernedDetailField[];
};

export type GovernedDetailSurfaceConfiguration = {
  surfaceId: string;
  title: string;
  subtitle?: string;
  statusLabel?: string;
  sections: readonly GovernedDetailSection[];
  actions?: GovernedActionBarConfiguration;
  audit?: GovernedAuditTimelineConfiguration;
};

export function buildGovernedDetailSurface(
  input: GovernedDetailSurfaceConfiguration,
): GovernedDetailSurfaceConfiguration {
  return {
    surfaceId: input.surfaceId,
    title: input.title,
    ...(input.subtitle ? { subtitle: input.subtitle } : {}),
    ...(input.statusLabel ? { statusLabel: input.statusLabel } : {}),
    sections: input.sections,
    ...(input.actions ? { actions: buildGovernedActionBar(input.actions) } : {}),
    ...(input.audit ? { audit: buildGovernedAuditTimeline(input.audit) } : {}),
  };
}
