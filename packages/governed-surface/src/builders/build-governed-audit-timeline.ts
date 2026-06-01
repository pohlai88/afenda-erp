export type GovernedAuditTimelineEvent = {
  id: string;
  occurredAt: string;
  actorLabel: string;
  eventLabel: string;
  evidenceRef?: string;
  severity?: "info" | "warning" | "critical";
};

export type GovernedAuditTimelineConfiguration = {
  title?: string;
  events: readonly GovernedAuditTimelineEvent[];
  emptyTitle?: string;
};

export function buildGovernedAuditTimeline(
  input: GovernedAuditTimelineConfiguration,
): GovernedAuditTimelineConfiguration {
  return {
    title: input.title ?? "Audit timeline",
    events: input.events,
    emptyTitle: input.emptyTitle ?? "No audit events recorded",
  };
}
