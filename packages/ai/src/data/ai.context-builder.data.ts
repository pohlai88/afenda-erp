import {
  type AssembleAiContextInput,
  type AiContextModuleInput,
} from "../data/ai.context.contract";
import { estimateTokenCount } from "../policies/ai.guardrails.policy";
import {
  aiContextAssemblySchema,
  type AiContextAssembly,
  type AiContextDataCard,
  type GroundedEvidence,
} from "../schemas/ai.operations.schema";

function sanitizeText(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function createMetricCards(module: AiContextModuleInput): AiContextDataCard[] {
  return Object.entries(module.stats ?? {})
    .slice(0, 8)
    .map(([key, value]) => ({
      id: `${module.moduleId}-metric-${key}`,
      moduleId: module.moduleId,
      title: `${module.moduleLabel} ${key}`,
      type: "metric" as const,
      source: "module-stats",
      value: String(value),
      detail: `${module.moduleLabel} reports ${value} for ${key}.`,
      data: { key, value },
    }));
}

function createRecordEvidence(module: AiContextModuleInput) {
  return (module.records ?? []).slice(0, 6).map((record) => ({
    id: `${module.moduleId}-record-${record.id}`,
    moduleId: module.moduleId,
    sourceType: "record" as const,
    sourceId: record.id,
    label: sanitizeText(record.title, 160),
    signal: sanitizeText(
      `${record.reference} ${record.recordType} ${record.status}: ${record.metadataSummary}`,
      400,
    ),
    confidence: 80,
  }));
}

function createCardsAndEvidence(input: AssembleAiContextInput) {
  const dataCards: AiContextDataCard[] = [];
  const evidence: GroundedEvidence[] = [];
  const warnings: string[] = [];

  for (const module of input.modules) {
    dataCards.push({
      id: `${module.moduleId}-summary`,
      moduleId: module.moduleId,
      title: `${module.moduleLabel} summary`,
      type: "summary",
      source: module.dataMode ?? "module-workspace",
      detail: `${module.moduleLabel} is owned by ${module.ownerTeam}.`,
      data: {
        ownerTeam: module.ownerTeam,
        dataMode: module.dataMode ?? "unknown",
      },
    });

    dataCards.push(...createMetricCards(module));

    const recordEvidence = createRecordEvidence(module);
    evidence.push(...recordEvidence);
    dataCards.push(
      ...recordEvidence.map((item) => ({
        id: `${item.id}-card`,
        moduleId: item.moduleId,
        title: item.label,
        type: "record" as const,
        source: item.sourceType,
        detail: item.signal,
        data: { evidenceId: item.id, sourceId: item.sourceId },
      })),
    );

    for (const workItem of (module.workItems ?? []).slice(0, 4)) {
      const signal = sanitizeText(
        `${workItem.status ?? "open"} ${workItem.priority ?? "normal"} work item: ${workItem.subject}`,
        400,
      );
      evidence.push({
        id: `${module.moduleId}-work-${workItem.id}`,
        moduleId: module.moduleId,
        sourceType: "work-item",
        sourceId: workItem.id,
        label: sanitizeText(workItem.subject, 160),
        signal,
        confidence: 75,
      });
      dataCards.push({
        id: `${module.moduleId}-queue-${workItem.id}`,
        moduleId: module.moduleId,
        title: sanitizeText(workItem.subject, 160),
        type: "queue",
        source: "work-item",
        detail: signal,
        data: {
          evidenceId: `${module.moduleId}-work-${workItem.id}`,
          sourceId: workItem.id,
        },
      });
    }

    for (const document of (module.documents ?? []).slice(0, 4)) {
      evidence.push({
        id: `${module.moduleId}-document-${document.id}`,
        moduleId: module.moduleId,
        sourceType: "document",
        sourceId: document.id,
        label: sanitizeText(document.title, 160),
        signal: `${module.moduleLabel} has supporting document ${document.title}.`,
        confidence: 70,
      });
      dataCards.push({
        id: `${module.moduleId}-document-${document.id}-card`,
        moduleId: module.moduleId,
        title: sanitizeText(document.title, 160),
        type: "document",
        source: "document-registry",
        detail: `${module.moduleLabel} supporting document.`,
        data: {
          evidenceId: `${module.moduleId}-document-${document.id}`,
          sourceId: document.id,
        },
      });
    }

    for (const kpi of (module.kpis ?? []).slice(0, 6)) {
      evidence.push({
        id: `${module.moduleId}-kpi-${kpi.id}`,
        moduleId: module.moduleId,
        sourceType: "kpi",
        sourceId: kpi.id,
        label: sanitizeText(kpi.label, 160),
        signal: sanitizeText(kpi.signal, 400),
        confidence: 85,
      });
      dataCards.push({
        id: `${module.moduleId}-kpi-${kpi.id}-card`,
        moduleId: module.moduleId,
        title: sanitizeText(kpi.label, 160),
        type: "kpi",
        source: "module-kpi",
        value: kpi.value,
        detail: sanitizeText(kpi.signal, 400),
        data: {
          evidenceId: `${module.moduleId}-kpi-${kpi.id}`,
          sourceId: kpi.id,
        },
      });
    }

    if ((module.records?.length ?? 0) === 0) {
      warnings.push(
        `${module.moduleLabel} has no persisted records in context.`,
      );
    }
  }

  return { dataCards, evidence, warnings };
}

function buildContextText(dataCards: readonly AiContextDataCard[]) {
  return dataCards
    .map((card) => {
      const value = card.value ? ` value=${card.value}` : "";

      return `[${card.moduleId}] ${card.title} (${card.type}${value}): ${card.detail}`;
    })
    .join("\n");
}

export function assembleAiContext(
  input: AssembleAiContextInput,
): AiContextAssembly {
  const maxTokens = input.maxTokens ?? 4000;
  const { dataCards, evidence, warnings } = createCardsAndEvidence(input);
  const selectedCards = [...dataCards];
  let contextText = buildContextText(selectedCards);
  let estimatedTokens = estimateTokenCount(contextText);
  let truncated = false;

  while (estimatedTokens > maxTokens && selectedCards.length > 1) {
    selectedCards.pop();
    contextText = buildContextText(selectedCards);
    estimatedTokens = estimateTokenCount(contextText);
    truncated = true;
  }

  const selectedCardIds = new Set(selectedCards.map((card) => card.id));
  const selectedEvidenceIds = new Set(
    selectedCards
      .map((card) => card.data?.evidenceId)
      .filter((value): value is string => typeof value === "string"),
  );
  const selectedEvidence = evidence.filter(
    (item) =>
      selectedEvidenceIds.has(item.id) ||
      selectedCardIds.has(`${item.id}-card`) ||
      selectedCardIds.has(`${item.id}`),
  );
  const directSourceCount = selectedEvidence.filter(
    (item) => item.sourceType !== "inference",
  ).length;
  const inferredSourceCount = selectedEvidence.length - directSourceCount;
  const missingData = input.modules
    .filter((module) => (module.records?.length ?? 0) === 0)
    .map(
      (module) => `Add ${module.moduleLabel} records for stronger analysis.`,
    );

  return aiContextAssemblySchema.parse({
    organizationId: input.organizationId,
    generatedAt: new Date().toISOString(),
    contextText: contextText || "No ERP context available.",
    estimatedTokens,
    maxTokens,
    truncated,
    warnings: truncated
      ? [...warnings, "Context was truncated to fit the token budget."]
      : warnings,
    dataCards: selectedCards,
    evidence: selectedEvidence,
    grounding: {
      evidenceCount: selectedEvidence.length,
      directSourceCount,
      inferredSourceCount,
      missingData,
      warnings,
    },
  });
}
