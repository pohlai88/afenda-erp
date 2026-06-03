import type {
  AuditPanelModel,
  AuditPanelRow,
} from "../schemas/audit-panel.schema";

export type BuildGovernedAuditRowInput = Omit<AuditPanelRow, "tone"> & {
  tone?: AuditPanelRow["tone"];
};

export type BuildGovernedAuditPanelInput = {
  entityLabel: string;
  entityKind?: string;
  entityId?: string;
  headerTitle?: string;
  headerDescription?: string;
  rows: ReadonlyArray<BuildGovernedAuditRowInput>;
  density?: AuditPanelModel["density"];
  dataNature?: AuditPanelModel["dataNature"];
};

function cleanText(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function buildGovernedAuditRow(
  input: BuildGovernedAuditRowInput,
): AuditPanelRow {
  return {
    ...input,
    tone: input.tone ?? "default",
    occurredAt: input.occurredAt,
    action: cleanText(input.action) ?? "UNKNOWN_ACTION",
    actorLabel: cleanText(input.actorLabel) ?? "System",
    ...(cleanText(input.actorDetail) ? { actorDetail: cleanText(input.actorDetail) } : {}),
    ...(cleanText(input.resourceLabel)
      ? { resourceLabel: cleanText(input.resourceLabel) }
      : {}),
    ...(cleanText(input.narrative) ? { narrative: cleanText(input.narrative) } : {}),
  };
}

export function buildGovernedAuditPanel(
  input: BuildGovernedAuditPanelInput,
): AuditPanelModel {
  const entityLabel = cleanText(input.entityLabel) ?? "Record";
  const context = [input.entityKind, input.entityId]
    .map(cleanText)
    .filter(Boolean)
    .join(" · ");

  return {
    dataNature: input.dataNature ?? "audit-trail",
    headerTitle: input.headerTitle ?? `${entityLabel} — audit`,
    ...(input.headerDescription || context
      ? { headerDescription: input.headerDescription ?? context }
      : {}),
    ...(input.density ? { density: input.density } : {}),
    rows: input.rows.map(buildGovernedAuditRow),
  };
}
